import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-foreground text-center">
      <div className="mb-4 rounded-2xl bg-muted p-4 text-muted-foreground">
        <WifiOff className="h-12 w-12" />
      </div>
      <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Offline</span>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">No Internet Connection</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Please check your network connection to access your AI study workspace.
      </p>
    </div>
  );
}
