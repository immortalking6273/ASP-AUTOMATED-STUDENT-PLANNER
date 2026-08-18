import { ROUTE_METADATA, ROUTES } from "@/constants/routes";
import { AIChatLayout } from "@/features/chat";

export const metadata = {
  title: ROUTE_METADATA[ROUTES.CHAT].title,
  description: ROUTE_METADATA[ROUTES.CHAT].description,
};

export default function ChatPage() {
  return (
    <div className="w-full h-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
            ASP AI Chat Assistant
          </h1>
          <p className="text-xs text-muted-foreground">
            Ground your study questions in your course documents, notes, and research materials with real-time vector citations.
          </p>
        </div>
      </div>

      <AIChatLayout />
    </div>
  );
}
