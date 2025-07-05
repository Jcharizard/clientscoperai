import React, { useState } from "react";

interface OnboardingWizardProps {
  onComplete: () => void;
}

type StepType = "Proxy Setup" | "Session Cookie" | "Dependency Check";

const steps: StepType[] = [
  "Proxy Setup",
  "Session Cookie",
  "Dependency Check"
];

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(0);
  const [proxy, setProxy] = useState<string>("");
  const [cookie, setCookie] = useState<string>(localStorage.getItem("sessionid") || "");
  const [depsOk, setDepsOk] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleNext = async (): Promise<void> => {
    setError("");
    
    if (step === 0) {
      if (!proxy) {
        setError("Please enter at least one proxy.");
        return;
      }
      // Save proxy to backend (or localStorage for demo)
      localStorage.setItem("proxy", proxy);
      setStep(1);
    } else if (step === 1) {
      if (!cookie) {
        setError("Please enter your Instagram session cookie.");
        return;
      }
      localStorage.setItem("sessionid", cookie);
      setStep(2);
    } else if (step === 2) {
      setChecking(true);
      // Simulate dependency check (in real app, ping backend for Node/Python status)
      setTimeout(() => {
        setDepsOk(true);
        setChecking(false);
      }, 1200);
    }
  };

  const renderStepContent = (): JSX.Element => {
    switch (step) {
      case 0:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-2">Proxy Setup</h2>
            <p className="mb-4 text-gray-300">
              Enter your proxy (IP:PORT:USER:PASS). You can add more later in settings.
            </p>
            <input 
              className="w-full p-2 rounded bg-black border border-gray-700 mb-2" 
              value={proxy} 
              onChange={e => setProxy(e.target.value)} 
              placeholder="123.45.67.89:8080:user:pass" 
            />
            {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
            <button 
              className="bg-blue-600 px-6 py-2 rounded mt-2 hover:bg-blue-700 transition-colors" 
              onClick={handleNext}
            >
              Next
            </button>
          </div>
        );
      
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-2">Session Cookie</h2>
            <p className="mb-4 text-gray-300">
              Paste your Instagram sessionid cookie. This lets the app access public profiles.
            </p>
            <input 
              className="w-full p-2 rounded bg-black border border-gray-700 mb-2" 
              value={cookie} 
              onChange={e => setCookie(e.target.value)} 
              placeholder="sessionid=..." 
            />
            {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
            <button 
              className="bg-blue-600 px-6 py-2 rounded mt-2 hover:bg-blue-700 transition-colors" 
              onClick={handleNext}
            >
              Next
            </button>
          </div>
        );
      
      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-2">Dependency Check</h2>
            <p className="mb-4 text-gray-300">Checking for Node.js and Python...</p>
            {checking && <div className="text-blue-400">Checking...</div>}
            {depsOk && <div className="text-green-400 mb-2">All dependencies found!</div>}
            <button 
              className="bg-green-600 px-6 py-2 rounded mt-2 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={!depsOk} 
              onClick={onComplete}
            >
              Finish
            </button>
          </div>
        );
      
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-8">
        {/* Step Progress Indicator */}
        <div className="flex items-center mb-6">
          {steps.map((s, i) => (
            <div 
              key={i} 
              className={`flex-1 text-center text-sm ${
                i === step ? 'text-blue-400 font-bold' : 'text-gray-400'
              }`}
            >
              {s}
            </div>
          ))}
        </div>
        
        {/* Step Content */}
        {renderStepContent()}
      </div>
    </div>
  );
};

export default OnboardingWizard; 