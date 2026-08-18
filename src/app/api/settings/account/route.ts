import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(req: NextRequest) {
  console.log("[ACCOUNT_DELETE][START] Request received");

  try {
    // 1. Authenticate request server-side using active Supabase session.
    // NEVER trust a user_id supplied in client request body.
    const supabase = await createClient();
    const {
      data: { user },
      error: authUserError,
    } = await supabase.auth.getUser();

    if (authUserError || !user) {
      console.log("[ACCOUNT_DELETE][AUTH][FAIL] Unauthorized request: missing or invalid session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;
    console.log(`[ACCOUNT_DELETE][AUTH] Authenticated user ID: ${userId}`);

    const body = await req.json().catch(() => ({}));
    const { confirmation } = body;
    const isConfirmationValid = confirmation === "DELETE";
    console.log(`[ACCOUNT_DELETE][AUTH] Confirmation text valid: ${isConfirmationValid}`);

    if (!isConfirmationValid) {
      return NextResponse.json(
        { error: "Confirmation text must be 'DELETE' to permanently delete your account." },
        { status: 400 }
      );
    }

    // 2. Initialize server-only Supabase admin client (throws if SUPABASE_SERVICE_ROLE_KEY is missing)
    const { adminClient } = createAdminClient();

    // Verify admin Auth access before performing database modifications
    console.log(`[ACCOUNT_DELETE][ADMIN] Testing admin auth access for user ID: ${userId}`);
    const { data: adminUserData, error: adminAuthCheckErr } = await adminClient.auth.admin.getUserById(userId);

    if (adminAuthCheckErr || !adminUserData?.user) {
      console.error("[ACCOUNT_DELETE][ADMIN][FAIL] Admin auth lookup failed:", adminAuthCheckErr?.message);
      throw new Error(`Admin service role access error: ${adminAuthCheckErr?.message || "User not found"}`);
    }
    console.log("[ACCOUNT_DELETE][ADMIN][SUCCESS] Admin client verified and user found in auth.users");

    // Primary database client for admin operations
    const db: any = adminClient;

    // Helper: Execute delete call with strict error logging
    const deleteStage = async (
      stageName: string,
      queryFn: () => PromiseLike<{ error: any; count?: number | null }>
    ) => {
      console.log(`[ACCOUNT_DELETE][DATABASE] Deleting ${stageName}...`);
      const { error, count } = await queryFn();
      if (error) {
        console.error(`[ACCOUNT_DELETE][DATABASE][FAIL]`, {
          stage: stageName,
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        throw new Error(`Failed during ${stageName}: ${error.message}`);
      }
      console.log(`[ACCOUNT_DELETE][DATABASE][SUCCESS] ${stageName} (${count ?? 0} rows affected)`);
    };

    // 3. Identify all workspaces owned by the user
    console.log("[ACCOUNT_DELETE][DATABASE] Fetching user workspace IDs");
    const { data: userWorkspaces, error: wsFetchErr } = await db
      .from("workspaces")
      .select("id")
      .eq("owner_id", userId);

    if (wsFetchErr) {
      console.error("[ACCOUNT_DELETE][DATABASE][FAIL]", {
        stage: "fetch_workspaces",
        message: wsFetchErr.message,
        code: wsFetchErr.code,
        details: wsFetchErr.details,
        hint: wsFetchErr.hint,
      });
      throw new Error(`Failed to fetch workspaces: ${wsFetchErr.message}`);
    }

    const workspaceIds = (userWorkspaces || []).map((w: { id: string }) => w.id);
    console.log(`[ACCOUNT_DELETE][DATABASE] User owns ${workspaceIds.length} workspace(s):`, workspaceIds);

    // 4. Collect and remove user storage objects
    console.log("[ACCOUNT_DELETE][STORAGE] Deleting storage files");
    let docStoragePaths: string[] = [];

    if (workspaceIds.length > 0) {
      const { data: docs } = await db
        .from("uploaded_documents")
        .select("storage_path")
        .in("workspace_id", workspaceIds);
      if (docs) {
        docStoragePaths = docs.map((d: { storage_path: string }) => d.storage_path).filter(Boolean);
      }
    }

    const { data: userDocs } = await db
      .from("uploaded_documents")
      .select("storage_path")
      .eq("uploader_id", userId);

    if (userDocs) {
      userDocs.forEach((d: { storage_path: string }) => {
        if (d.storage_path && !docStoragePaths.includes(d.storage_path)) {
          docStoragePaths.push(d.storage_path);
        }
      });
    }

    if (docStoragePaths.length > 0) {
      try {
        const { error: docStorageErr } = await db.storage.from("documents").remove(docStoragePaths);
        if (docStorageErr) {
          console.error("[ACCOUNT_DELETE][STORAGE][FAIL]", { bucket: "documents", message: docStorageErr.message });
          throw new Error(`Storage error (documents): ${docStorageErr.message}`);
        } else {
          console.log(`[ACCOUNT_DELETE][STORAGE][SUCCESS] Removed ${docStoragePaths.length} file(s) from 'documents' storage bucket`);
        }
      } catch (storageErr: any) {
        console.error("[ACCOUNT_DELETE][STORAGE][FAIL] Document storage cleanup error:", storageErr?.message);
        throw storageErr;
      }
    }

    const buckets = ["avatars", "covers", "attachments"] as const;
    for (const bucket of buckets) {
      try {
        const { data: files } = await db.storage.from(bucket).list(userId);
        if (files && files.length > 0) {
          const paths = files.map((f: { name: string }) => `${userId}/${f.name}`);
          const { error: bucketErr } = await db.storage.from(bucket).remove(paths);
          if (bucketErr) {
            console.error("[ACCOUNT_DELETE][STORAGE][FAIL]", { bucket, message: bucketErr.message });
            throw new Error(`Storage error (${bucket}): ${bucketErr.message}`);
          } else {
            console.log(`[ACCOUNT_DELETE][STORAGE][SUCCESS] Removed ${paths.length} file(s) from '${bucket}' storage bucket`);
          }
        }
      } catch (err: any) {
        console.error("[ACCOUNT_DELETE][STORAGE][FAIL] Bucket cleanup error:", err?.message);
        throw err;
      }
    }
    console.log("[ACCOUNT_DELETE][STORAGE][SUCCESS] Storage cleanup finished");

    // 5. Reverse-dependency cascade database deletion across all ASP tables
    // Level 1: Leaf child tables
    if (workspaceIds.length > 0) {
      // Task reminders
      const { data: wsTasks } = await db.from("tasks").select("id").in("workspace_id", workspaceIds);
      const taskIds = (wsTasks || []).map((t: { id: string }) => t.id);
      if (taskIds.length > 0) {
        await deleteStage("reminders", async () => await db.from("reminders").delete({ count: "exact" }).in("task_id", taskIds));
      }

      // Notebook blocks & pages
      const { data: wsNotebooks } = await db.from("notebooks").select("id").in("workspace_id", workspaceIds);
      const notebookIds = (wsNotebooks || []).map((n: { id: string }) => n.id);
      if (notebookIds.length > 0) {
        const { data: nbPages } = await db.from("pages").select("id").in("notebook_id", notebookIds);
        const pageIds = (nbPages || []).map((p: { id: string }) => p.id);
        if (pageIds.length > 0) {
          await deleteStage("blocks", async () => await db.from("blocks").delete({ count: "exact" }).in("page_id", pageIds));
        }
        await deleteStage("pages", async () => await db.from("pages").delete({ count: "exact" }).in("notebook_id", notebookIds));
      }

      await deleteStage("document_chunks", async () => await db.from("document_chunks").delete({ count: "exact" }).in("workspace_id", workspaceIds));
      await deleteStage("uploaded_documents (workspace)", async () => await db.from("uploaded_documents").delete({ count: "exact" }).in("workspace_id", workspaceIds));
      await deleteStage("notebooks", async () => await db.from("notebooks").delete({ count: "exact" }).in("workspace_id", workspaceIds));
      await deleteStage("tasks (workspace)", async () => await db.from("tasks").delete({ count: "exact" }).in("workspace_id", workspaceIds));
    }

    // Quizzes & Attempts
    const { data: userAttempts } = await db.from("quiz_attempts").select("id").eq("user_id", userId);
    const attemptIds = (userAttempts || []).map((a: { id: string }) => a.id);
    if (attemptIds.length > 0) {
      await deleteStage("quiz_attempt_answers", async () => await db.from("quiz_attempt_answers").delete({ count: "exact" }).in("attempt_id", attemptIds));
    }
    await deleteStage("quiz_attempts", async () => await db.from("quiz_attempts").delete({ count: "exact" }).eq("user_id", userId));
    await deleteStage("quiz_questions", async () => await db.from("quiz_questions").delete({ count: "exact" }).eq("user_id", userId));
    await deleteStage("quizzes", async () => await db.from("quizzes").delete({ count: "exact" }).eq("user_id", userId));

    // Flashcards
    await deleteStage("flashcard_reviews", async () => await db.from("flashcard_reviews").delete({ count: "exact" }).eq("user_id", userId));
    await deleteStage("flashcards", async () => await db.from("flashcards").delete({ count: "exact" }).eq("user_id", userId));
    await deleteStage("flashcard_decks", async () => await db.from("flashcard_decks").delete({ count: "exact" }).eq("user_id", userId));

    // AI Conversations & Chat
    const { data: userConvs } = await db.from("ai_conversations").select("id").eq("user_id", userId);
    const convIds = (userConvs || []).map((c: { id: string }) => c.id);
    if (convIds.length > 0) {
      await deleteStage("ai_chat_messages", async () => await db.from("ai_chat_messages").delete({ count: "exact" }).in("conversation_id", convIds));
    }
    await deleteStage("ai_conversations", async () => await db.from("ai_conversations").delete({ count: "exact" }).eq("user_id", userId));
    await deleteStage("chat_history", async () => await db.from("chat_history").delete({ count: "exact" }).eq("user_id", userId));

    // Planner & Calendar & Study Sessions & Documents
    await deleteStage("calendar_events", async () => await db.from("calendar_events").delete({ count: "exact" }).eq("user_id", userId));
    await deleteStage("study_sessions", async () => await db.from("study_sessions").delete({ count: "exact" }).eq("user_id", userId));
    await deleteStage("uploaded_documents (uploader)", async () => await db.from("uploaded_documents").delete({ count: "exact" }).eq("uploader_id", userId));

    // Workspaces
    await deleteStage("workspaces", async () => await db.from("workspaces").delete({ count: "exact" }).eq("owner_id", userId));

    // Preferences & Settings & Analytics & Profile
    await deleteStage("analytics", async () => await db.from("analytics").delete({ count: "exact" }).eq("user_id", userId));
    await deleteStage("support_feedback", async () => await db.from("support_feedback").delete({ count: "exact" }).eq("user_id", userId));
    await deleteStage("notifications", async () => await db.from("notifications").delete({ count: "exact" }).eq("user_id", userId));
    await deleteStage("notification_preferences", async () => await db.from("notification_preferences").delete({ count: "exact" }).eq("user_id", userId));
    await deleteStage("user_preferences", async () => await db.from("user_preferences").delete({ count: "exact" }).eq("user_id", userId));
    await deleteStage("profiles", async () => await db.from("profiles").delete({ count: "exact" }).eq("user_id", userId));

    // 6. Supabase Auth User record deletion
    console.log("[ACCOUNT_DELETE][AUTH_DELETE] Executing admin.auth.admin.deleteUser");
    const { error: delAuthErr } = await adminClient.auth.admin.deleteUser(userId);
    if (delAuthErr) {
      console.error("[ACCOUNT_DELETE][AUTH_DELETE][FAIL]", {
        message: delAuthErr.message,
        code: (delAuthErr as any).code,
        status: (delAuthErr as any).status,
      });
      throw new Error(`Auth admin deleteUser failed: ${delAuthErr.message}`);
    }
    console.log("[ACCOUNT_DELETE][AUTH_DELETE][SUCCESS] Auth user removed from Supabase auth.users");

    // Verify Auth user deletion via post-check
    const { data: postCheckUser } = await adminClient.auth.admin.getUserById(userId);
    if (postCheckUser?.user) {
      console.error("[ACCOUNT_DELETE][AUTH_DELETE][FAIL] User record still exists in auth.users after deleteUser call");
      throw new Error("Post-delete Auth verification failed: User record still exists in auth.users");
    }
    console.log("[ACCOUNT_DELETE][AUTH_DELETE][SUCCESS] Verified auth.users record is gone");

    // 7. Mandatory Post-Deletion Database Verification
    console.log("[ACCOUNT_DELETE][VERIFY] Running post-deletion database verification queries");
    const checkCounts = await Promise.all([
      db.from("profiles").select("id", { count: "exact", head: true }).eq("user_id", userId),
      db.from("workspaces").select("id", { count: "exact", head: true }).eq("owner_id", userId),
      db.from("user_preferences").select("id", { count: "exact", head: true }).eq("user_id", userId),
      db.from("study_sessions").select("id", { count: "exact", head: true }).eq("user_id", userId),
      db.from("quizzes").select("id", { count: "exact", head: true }).eq("user_id", userId),
      db.from("flashcards").select("id", { count: "exact", head: true }).eq("user_id", userId),
    ]);

    const remainingProfiles = checkCounts[0].count || 0;
    const remainingWorkspaces = checkCounts[1].count || 0;

    console.log(`[ACCOUNT_DELETE][VERIFY] Remaining rows -> profiles: ${remainingProfiles}, workspaces: ${remainingWorkspaces}`);

    if (remainingProfiles > 0 || remainingWorkspaces > 0) {
      console.error("[ACCOUNT_DELETE][VERIFY][FAIL] User data still present after purge!");
      throw new Error(`Purge incomplete: ${remainingProfiles} profiles and ${remainingWorkspaces} workspaces remain.`);
    }

    console.log("[ACCOUNT_DELETE][VERIFY][SUCCESS] Zero user-owned records remain");

    // 8. Sign out active session
    await supabase.auth.signOut();

    console.log("[ACCOUNT_DELETE][SUCCESS] Complete account deletion succeeded");
    return NextResponse.json({
      success: true,
      message: "Account and associated data deleted.",
    });
  } catch (err: any) {
    console.error("[ACCOUNT_DELETE][FAIL] Fatal error during account purge:", err?.message || err);
    return NextResponse.json(
      { error: "Unable to completely delete your account. Please try again." },
      { status: 500 }
    );
  }
}
