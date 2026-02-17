import type { Metadata } from "next";
import "./globals.css";
import DevWrapper from "@/components/ui/DevWrapper";

export const metadata: Metadata = {
  title: "Psychology Experiment | NYU",
  description: "Probability estimation experiment for research study",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-[#57068C] via-[#6B1FA3] to-[#3D0563]">
        <DevWrapper>
          {children}
        </DevWrapper>
      </body>
    </html>
  );
}
