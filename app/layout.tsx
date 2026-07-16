import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InkFlow AI",
  description: "Turn Your Smartphone into an AI-Powered Digital Stylus",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-full">{children}</body>
    </html>
  );
}
