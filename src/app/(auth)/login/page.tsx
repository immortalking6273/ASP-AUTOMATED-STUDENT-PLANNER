import Link from "next/link";
import { LoginForm } from "@/features/authentication/components/login-form";
import { GoogleButton } from "@/features/authentication/components/google-button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export const metadata = {
  title: "Sign In - ASP Workspace",
  description: "Sign in to access your Automated Student Planner workspace.",
};

export default function LoginPage() {
  return (
    <Card className="border border-border/80 shadow-2xl backdrop-blur-xl bg-card/95 rounded-3xl p-2 sm:p-4">
      <CardHeader className="text-center space-y-1.5 pb-2">
        <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Welcome back
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground max-w-xs mx-auto">
          Sign in to access your notes, planner, documents, and AI study assistant
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        <LoginForm />

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/60" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-semibold">
            <span className="bg-card px-3 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <GoogleButton label="Continue with Google" />
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/50 py-4 text-xs text-muted-foreground mt-2">
        <span>Don&apos;t have an account?</span>
        <Link href="/register" className="ml-1 font-bold text-primary hover:underline transition-all">
          Create Account
        </Link>
      </CardFooter>
    </Card>
  );
}
