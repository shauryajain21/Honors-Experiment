"use client";

import FloatingCrocky from "@/components/wizard/FloatingCrocky";
import DevSkipButton from "@/components/ui/DevSkipButton";
import { CrockyProvider } from "@/context/CrockyContext";

const isDev = process.env.NODE_ENV === "development";

export default function DevWrapper({ children }: { children: React.ReactNode }) {
  return (
    <CrockyProvider>
      {children}
      <FloatingCrocky />
      {isDev && <DevSkipButton />}
    </CrockyProvider>
  );
}
