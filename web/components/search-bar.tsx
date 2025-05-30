"use client";

import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export function SearchBar() {
  return (
    <div className="border flex items-end bg-background w-full max-w-lg">
      <Input
        className="border-none text-sm focus-visible:border-none focus-visible:ring-0 shadow-none resize-none dark:bg-transparent"
        placeholder="Enter your query..."
      />
      <Button size="icon">
        <MagnifyingGlass />
      </Button>
    </div>
  );
}
