import { Outlet } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

export function AppShell() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="h-14 flex items-center justify-between border-b bg-background/80 backdrop-blur px-4 sticky top-0 z-30">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  AI Workplace Productivity Assistant
                </span>
              </div>
              <ThemeToggle />
            </header>
            <main className="flex-1 p-4 md:p-8 animate-fade-in">
              <Outlet />
            </main>
            <footer className="border-t px-4 md:px-8 py-4 text-xs text-muted-foreground text-center">
              <span className="font-medium text-foreground/80">Responsible AI:</span> Outputs are
              AI-generated and may be inaccurate. Review before sharing or acting on them.
            </footer>
          </div>
        </div>
        <Toaster />
      </SidebarProvider>
    </ThemeProvider>
  );
}
