import { Lora, Inter } from "next/font/google";
import "./globals.css";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "AI Research Assistant — Deep Multi-Source Synthesis",
  description: "Autonomous multi-source research engine with structured synthesis, evidence extraction, citations, and grounded RAG follow-up.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${lora.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col selection:bg-[#faebe4] selection:text-[#b84620]">
        {children}
      </body>
    </html>
  );
}
