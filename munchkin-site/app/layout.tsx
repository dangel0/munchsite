import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AuthProvider } from '@/context/AuthContext';
import { AuthWrapper } from '@/components/auth/AuthWrapper';

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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <AuthWrapper>
            <SidebarProvider>
              <AppSidebar />
              <main className="container mx-auto p-4 max-w-[100%]">
                <SidebarTrigger />
                {children}
              </main>
            </SidebarProvider>
          </AuthWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
