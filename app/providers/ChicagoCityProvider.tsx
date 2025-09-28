"use client";
import React, { createContext, useContext, useState } from 'react';

type ChicagoContextValue = {
  loading: boolean;
  error: string | null;
  // Previously: sendAddress -> now we provide getZoneClass which returns the zoning class for coordinates
  getZoneClass: (coordinates: { lat: number; lng: number }) => Promise<string>;
};

const ChicagoContext = createContext<ChicagoContextValue | undefined>(undefined);

export const ChicagoCityProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /*
  async function getZoneClass(address: Record<string, any>, coordinates?: { lat: number; lng: number }) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/chicagoCity-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, coordinates }),
      });

      const data = await res.json();
      setLoading(false);
      if (!res.ok) throw new Error(data?.error || 'API error');
      return data;
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || String(err));
      throw err;
    }
  }
  */

  // Mock method: return a random zoning class (e.g., RS-1, RM-5, B1-1)
  async function getZoneClass(coordinates: { lat: number; lng: number }) {
    setLoading(true);
    setError(null);
    try {
      // Simulate latency
      await new Promise((r) => setTimeout(r, 300 + Math.floor(Math.random() * 400)));

      const zones = ['RS-1', 'RS-3', 'RM-5', 'B1-1', 'C1-2', 'DX-2'];
      const zone = zones[Math.floor(Math.random() * zones.length)];

      setLoading(false);
      return zone;
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || String(err));
      throw err;
    }
  }

  return (
    <ChicagoContext.Provider value={{ loading, error, getZoneClass }}>
      {children}
    </ChicagoContext.Provider>
  );
};

export function useChicagoCity() {
  const ctx = useContext(ChicagoContext);
  if (!ctx) throw new Error('useChicagoCity must be used within a ChicagoCityProvider');
  return ctx;
}
