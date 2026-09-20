import type { Metadata } from "next";
import "./globals.css";

// Public content is database-driven and must be rendered against the current CMS state.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "OMRI Prompt — AI Photo Prompts",
  description: "Discover, copy, and create with curated AI photo prompts.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
