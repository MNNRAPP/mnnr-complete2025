'use client';

import React from 'react';
import { useCurrency } from '@/components/providers/CurrencyProvider';
import { Currency, currencySymbols, currencyNames } from '@/lib/currency';

export function CurrencySelector() {
  const { currency, setCurrency, availableCurrencies } = useCurrency();

  return (
    <div className="relative inline-block">
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as Currency)}
        className="appearance-none bg-transparent border border-zinc-700 rounded-lg px-3 py-1.5 pr-8 text-sm text-zinc-300 hover:border-zinc-500 focus:border-emerald-500 focus:outline-none cursor-pointer"
        aria-label="Select currency"
      >
        {availableCurrencies.map((curr) => (
          <option key={curr} value={curr} className="bg-zinc-900 text-zinc-300">
            {currencySymbols[curr]} {curr}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-400">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

export function CurrencyDisplay({ 
  amountUSD, 
  showCode = false,
  className = ''
}: { 
  amountUSD: number; 
  showCode?: boolean;
  className?: string;
}) {
  const { currency } = useCurrency();
  
  // Import dynamically to avoid SSR issues
  const [formattedAmount, setFormattedAmount] = React.useState<string>('');
  
  React.useEffect(() => {
    import('@/lib/currency').then(({ formatInUserCurrency }) => {
      setFormattedAmount(formatInUserCurrency(amountUSD, currency, { showCode }));
    });
  }, [amountUSD, currency, showCode]);

  return <span className={className}>{formattedAmount || `$${amountUSD}`}</span>;
}
