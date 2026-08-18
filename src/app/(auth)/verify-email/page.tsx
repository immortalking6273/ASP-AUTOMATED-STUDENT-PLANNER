import { EmailVerificationContent } from "@/features/authentication/components/email-verification-content";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Verify Email - ASP Workspace",
  description: "Email verification for your Automated Student Planner account.",
};

export default function VerifyEmailPage() {
  return (
    <Card className="border border-border/80 shadow-2xl backdrop-blur-xl bg-card/95 rounded-3xl p-4 sm:p-6">
      <CardContent className="pt-2 p-0">
        <EmailVerificationContent />
      </CardContent>
    </Card>
  );
}
