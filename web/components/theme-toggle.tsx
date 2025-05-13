"use client";

import { useTheme } from "next-themes";
import { Monitor, Sun, Moon } from "@phosphor-icons/react/dist/ssr";

import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

export default function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <ToggleGroup
      type="single"
      value={theme || "system"}
      onValueChange={(value) => {
        setTheme(value);
      }}
      className="w-full [&_button]:text-xs [&_button]:gap-1"
    >
      <ToggleGroupItem value="system" aria-label="System Theme" size="sm">
        <Monitor className="size-4" weight="light" />
        System
      </ToggleGroupItem>
      <ToggleGroupItem value="light" aria-label="Light Theme" size="sm">
        <Sun className="size-4" weight="light" />
        Light
      </ToggleGroupItem>
      <ToggleGroupItem value="dark" aria-label="Dark Theme" size="sm">
        <Moon className="size-4" weight="light" />
        <span>Dark</span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
