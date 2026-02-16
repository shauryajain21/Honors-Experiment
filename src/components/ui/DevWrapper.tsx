"use client";

import DevSkipButton from "./DevSkipButton";

export default function DevWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <DevSkipButton />
    </>
  );
}
