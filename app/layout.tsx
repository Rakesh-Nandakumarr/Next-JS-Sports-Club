import type { Metadata } from "next";
import { Provider } from "./provider";
import { Inter } from "next/font/google";
import "./globals.css";
import { metadata } from "./metadata";
import Link from "next/link";
import SideNav from "../components/SideNav";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Provider>
        <body className={inter.className}>
          {children}</body>
      </Provider>
    </html>
  );
}
