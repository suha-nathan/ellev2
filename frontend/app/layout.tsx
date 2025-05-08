import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Link from "next/link";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Elle | Learning Plan Builder",
  description: "Design and track structured learning paths with ease.",
  keywords: ["learning", "planner", "education", "self-improvement", "Elle"],
  authors: [{ name: "Suha" }],
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} font-sans antialiased`}>
        <Providers>
          <header className="w-full border-b shadow-sm">
            <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
              <h1 className="text-xl font-semibold">📚 Elle</h1>
              <nav className="space-x-4 text-sm sm:text-base">
                <Link href="/" className="hover:underline">
                  Home
                </Link>
                <Link href="/learning-plans/new" className="hover:underline">
                  Create
                </Link>
                <Link href="/explore" className="hover:underline">
                  Explore
                </Link>
              </nav>
            </div>
          </header>
          <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
