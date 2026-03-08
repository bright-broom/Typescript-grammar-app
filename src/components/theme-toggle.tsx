"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md p-2 hover:bg-muted transition-colors">
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">テーマを切り替え</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          ライト
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          ダーク
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" />
          システム
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface ThemeButtonsProps {
  className?: string;
}

export function ThemeButtons({ className }: ThemeButtonsProps) {
  const { setTheme, theme } = useTheme();

  return (
    <div className={className}>
      <Button
        variant={theme === "light" ? "default" : "outline"}
        className="flex-1"
        onClick={() => setTheme("light")}
      >
        <Sun className="mr-2 h-4 w-4" />
        ライト
      </Button>
      <Button
        variant={theme === "dark" ? "default" : "outline"}
        className="flex-1"
        onClick={() => setTheme("dark")}
      >
        <Moon className="mr-2 h-4 w-4" />
        ダーク
      </Button>
      <Button
        variant={theme === "system" ? "default" : "outline"}
        className="flex-1"
        onClick={() => setTheme("system")}
      >
        <Monitor className="mr-2 h-4 w-4" />
        システム
      </Button>
    </div>
  );
}
