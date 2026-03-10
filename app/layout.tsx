import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reels Metrics Database",
  description: "Manual Reels metrics tracker powered by Supabase"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
