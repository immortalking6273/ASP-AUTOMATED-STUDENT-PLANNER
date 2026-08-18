import { Wrench } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-foreground text-center">
      <div className="mb-4 rounded-2xl bg-amber-500/10 p-4 text-amber-500">
        <Wrench className="h-12 w-12" />
      </div>
      <span className="text-sm font-semibold uppercase tracking-widest text-amber-500">System Maintenance</span>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Under Scheduled Maintenance</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        ASP is currently undergoing scheduled system upgrades. We will be back online shortly.
      </p>
    </div>
  );
}
