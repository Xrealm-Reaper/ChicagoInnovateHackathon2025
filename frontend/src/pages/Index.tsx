import { useState } from "react";
import AddressInput from "../components/AddressInput";
import LoadingSection from "../components/LoadingSection";
import ResultsSection from "../components/ResultsSection";
import { useToast } from "../hooks/use-toast";

export type AppState = "input" | "loading" | "results";

export interface PropertyData {
  address: string;
  zoning?: string;
  owner?: string;
  taxInfo?: string;
  permits?: string[];
  violations?: string[];
  assessment?: string;
}

const Index = () => {
  const [currentState, setCurrentState] = useState<AppState>("input");
  const [address, setAddress] = useState("");
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const { toast } = useToast();

  const handleAddressSubmit = async (inputAddress: string) => {
    setAddress(inputAddress);
    setCurrentState("loading");

    try {
      // Simulate API call - replace with actual Chicago City API integration
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock property data - replace with actual API response
      const mockData: PropertyData = {
        address: inputAddress,
        zoning: "R-4 Residential",
        owner: "John Smith",
        taxInfo: "$2,450 annual property tax",
        permits: ["Building Permit #2023-001", "Electrical Permit #2023-045"],
        violations: [],
        assessment: "$185,000"
      };
      
      setPropertyData(mockData);
      setCurrentState("results");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to retrieve property information. Please try again.",
        variant: "destructive",
      });
      setCurrentState("input");
    }
  };

  const handleStartOver = () => {
    setCurrentState("input");
    setAddress("");
    setPropertyData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {currentState === "input" && (
          <div className="section-enter">
            <AddressInput onSubmit={handleAddressSubmit} />
          </div>
        )}
        
        {currentState === "loading" && (
          <div className="section-enter">
            <LoadingSection address={address} />
          </div>
        )}
        
        {currentState === "results" && propertyData && (
          <div className="section-enter">
            <ResultsSection 
              propertyData={propertyData} 
              onStartOver={handleStartOver} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;