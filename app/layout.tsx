import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LeftSidebar from "@/components/layout/LeftSidebar";
// import RightSidebar from "@/components/layout/RightSidebar"; // 将来の拡張用
import AuthProvider from "@/components/providers/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "omu - 生成AI情報共有プラットフォーム",
  description: "生成AIのプロンプト、記事、会話履歴を共有するプラットフォーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <Header />
          <div className="flex flex-1 max-w-7xl mx-auto w-full">
            <LeftSidebar />
            <main className="flex-1 min-w-0 px-4">
              {children}
            </main>
            {/* <RightSidebar /> */} {/* 将来の拡張用 */}
          </div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
