"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ConsentPage() {
  const [agreed, setAgreed] = useState<boolean | null>(null);
  const router = useRouter();

  const handleConsent = (consent: boolean) => {
    setAgreed(consent);
    if (consent) {
      // TODO: Store consent in Zustand
      router.push("/training/instructions");
    }
  };

  if (agreed === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">Thank you for your time</h1>
            <p className="text-gray-700">
              Since you chose not to participate, you may now close this window.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 text-center">Consent Form</h1>

          <div className="prose prose-sm max-w-none text-gray-700 space-y-4">
            <p>Please read the following consent form:</p>

            <p className="font-semibold">
              Study Title: Response Patterns in a Computer-Based Task<br/>
              Principal Investigator: Dr. Laurence T. Maloney<br/>
              Department of Psychology, New York University<br/>
              Student Researcher: Saanika Banga<br/>
              Department of Psychology, New York University
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Purpose of the Study:</h3>
                <p>You are invited to participate in a research study examining how people perform simple computer-based tasks that involve judgments regarding probability. The study is designed to better understand how individuals make responses in situations involving uncertainty.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Procedures:</h3>
                <p>If you agree to participate, you will complete a computer-based task lasting approximately 45–60 minutes. During the study, you will view the visual displays presented on the screen and make judgments about upcoming outcomes.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Risks and Discomforts:</h3>
                <p>This study involves minimal risk. Possible minor discomforts include mild fatigue from concentrating, minor hand or wrist tiredness from repeated responses.</p>
                <p>You may stop at any time without penalty.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Benefits:</h3>
                <p>Your participation will contribute to scientific knowledge about human performance and decision-making.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Compensation:</h3>
                <p>You will receive $12 per hour for completing the study. Compensation is granted even if you withdraw early.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Confidentiality:</h3>
                <p>Your responses will be anonymous. No identifying information will be linked to your data. Data will be stored securely on password-protected systems. Results will be reported only in aggregate form.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Voluntary Participation:</h3>
                <p>Your participation is voluntary. You may refuse to participate or withdraw at any time without penalty or loss of benefits.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Contact Information:</h3>
                <p>
                  If you have questions about the study:<br/>
                  Researcher: Saanika Banga<br/>
                  Email: saanika.banga@nyu.edu<br/><br/>
                  Principal Investigator: Dr. Laurence T. Maloney<br/>
                  Email: ltm1@nyu.edu<br/><br/>
                  For questions about your rights as a research participant:<br/>
                  NYU Institutional Review Board (IRB)<br/>
                  irb@nyu.edu
                </p>
              </div>

              <div className="border-t pt-4 mt-6">
                <h3 className="font-semibold text-gray-900 text-lg">Consent Statement</h3>
                <p>By selecting "I agree" below, you confirm that:</p>
                <ul className="list-disc pl-6">
                  <li>You are at least 18 years old</li>
                  <li>You have read this form</li>
                  <li>You voluntarily agree to participate</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center mt-8">
            <button
              onClick={() => handleConsent(false)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              I do not agree
            </button>
            <button
              onClick={() => handleConsent(true)}
              className="bg-nyu-purple hover:bg-nyu-violet text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              I agree to participate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
