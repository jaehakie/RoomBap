import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoomBap · AI Food Concierge",
  description: "Meals for your preferences, source-grounded food stories and demo ordering.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
