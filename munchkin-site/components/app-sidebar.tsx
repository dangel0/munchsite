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
    <Sidebar >
      <SidebarContent>
        <SidebarGroup>
          {/* Changed text color: light mode uses gray, dark mode remains white */}
          <SidebarGroupLabel className="text-gray-900 dark:text-white font-bold">
            What's Good, {user?.name || 'Friend'}
          </SidebarGroupLabel>
          <Separator className="my-2" />
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url || (item.url !== "/" && pathname?.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      className={`text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 
                      ${isActive ? 'bg-gray-200 text-gray-900 dark:bg-white/20 dark:text-white font-medium' : ''}`}
                    >
                      <a href={item.url}>
                        <item.icon className={isActive ? 'text-gray-900 dark:text-white' : ''} />
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
                  className="text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
                >
                  {theme === "dark" ? 
                    <Sun className="text-yellow-300" /> : 
                    <Moon className="text-blue-300" />
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
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-200 dark:hover:text-red-100 dark:hover:bg-red-900/30"
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
