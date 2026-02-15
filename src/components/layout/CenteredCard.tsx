import { ReactNode } from "react";

interface CenteredCardProps {
  children: ReactNode;
  width?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl";
  maxHeight?: string;
  showProgress?: boolean;
  currentStep?: number;
  totalSteps?: number;
}

const widthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
};

export default function CenteredCard({
  children,
  width = "2xl",
  maxHeight,
  showProgress = false,
  currentStep,
  totalSteps,
}: CenteredCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div
        className={`bg-white rounded-2xl shadow-2xl p-8 w-full ${widthClasses[width]} ${
          maxHeight ? maxHeight : ""
        }`}
      >
        {showProgress && currentStep && totalSteps && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>
                {currentStep} / {totalSteps}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-nyu-purple h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
