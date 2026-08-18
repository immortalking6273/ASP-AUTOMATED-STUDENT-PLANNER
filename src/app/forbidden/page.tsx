import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-foreground text-center">
      <div className="mb-4 rounded-2xl bg-destructive/10 p-4 text-destructive">
        <ShieldAlert className="h-12 w-12" />
      </div>
      <span className="text-sm font-semibold uppercase tracking-widest text-destructive">403 Error</span>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Access Forbidden</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        You do not have the required permissions to view this resource.
      </p>
      <div className="mt-6">
        <Link href={ROUTES.DASHBOARD}>
          <Button variant="outline">Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
