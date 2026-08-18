import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-foreground text-center">
      <div className="mb-4 rounded-2xl bg-muted p-4 text-muted-foreground">
        <FileQuestion className="h-12 w-12 text-primary" />
      </div>
      <span className="text-sm font-semibold uppercase tracking-widest text-primary">404 Error</span>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Page Not Found</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Sorry, the page you are looking for does not exist or has been moved to another location.
      </p>
      <div className="mt-6">
        <Link href={ROUTES.DASHBOARD}>
          <Button leftIcon={<ArrowLeft className="h-4 w-4" />}>Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
