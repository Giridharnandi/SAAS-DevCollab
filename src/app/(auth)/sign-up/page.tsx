import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import { signUpAction } from "@/app/actions";
import Navbar from "@/components/navbar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="flex h-screen w-full flex-1 items-center justify-center p-4 sm:max-w-md">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
          <form className="flex flex-col space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-semibold tracking-tight">Sign up</h1>
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  className="text-primary font-medium hover:underline transition-all"
                  href="/sign-in"
                >
                  Sign in
                </Link>
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="John Doe"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Your password"
                  minLength={6}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Select Your Role</Label>
                <RadioGroup
                  defaultValue="project_creator"
                  name="user_role"
                  className="flex flex-col space-y-3"
                >
                  <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-muted">
                    <RadioGroupItem
                      value="project_creator"
                      id="project_creator"
                    />
                    <Label
                      htmlFor="project_creator"
                      className="flex flex-col cursor-pointer"
                    >
                      <span className="font-medium">Project Creator</span>
                      <span className="text-xs text-muted-foreground">
                        Create projects and manage development teams
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-muted">
                    <RadioGroupItem
                      value="project_member"
                      id="project_member"
                    />
                    <Label
                      htmlFor="project_member"
                      className="flex flex-col cursor-pointer"
                    >
                      <span className="font-medium">Project Member</span>
                      <span className="text-xs text-muted-foreground">
                        Join projects and collaborate with teams
                      </span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <SubmitButton
              formAction={signUpAction}
              pendingText="Signing up..."
              className="w-full"
            >
              Sign up
            </SubmitButton>

            <FormMessage message={searchParams} />
          </form>
        </div>
        <SmtpMessage />
      </div>
    </>
  );
}
