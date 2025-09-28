import { useState } from "react";
import AddressInput from "../components/AddressInput";
import LoadingSection from "../components/LoadingSection";
import ResultsSection from "../components/ResultsSection";
import { useToast } from "../hooks/use-toast";
import { ChicagoCityProvider, useChicagoCity } from "../../../app/providers/ChicagoCityProvider";
import { useOpenAI } from "../../../app/providers/OpenAIProvider";

export type AppState = "input" | "loading" | "results";

export interface PropertyData {
  address: string;
  results: Array<{
    layerId: number;
    layerName: string;
    displayFieldName: string;
    value: string;
    attributes: Record<string, any>;
  }>;
}

// Create an inner component that uses the Chicago City context
const IndexContent = () => {
  const [currentState, setCurrentState] = useState<AppState>("input");
  const [address, setAddress] = useState("");
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const { toast } = useToast();
  const { getZoneClass } = useChicagoCity(); // Now this is inside the provider
  const { sendPrompt } = useOpenAI();

  const handleAddressSubmit = async (inputAddress: string) => {
    setAddress(inputAddress);
    setCurrentState("loading");

    try {
      // Use the inputAddress parameter instead of the state variable
      const zoneLabel = await getZoneClass(inputAddress);
      if (!zoneLabel) throw new Error("No zoning label found for location");
      console.log(`Zoning for ${inputAddress}:`, zoneLabel);

      const response = await sendPrompt(inputAddress, zoneLabel);
      if (!response) throw new Error("No response from LLM");
      console.log("LLM Response:", response);
      
      // Create mock property data for testing
      const mockPropertyData: PropertyData = {
        address: inputAddress,
        results: [{
          layerId: 15,
          layerName: "Zoning",
          displayFieldName: "ZONE_CLASS",
          value: zoneLabel,
          attributes: {
            ZONE_CLASS: zoneLabel,
            CASE_NUMBER: "12345",
            UPDATE_TIMESTAMP: new Date().toISOString()
          }
        }]
      };
      
      setPropertyData(mockPropertyData);
      setCurrentState("results");
    } catch (error) {
      console.error("Error in handleAddressSubmit:", error);
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

// Main component that wraps everything in the provider
const Index = () => {
  return (
    <ChicagoCityProvider>
      <IndexContent />
    </ChicagoCityProvider>
  );
};

export default Index;