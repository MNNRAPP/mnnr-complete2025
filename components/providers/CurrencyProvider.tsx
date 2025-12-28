'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Currency, currencies, defaultCurrency, getCurrencyFromLocale } from '@/lib/currency';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  availableCurrencies: readonly Currency[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(defaultCurrency);

  useEffect(() => {
    // Try to get currency from localStorage
    const savedCurrency = localStorage.getItem('MNNR_CURRENCY') as Currency | null;
    
    if (savedCurrency && currencies.includes(savedCurrency)) {
      setCurrencyState(savedCurrency);
    } else {
      // Detect from browser locale
      const browserLocale = navigator.language;
      const detectedCurrency = getCurrencyFromLocale(browserLocale);
      setCurrencyState(detectedCurrency);
    }
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('MNNR_CURRENCY', newCurrency);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        availableCurrencies: currencies,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
