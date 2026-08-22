import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "THE PRIVY HOUSE | Membership Rights Management System",
  description: "Membership Rights Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}