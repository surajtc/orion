import { NavBar } from "./nav-bar";
import type { User } from "better-auth";

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: User;
}) {
  return (
    <main className="h-screen overflow-hidden flex flex-col">
      <NavBar user={user} />
      <section className="flex-1 min-h-0">{children}</section>
    </main>
  );
}
