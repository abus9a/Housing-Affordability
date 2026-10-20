import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Housing Affordability Intelligence — Kazakhstan",
  description: "Analyze housing affordability across Almaty and Astana districts",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-900">{children}</body>
    </html>
  );
}
