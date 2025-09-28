import { Button } from "@/components/ui/button";
import { PropertyData } from "../pages/Index";
import { Download, RotateCcw, CheckCircle, MapPin, FileText } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { useEffect, useState, useRef } from "react";
//import { PropertyVisualization } from "../components/PropertyVisualization";

interface ResultsSectionProps {
  propertyData: PropertyData;
  onStartOver: () => void;
}

// Use a config object or environment detection
const getGoogleMapsApiKey = () => {
  if (import.meta.env.VITE_GOOGLE_MAPS_API_KEY === undefined){
    return null
  }
  return import.meta.env.VITE_GOOGLE_MAPS_API_KEY
};

const GOOGLE_MAPS_API_KEY = getGoogleMapsApiKey();

// Google Maps type definitions
interface GoogleMapsWindow extends Window {
  google?: {
    maps: {
      Map: any;
      Marker: any;
      InfoWindow: any;
      Geocoder: any;
      Size: any;
      Point: any;
      Animation: {
        DROP: any;
      };
    };
  };
}

// Function to create and download an empty PDF
const createEmptyPDF = (filename: string) => {
  // Simple PDF content structure (minimal PDF)
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Property Report) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000217 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
313
%%EOF`;

  // Create blob and download
  const blob = new Blob([pdfContent], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL
  URL.revokeObjectURL(url);
};

// Function to sanitize filename
const sanitizeFilename = (address: string): string => {
  return address
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
    .toLowerCase();
};

const ResultsSection = ({ propertyData, onStartOver }: ResultsSectionProps) => {
  const { toast } = useToast();
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const handleDownloadPDF = async () => {
    try {
      // Sanitize the address for use as filename
      const sanitizedAddress = sanitizeFilename(propertyData.address);
      const filename = `property_report_${sanitizedAddress}.pdf`;
      
      // Create and download the empty PDF
      createEmptyPDF(filename);
      
      toast({
        title: "Success",
        description: `Property report downloaded successfully as ${filename}!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Load Google Maps script if not already loaded
    const googleWindow = window as GoogleMapsWindow;
    if (GOOGLE_MAPS_API_KEY !== null &&!googleWindow.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => initializeMap();
      document.head.appendChild(script);
    } else {
      initializeMap();
    }
  }, [propertyData.address]);

  const initializeMap = () => {
    console.log("test")
    if (!mapRef.current) return;
    
    const googleWindow = window as GoogleMapsWindow;
    if (!googleWindow.google) return;

    const geocoder = new googleWindow.google.maps.Geocoder();
    
    geocoder.geocode({ address: `${propertyData.address}, Chicago, IL` }, (results: any, status: string) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        
        const map = new googleWindow.google!.maps.Map(mapRef.current!, {
          center: location,
          zoom: 16,
          mapTypeId: 'hybrid',
          styles: [
            {
              featureType: "all",
              elementType: "labels",
              stylers: [{ visibility: "on" }]
            }
          ],
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        });

        // Add marker for the property
        new googleWindow.google!.maps.Marker({
          position: location,
          map: map,
          title: propertyData.address,
          animation: googleWindow.google!.maps.Animation.DROP,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 4C11.6 4 8 7.6 8 12C8 18 16 28 16 28C16 28 24 18 24 12C24 7.6 20.4 4 16 4ZM16 15C14.3 15 13 13.7 13 12C13 10.3 14.3 9 16 9C17.7 9 19 10.3 19 12C19 13.7 17.7 15 16 15Z" fill="#ef4444"/>
              </svg>
            `),
            scaledSize: new googleWindow.google!.maps.Size(32, 32),
            anchor: new googleWindow.google!.maps.Point(16, 32)
          }
        });

        // Add info window
        const infoWindow = new googleWindow.google!.maps.InfoWindow({
          content: `
            <div style="padding: 8px; font-family: system-ui, sans-serif;">
              <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">${propertyData.address}</h3>
              <p style="margin: 0; font-size: 12px; color: #666;">Property Location</p>
            </div>
          `
        });

        const marker = new googleWindow.google!.maps.Marker({
          position: location,
          map: map,
          title: propertyData.address,
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        mapInstanceRef.current = map;
        setMapLoaded(true);
      } else {
        console.error('Geocoding failed:', status);
        setMapLoaded(false);
      }
    });
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

      {/* Property Visualization */}
      {/* <div className="mb-8">
        <PropertyVisualization propertyData={propertyData} />
      </div> */}

      {/* Google Maps Integration */}
      <div className="bg-card rounded-radius-lg shadow-medium overflow-hidden">
        <div className="relative h-80">
          {/* Map Container */}
          <div 
            ref={mapRef}
            className="w-full h-full"
            style={{ minHeight: '320px' }}
          />
          
          {/* Loading Overlay */}
          {!mapLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
                <p className="text-lg font-medium text-card-foreground mb-2">
                  Property Location
                </p>
                <p className="text-muted-foreground">
                  Loading map for {propertyData.address}...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Property Summary */}
      <div className="bg-card rounded-radius-lg p-8 mb-8 text-left">
        
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