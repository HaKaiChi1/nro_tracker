import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Nav } from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "NRO Track Boss — Theo dõi Tiểu Đội Sát Thủ",
  description: "Thu thập và theo dõi boss Tiểu Đội Sát Thủ từ service.dungpham.com.vn",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Nav />
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
