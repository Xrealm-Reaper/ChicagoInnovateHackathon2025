import { useState } from "react";
import AddressInput from "../components/AddressInput";
import LoadingSection from "../components/LoadingSection";
import ResultsSection from "../components/ResultsSection";
import { useToast } from "../hooks/use-toast";

export type AppState = "input" | "loading" | "results";

export interface PropertyData {
  address: string; // Keep this for display purposes
  results: Array<{
    layerId: number;
    layerName: string;
    displayFieldName: string;
    value: string;
    attributes: Record<string, any>;
  }>;
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
      await new Promise(resolve => setTimeout(resolve, 6000));
      
      // Mock property data - replace with actual API response
      /* const mockData1: PropertyData = {
        address: inputAddress,
        zoning: "R-4 Residential",
        owner: "John Smith",
        taxInfo: "$2,450 annual property tax",
        permits: ["Building Permit #2023-001", "Electrical Permit #2023-045"],
        violations: [],
        assessment: "$185,000"
      }; */

      const mockData = {
        address: inputAddress,
        "results": [{
          "layerId": 13,
          "layerName": "TSL Station",
          "displayFieldName": "STATION_NAME",
          "value": "TSL Rail Station",
          "attributes": {
              "OBJECTID": "3",
              "SHAPE": "Polygon",
              "STATION_NAME": "TSL Rail Station",
              "SHAPE.AREA": "6419749274.97731",
              "SHAPE.LEN": "3845025.737902"
          }
      }, {
          "layerId": 14,
          "layerName": "TSL Route",
          "displayFieldName": "CTA_Routes",
          "value": "TSL Bus Route",
          "attributes": {
              "OBJECTID": "756",
              "SHAPE": "Polygon",
              "SHAPE.LEN": "1610724.32563",
              "SHAPE.AREA": "4209113795.03348",
              "CTA_Routes": "TSL Bus Route"
          }
      }, {
          "layerId": 15,
          "layerName": "Zoning",
          "displayFieldName": "ZONE_CLASS",
          "value": "PD 1325",
          "attributes": {
              "OBJECTID": "2116020",
              "ZONING_ID": "66",
              "CASE_NUMBER": "37115",
              "ZONE_TYPE": "5",
              "ZONE_CLASS": "PD 1325",
              "ORDINANCE_NUM": "A8385",
              "ORDINANCE_DATE": "5/25/2018",
              "CREATE_TIMESTAMP": "6/29/2018 9:32:25 AM",
              "CREATE_USERID": "388140",
              "UPDATE_TIMESTAMP": "10/3/2023 4:41:11 PM",
              "UPDATE_USERID": "DATA_ADMIN",
              "PD_NUM": "1325",
              "PMD_SUB_AREA": "Null",
              "PEDSTREET_AREANAME": "Null",
              "OVERRIDE_REASON_CD": "Null",
              "OVERRIDE_COMMENTS": "Null",
              "SHAPE": "Polygon",
              "SHAPE.AREA": "38998.223728",
              "SHAPE.LEN": "802.361106",
              "GLOBALID": "{D442E983-8B1D-4323-A5FE-56B483E60682}",
              "CLERK_DOCNO": "SO2018-2453",
              "CLERK_URL": "https://chicityclerkelms.chicago.gov/Matter/?matterId=9C4E9A49-E10D-ED11-82E3-001DD80698CB"
          }
      }]
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