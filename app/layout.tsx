import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "保護者アンケート",
  description: "お子さんの状態に関するアンケートです",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50">{children}</body>
    </html>
  );
}
