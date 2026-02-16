"use client";

import { usePathname, useRouter } from "next/navigation";

const PAGE_ORDER = [
  "/",
  "/consent",
  "/training/instructions",
  "/training/trials",
  "/main-instructions",
  "/experiment/instructions",
  "/experiment/jar-selection",
  "/experiment/phase1",
  "/experiment/phase2-transition",
  "/experiment/phase2",
  "/experiment/phase3-transition",
  "/experiment/phase3",
  "/demographics",
  "/debrief",
];

export default function DevSkipButton() {
  const pathname = usePathname();
  const router = useRouter();

  const currentIndex = PAGE_ORDER.indexOf(pathname);
  const nextPage = currentIndex >= 0 && currentIndex < PAGE_ORDER.length - 1
    ? PAGE_ORDER[currentIndex + 1]
    : null;
  const prevPage = currentIndex > 0
    ? PAGE_ORDER[currentIndex - 1]
    : null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 items-end">
      <div className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded shadow">
        DEV MODE
      </div>
      <div className="flex gap-2">
        {prevPage && (
          <button
            onClick={() => router.push(prevPage)}
            className="bg-gray-800 hover:bg-gray-700 text-white text-xs font-mono px-3 py-2 rounded shadow-lg transition-colors"
          >
            &larr; Prev
          </button>
        )}
        {nextPage && (
          <button
            onClick={() => router.push(nextPage)}
            className="bg-red-600 hover:bg-red-500 text-white text-xs font-mono px-3 py-2 rounded shadow-lg transition-colors"
          >
            Skip &rarr;
          </button>
        )}
      </div>
      <div className="text-[10px] text-gray-300 font-mono">
        {currentIndex + 1}/{PAGE_ORDER.length}: {pathname}
      </div>
    </div>
  );
}
