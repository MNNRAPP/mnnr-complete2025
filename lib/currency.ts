// Currency conversion and formatting utilities for MNNR

export const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY'] as const;
export type Currency = (typeof currencies)[number];

export const currencySymbols: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
};

export const currencyNames: Record<Currency, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  CNY: 'Chinese Yuan',
};

// Exchange rates relative to USD (updated periodically)
// In production, these would be fetched from an API
export const exchangeRates: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 150.5,
  CNY: 7.24,
};

export const defaultCurrency: Currency = 'USD';

/**
 * Convert an amount from USD to the target currency
 */
export function convertFromUSD(amountUSD: number, targetCurrency: Currency): number {
  return amountUSD * exchangeRates[targetCurrency];
}

/**
 * Convert an amount from any currency to USD
 */
export function convertToUSD(amount: number, sourceCurrency: Currency): number {
  return amount / exchangeRates[sourceCurrency];
}

/**
 * Convert between any two currencies
 */
export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number {
  const amountInUSD = convertToUSD(amount, fromCurrency);
  return convertFromUSD(amountInUSD, toCurrency);
}

/**
 * Format a currency amount with the appropriate symbol and decimal places
 */
export function formatCurrency(
  amount: number,
  currency: Currency,
  options?: {
    showSymbol?: boolean;
    showCode?: boolean;
    decimals?: number;
  }
): string {
  const { showSymbol = true, showCode = false, decimals } = options || {};
  
  // JPY and CNY typically don't use decimals
  const decimalPlaces = decimals ?? (currency === 'JPY' ? 0 : 2);
  
  const formattedAmount = amount.toLocaleString(undefined, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
  
  let result = formattedAmount;
  
  if (showSymbol) {
    result = `${currencySymbols[currency]}${result}`;
  }
  
  if (showCode) {
    result = `${result} ${currency}`;
  }
  
  return result;
}

/**
 * Format a USD amount in the user's preferred currency
 */
export function formatInUserCurrency(
  amountUSD: number,
  userCurrency: Currency,
  options?: {
    showSymbol?: boolean;
    showCode?: boolean;
  }
): string {
  const convertedAmount = convertFromUSD(amountUSD, userCurrency);
  return formatCurrency(convertedAmount, userCurrency, options);
}

/**
 * Get currency from locale
 */
export function getCurrencyFromLocale(locale: string): Currency {
  const localeCurrencyMap: Record<string, Currency> = {
    en: 'USD',
    'en-US': 'USD',
    'en-GB': 'GBP',
    zh: 'CNY',
    'zh-CN': 'CNY',
    'zh-TW': 'CNY',
    es: 'EUR',
    'es-ES': 'EUR',
    'es-MX': 'USD',
    ja: 'JPY',
    de: 'EUR',
    fr: 'EUR',
  };
  
  return localeCurrencyMap[locale] || 'USD';
}

/**
 * Stablecoin support for crypto payments
 */
export const stablecoins = ['USDC', 'USDT', 'DAI'] as const;
export type Stablecoin = (typeof stablecoins)[number];

export const stablecoinInfo: Record<Stablecoin, { name: string; decimals: number }> = {
  USDC: { name: 'USD Coin', decimals: 6 },
  USDT: { name: 'Tether', decimals: 6 },
  DAI: { name: 'Dai', decimals: 18 },
};

/**
 * Format stablecoin amount
 */
export function formatStablecoin(amount: number, stablecoin: Stablecoin): string {
  return `${amount.toFixed(2)} ${stablecoin}`;
}
