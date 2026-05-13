import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

export const metadata: Metadata = {
  title: "出店戦略情報局 | 美容室・サロン開業シミュレーター",
  description: "美容室・サロンの出店エリア分析・売上シミュレーション・損益計算・出店診断",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full bg-stone-50">
        <main className="pb-20">
          {children}
        </main>
        <Navigation />
      </body>
    </html>
  );
}
