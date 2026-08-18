import Link from "next/link";
import { RegisterForm } from "@/features/authentication/components/register-form";
import { GoogleButton } from "@/features/authentication/components/google-button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export const metadata = {
  title: "Create Account - ASP Workspace",
  description: "Register a new student workspace account on Automated Student Planner.",
};

export default function RegisterPage() {
  return (
    <Card className="border border-border/80 shadow-2xl backdrop-blur-xl bg-card/95 rounded-3xl p-2 sm:p-4">
      <CardHeader className="text-center space-y-1.5 pb-2">
        <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Create Account
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground max-w-xs mx-auto">
          Join ASP to organize your studies, schedule tasks, and learn with AI intelligence
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        <RegisterForm />

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/60" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-semibold">
            <span className="bg-card px-3 text-muted-foreground">Or sign up with</span>
          </div>
        </div>

        <GoogleButton label="Continue with Google" />
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/50 py-4 text-xs text-muted-foreground mt-2">
        <span>Already have an account?</span>
        <Link href="/login" className="ml-1 font-bold text-primary hover:underline transition-all">
          Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}
