'use client';

import { Settings, Home, Bed, LogOut, Star, Mails, Moon, Sun } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter
} from "@/components/ui/sidebar"
import { Button } from "./ui/button"
import { Separator } from "./ui/separator";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Dreams",
    url: "/dreams",
    icon: Bed,
  },
  {
    title: "Letters",
    url: "/letters",
    icon: Mails,
  },
  {
    title: "Reviews",
    url: "/reviews",
    icon: Star,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const { logout, user } = useAuth();
  const { setTheme, theme } = useTheme();
  const pathname = usePathname();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="border-r-6 border-black-300 dark:border-white-400/70">
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 dark:from-indigo-600 dark:to-purple-700 p-3 rounded-lg mb-3 shadow-md transition-all duration-300 hover:shadow-lg">
            <SidebarGroupLabel className="text-white font-bold flex items-center">
              <p>What's Good </p> 
              <p className="pl-1.5 text-lg font-bold text-white animate-pulse-subtle"> 
                {user?.name || 'Friend'} 
              </p>
            </SidebarGroupLabel>
          </div>
          <Separator className="my-2 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url || (item.url !== "/" && pathname?.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      className={`text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 
                      transition-all duration-300 btn-pop
                      ${isActive ? 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 font-medium border-l-4 border-blue-500 dark:border-blue-400' : ''}`}
                    >
                      <a href={item.url}>
                        <item.icon className={`transition-transform duration-300 ${isActive ? 'text-blue-600 dark:text-blue-400 scale-110' : ''}`} />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
              {/* Add theme toggle as a menu item for consistent UI */}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={toggleTheme}
                  className="text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-300 btn-pop"
                >
                  {theme === "dark" ? 
                    <Sun className="text-amber-400" /> : 
                    <Moon className="text-indigo-500" />
                  }
                  <span> {theme === "dark" ? "Light" : "Dark"} Mode</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="mt-auto border-t border-gray-300 dark:border-white/10 pt-4">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30 transition-all duration-300"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
    </div>
  )
}
