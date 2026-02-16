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
      <body className="bg-nyu-purple min-h-screen">
        <DevWrapper>
          {children}
        </DevWrapper>
      </body>
    </html>
  );
}
