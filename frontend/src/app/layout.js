import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/Toaster";

export const metadata = {
  title: "AlphaEdge Capital - Institutional Terminal",
  description: "AI-powered institutional trading terminal with reinforcement learning",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#070E1A" />
      </head>
      <body className="antialiased text-body-md bg-background text-on-surface min-h-screen overflow-x-hidden">
        <ThemeProvider>
          <div className="fixed inset-0 bg-gradient-to-br from-[#070E1A] via-[#0B1524] to-[#0D1828] -z-10" />
          <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(125,211,252,0.08)_0%,transparent_50%),radial-gradient(circle_at_70%_80%,rgba(52,211,153,0.06)_0%,transparent_50%)] -z-10" />
          <SessionProvider>
            {children}
            <Toaster />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
