import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import ToastProvider from "@/components/providers/ToastProvider";
import Navbar from "@/components/layout/Navbar";
import Doctor_Navbar from "@/components/layout/Doctor_Navbar";
import Hospital_Navbar from "@/components/layout/Hospital_Navbar";
import { SocketProvider } from "@/app/contexts/SocketContext";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Healthcare Platform",
  description: "A comprehensive healthcare management platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  // Determine which navbar to render based on user type in session
  const userType = (session?.user as any)?.userType;
  let renderedNavbar = <Navbar />;
  if (userType === "doctor") {
    renderedNavbar = <Doctor_Navbar />;
  } else if (userType === "hospital") {
    renderedNavbar = <Hospital_Navbar />;
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <SocketProvider>
            {renderedNavbar}
            {children}
            <ToastProvider />
          </SocketProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
