"use client";

import { Outfit } from "next/font/google";
import "./globals.css";

import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { SocketProvider, useSocket } from "@/context/SocketContext";
import { Toaster } from "react-hot-toast";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const outfit = Outfit({
  subsets: ["latin"],
});

function SocketOverlay() {
  const { connect } = useSocket();
  const pathname = usePathname();

  const [show, setShow] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [dots, setDots] = useState("");

  // animação dos pontos
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 100); // a cada 500ms troca
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (pathname === "/signin") {
      setHidden(true);
      const timer = setTimeout(() => setShow(false), 600);
      return () => clearTimeout(timer);
    }

    if (connect) {
      setHidden(true);
      const timer = setTimeout(() => setShow(false), 600);
      return () => clearTimeout(timer);
    } else {
      setShow(true);
      setHidden(false);
    }
  }, [connect, pathname]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-70 transition-opacity duration-500 ${
        hidden ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
        <span className="text-white text-lg">
          Conectando{dots}
        </span>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <SidebarProvider>
            <SocketProvider>
              {children}
              <SocketOverlay />
              <Toaster position="top-right" reverseOrder={false} />
            </SocketProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
