"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "@/app/(auth)/auth-client";

import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import ThemeToggle from "./theme-toggle";

import {
  CirclesThreePlus,
  GearSix,
  GoogleLogo,
  SignOut,
  SignIn,
} from "@phosphor-icons/react/dist/ssr";

import type { User } from "better-auth";

function ThemeSection() {
  return (
    <DropdownMenuLabel className="px-1">
      <span className="text-xs text-muted-foreground font-normal py-1 pl-0.5 block">
        Theme
      </span>
      <ThemeToggle />
    </DropdownMenuLabel>
  );
}

export function NavBar({ user }: { user?: User }) {
  const router = useRouter();

  const handleSignIn = async () => {
    await signIn.social({ provider: "google" });
    router.push("/");
    router.refresh();
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-10 flex w-full items-center justify-between px-4 py-2.5 backdrop-blur-md">
      <Link href="/" className="flex items-center">
        <CirclesThreePlus className="size-7" weight="fill" />
        <span className="text-xl font-medium">Orion</span>
      </Link>

      <div>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer">
                <AvatarImage src={user.image || ""} alt={user.name} />
                <AvatarFallback>{user.name?.[0] ?? "U"}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end">
              <DropdownMenuGroup className="space-y-1.5">
                <DropdownMenuLabel>
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src={user.image || ""} alt={user.name} />
                      <AvatarFallback>{user.name?.[0] ?? "U"}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{user.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href="/account">
                    <GearSix className="size-4" />
                    Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <SignOut className="size-4" />
                  Sign out
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <ThemeSection />
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center">
            <Button size="sm" onClick={handleSignIn}>
              <GoogleLogo className="size-4" weight="bold" />
              Sign In
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="ml-2 aspect-square rounded-full"
                  size="icon"
                >
                  <GearSix className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end">
                <DropdownMenuGroup className="space-y-1.5">
                  <DropdownMenuItem onClick={handleSignIn}>
                    <SignIn className="size-4" />
                    Sign in with Google
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <ThemeSection />
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </nav>
  );
}
