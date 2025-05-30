"use client";

import { signIn } from "@/app/(auth)/auth-client";
import { Button } from "./ui/button";

export function SignInWithGoogle() {
  return (
    <Button onClick={async () => await signIn.social({ provider: "google" })}>
      SignInWithGoogle
    </Button>
  );
}
