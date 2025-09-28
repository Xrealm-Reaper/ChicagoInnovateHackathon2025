import { useEffect, useState } from "react";
import { Loader2, MapPin, FileText, Database } from "lucide-react";

interface LoadingSectionProps {
  address: string;
}

const LoadingSection = ({ address }: LoadingSectionProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    { icon: MapPin, text: "Locating property..." },
    { icon: Database, text: "Fetching city records..." },
    { icon: FileText, text: "Generating report..." }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-4xl mx-auto text-center">
      {/* Header */}
      <div className="mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-radius-lg mb-6">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Processing Your Request
        </h1>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          We're gathering comprehensive property information for:
        </p>
        <p className="text-xl font-semibold text-foreground mt-2">
          {address}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-12">
        <div className="flex justify-center items-center space-x-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index <= currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div key={index} className="flex flex-col items-center">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-500
                  ${isCompleted ? 'bg-success text-success-foreground' : 
                    isActive ? 'bg-primary text-primary-foreground' : 
                    'bg-muted text-muted-foreground'}
                `}>
                  <Icon className="w-6 h-6" />
                </div>
                <p className={`text-sm font-medium transition-colors duration-300 ${
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="bg-card rounded-radius-lg shadow-medium overflow-hidden">
        <div className="h-80 bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-lg font-medium text-card-foreground mb-2">
              Property Location
            </p>
            <p className="text-muted-foreground">
              Loading map for {address}...
            </p>
          </div>
        </div>
      </div>

      {/* Progress Message */}
      <div className="mt-8 p-6 bg-card rounded-radius-lg shadow-soft">
        <p className="text-muted-foreground">
          Please wait while we compile your comprehensive property report. 
          This usually takes 30-60 seconds.
        </p>
      </div>
    </div>
  );
};

export default LoadingSection;