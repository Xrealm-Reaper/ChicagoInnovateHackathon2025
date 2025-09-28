"use client";
import React, { createContext, useContext, useState } from 'react';

// Coordinates returned by the provider
type Coordinates = { lat: number; lng: number };

type ChicagoContextValue = {
  loading: boolean;
  error: string | null;
  // sendAddress returns coordinates for the address
  sendAddress: (address: string | Record<string, any>) => Promise<Coordinates>;
};

const ChicagoContext = createContext<ChicagoContextValue | undefined>(undefined);

export const ChicagoProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // async function sendAddress(address: string | Record<string, any>) {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     // Dummy API — replace with your real backend route
  //     const res = await fetch('https://example.com/api/chicago', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ address }),
  //     });

  //     const json = await res.json();
  //     setLoading(false);

  //     if (!res.ok) {
  //       const msg = json?.error || json?.message || 'Unknown error';
  //       throw new Error(msg);
  //     }

  //     // Expect the dummy API to return { message: string, data?: any }
  //     return json as ChicagoResponse;
  //   } catch (err: any) {
  //     setLoading(false);
  //     setError(err?.message || String(err));
  //     throw err;
  //   }
  // }
  async function sendAddress(address: string | Record<string, any>) {
    // Mock implementation:
    // - Accepts a string or object address
    // - Simulates network latency (400-800ms)
    // - Small chance to throw an error to test error handling
    // - Returns coordinates for Chicago (or slightly randomized nearby coords)

    // Basic validation
    if (!address || (typeof address === 'string' && address.trim().length === 0)) {
      throw new Error('Invalid address');
    }

    // Simulate variable network latency
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
    const ms = 400 + Math.floor(Math.random() * 400);
    await delay(ms);

    // Base lat/lng for downtown Chicago
    const baseLat = 41.8781;
    const baseLng = -87.6298;

    return { lat: baseLat, lng: baseLng };
  }

  return (
    <ChicagoContext.Provider value={{ loading, error, sendAddress }}>
      {children}
    </ChicagoContext.Provider>
  );
};

export function useChicago() {
  const ctx = useContext(ChicagoContext);
  if (!ctx) throw new Error('useChicago must be used within a ChicagoProvider');
  return ctx;
}
