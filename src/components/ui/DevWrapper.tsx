"use client";

import DevSkipButton from "./DevSkipButton";
import FloatingCrocky from "@/components/wizard/FloatingCrocky";
import { CrockyProvider } from "@/context/CrockyContext";

export default function DevWrapper({ children }: { children: React.ReactNode }) {
  return (
    <CrockyProvider>
      {children}
      <FloatingCrocky />
      <DevSkipButton />
    </CrockyProvider>
  );
}
