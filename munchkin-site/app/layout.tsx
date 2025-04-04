import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AuthProvider } from '@/context/AuthContext';
import { AuthWrapper } from '@/components/auth/AuthWrapper';
import { ThemeProvider } from "@/components/theme-provider"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Munchkin Site",
  description: "Munchkin game site with authentication",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <AuthWrapper>
              <div className="bg-pattern min-h-screen">
                <SidebarProvider>
                  <AppSidebar />
                  <main className="container mx-auto p-4 max-w-[100%] transition-all duration-300 ease-in-out">
                    <SidebarTrigger className="hover:rotate-12 transition-transform duration-300" />
                    <div className="mt-4 animate-fadeIn">
                      {children}
                    </div>
                  </main>
                </SidebarProvider>
              </div>
            </AuthWrapper>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
