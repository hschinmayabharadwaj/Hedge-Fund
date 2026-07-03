import "./globals.css";
import SessionProvider from "@/components/SessionProvider";

export const metadata = {
  title: "AlphaEdge Capital - Institutional Terminal",
  description: "AI-powered institutional trading terminal with reinforcement learning",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased text-body-md bg-background text-on-surface h-screen overflow-hidden">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
