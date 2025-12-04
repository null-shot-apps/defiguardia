import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThirdwebProvider } from "@/components/providers/thirdweb-provider";
import { NeuralBackground } from "@/components/layout/neural-background";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "DeFiGuard AI - Smart Contract Security Auditor",
  description: "AI-powered smart contract vulnerability analysis for NullShot Hacks Season 0 Track 1b",
  keywords: ["DeFi", "Smart Contract", "Security", "AI", "Audit", "Blockchain", "Web3"],
  authors: [{ name: "DeFiGuard AI Team" }],
  openGraph: {
    title: "DeFiGuard AI - Smart Contract Security Auditor",
    description: "AI-powered smart contract vulnerability analysis",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <NeuralBackground />
        <ThirdwebProvider>
          {children}
        </ThirdwebProvider>
      </body>
    </html>
  );
}

