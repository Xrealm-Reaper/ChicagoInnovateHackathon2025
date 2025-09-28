// PropertyVisualization.tsx
import React, { useEffect, useMemo, useState, Suspense, useRef} from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import { PropertyData } from "../pages/Index";
import { Loader2, MapPin, FileText, Database } from "lucide-react";


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

export const PropertyVisualization = (propertyData : PropertyData) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

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
    <div className="w-full h-96 bg-card rounded-radius-lg shadow-medium overflow-hidden relative">
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
    </div>
  );
}
