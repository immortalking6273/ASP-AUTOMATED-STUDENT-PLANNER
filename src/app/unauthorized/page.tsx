import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-foreground text-center">
      <div className="mb-4 rounded-2xl bg-amber-500/10 p-4 text-amber-500">
        <Lock className="h-12 w-12" />
      </div>
      <span className="text-sm font-semibold uppercase tracking-widest text-amber-500">401 Error</span>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Authentication Required</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        You must be signed in to access this page. Sign-in features will be enabled in Module 2.
      </p>
      <div className="mt-6">
        <Link href={ROUTES.HOME}>
          <Button variant="outline">Return Home</Button>
        </Link>
      </div>
    </div>
  );
}
