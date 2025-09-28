"use client";
import React, { createContext, useContext, useState } from 'react';

type OpenAIRequest = {
  prompt?: string;
  address?: string | Record<string, any>;
  basePrompt?: string;
};

type OpenAIContextValue = {
  loading: boolean;
  error: string | null;
  sendPrompt: (payload: OpenAIRequest) => Promise<any>;
};

const OpenAIContext = createContext<OpenAIContextValue | undefined>(undefined);

export const OpenAIProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendPrompt(payload: OpenAIRequest) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/openai-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setLoading(false);
      if (!res.ok) throw new Error(data?.error || 'OpenAI API error');
      return data;
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || String(err));
      throw err;
    }
  }

  return (
    <OpenAIContext.Provider value={{ loading, error, sendPrompt }}>
      {children}
    </OpenAIContext.Provider>
  );
};

export function useOpenAI() {
  const ctx = useContext(OpenAIContext);
  if (!ctx) throw new Error('useOpenAI must be used within an OpenAIProvider');
  return ctx;
}
