"use client";

export default function DebriefPage() {
  const handleDownload = () => {
    // TODO: Implement CSV export and download
    alert("Data export will be implemented");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            Thank You!
          </h1>

          <div className="prose prose-sm max-w-none text-gray-700 space-y-4">
            <p>
              You have now reached the end of the experiment. Thank you for taking the time to participate in this study.
            </p>

            <p>
              The purpose of this experiment was to understand how people update beliefs when they receive new evidence and whether previously learned beliefs are stored and reused when a situation returns. During the task, you observed balls drawn from urns and repeatedly estimated the probability of drawing a black ball.
            </p>

            <p>
              The study was designed to examine how people form beliefs, adjust them when circumstances change, and whether they return to earlier beliefs when a familiar situation reappears. Some aspects of the task were not fully explained beforehand so that your responses would reflect natural judgment rather than following a specific strategy.
            </p>

            <p>
              In particular, the appearance of different urns allowed us to test whether people treat earlier knowledge as something that can be remembered and reinstated, rather than always starting from scratch. There were no correct answers on individual trials – we were interested only in how your estimates changed over time.
            </p>

            <p>
              Your responses will remain anonymous and will be used only for research purposes.
            </p>

            <p>
              If you have any questions about the study, you may contact the researcher (saanika.banga@nyu.edu) or supervising professor (ltm1@nyu.edu).
            </p>

            <p className="font-semibold">
              Thank you again for your time and participation. Your contribution helps us better understand how people reason and make decisions under uncertainty.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 mt-8">
            <button
              onClick={handleDownload}
              className="bg-nyu-purple hover:bg-nyu-violet text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Download My Data
            </button>
            <p className="text-gray-600 text-sm">
              You may now close the experiment window.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
