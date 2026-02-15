import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
