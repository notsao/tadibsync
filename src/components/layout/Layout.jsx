import { Link } from 'react-router-dom';
import { Button } from "@/components_/ui/button";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import {
  LayoutGrid,
  ListTodo,
  BarChart3,
  Settings,
  Tags,
  Trophy
} from "lucide-react";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center px-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="gradient-bg rounded-lg p-2">
                <ListTodo className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl">TadibSync</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-4">
            <Link to="/dashboard">
              <Button variant="ghost" className="w-full justify-start">
                <LayoutGrid className="mr-2 h-5 w-5" />
                Dashboard
              </Button>
            </Link>
            <Link to="/categories">
              <Button variant="ghost" className="w-full justify-start">
                <Tags className="mr-2 h-4 w-4" />
                Categories
              </Button>
            </Link>
            <Link to="/achievements">
              <Button variant="ghost" className="w-full justify-start">
                <Trophy className="mr-2 h-4 w-4" />
                Achievements
              </Button>
            </Link>
            <Link to="/metrics">
              <Button variant="ghost" className="w-full justify-start">
                <BarChart3 className="mr-2 h-5 w-5" />
                Metrics
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="mr-2 h-5 w-5" />
                Settings
              </Button>
            </Link>
          </nav>

          {/* Theme Toggle */}
          <div className="border-t p-4">
            <Button variant="outline" size="icon" className="w-full">
              <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pl-64">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
} 