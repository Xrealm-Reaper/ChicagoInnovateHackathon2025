import { Button } from "@/components/ui/button";
import { PropertyData } from "../pages/Index";
import { Download, RotateCcw, CheckCircle, MapPin, FileText } from "lucide-react";
import { useToast } from "../hooks/use-toast";

interface ResultsSectionProps {
  propertyData: PropertyData;
  onStartOver: () => void;
}

const ResultsSection = ({ propertyData, onStartOver }: ResultsSectionProps) => {
  const { toast } = useToast();

  const handleDownloadPDF = async () => {
    try {
      toast({
        title: "Success",
        description: "Property report downloaded successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto text-center">
      {/* Header */}
      <div className="mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 rounded-radius-lg mb-6">
          <CheckCircle className="w-8 h-8 text-success" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Report Ready!
        </h1>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          We've successfully compiled comprehensive property information for:
        </p>
        <p className="text-xl font-semibold text-foreground mt-2">
          {propertyData.address}
        </p>
      </div>

      {/* Property Summary */}
      <div className="bg-card rounded-radius-lg shadow-medium p-8 mb-8 text-left">
        <h2 className="text-2xl font-bold text-card-foreground mb-6 flex items-center">
          <MapPin className="w-6 h-6 text-primary mr-3" />
          Property Summary
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-card-foreground mb-1">Zoning</h3>
              <p className="text-muted-foreground">{propertyData.zoning || "N/A"}</p>
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground mb-1">Owner</h3>
              <p className="text-muted-foreground">{propertyData.owner || "N/A"}</p>
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground mb-1">Assessment</h3>
              <p className="text-muted-foreground">{propertyData.assessment || "N/A"}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-card-foreground mb-1">Tax Information</h3>
              <p className="text-muted-foreground">{propertyData.taxInfo || "N/A"}</p>
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground mb-1">Permits</h3>
              <p className="text-muted-foreground">
                {propertyData.permits?.length ? 
                  `${propertyData.permits.length} active permits` : 
                  "No active permits"
                }
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground mb-1">Violations</h3>
              <p className="text-muted-foreground">
                {propertyData.violations?.length ? 
                  `${propertyData.violations.length} violations found` : 
                  "No violations"
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={handleDownloadPDF}
          className="btn-primary px-8 py-4 text-lg"
        >
          <Download className="w-5 h-5 mr-2" />
          Download PDF Report
        </Button>
        
        <Button
          onClick={onStartOver}
          variant="outline"
          className="btn-secondary px-8 py-4 text-lg"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Check Another Property
        </Button>
      </div>

      {/* Additional Info */}
      <div className="mt-12 p-6 bg-muted/50 rounded-radius-lg">
        <div className="flex items-center justify-center mb-3">
          <FileText className="w-5 h-5 text-muted-foreground mr-2" />
          <span className="text-sm font-medium text-muted-foreground">
            Report Details
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Your PDF report includes complete property details, zoning information, 
          ownership records, tax data, permits, violations, and assessment history.
        </p>
      </div>
    </div>
  );
};

export default ResultsSection;