"use client";

import Image from "next/image";

interface WizardCharacterProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "talking" | "still";
}

const sizeDimensions = {
  sm: 64,
  md: 100,
  lg: 160,
  xl: 280,
};

export default function WizardCharacter({
  size = "md",
  variant = "talking",
}: WizardCharacterProps) {
  const dim = sizeDimensions[size];
  const src =
    variant === "talking"
      ? "/images/croc/croc-talking.png"
      : "/images/croc/croc-still.png";

  return (
    <Image
      src={src}
      alt="Crocodile guide"
      width={dim}
      height={dim}
      className="object-contain"
      priority
    />
  );
}
