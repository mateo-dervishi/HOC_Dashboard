import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HOC Investor Dashboard | House of Clarence",
  description: "Real-time investor dashboard for House of Clarence - Luxury second-fix materials for B2B and B2C markets in the UK",
  keywords: ["House of Clarence", "HOC", "Investor Dashboard", "Luxury Materials", "B2B", "B2C"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
