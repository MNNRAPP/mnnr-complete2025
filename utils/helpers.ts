/**
 * @module utils/helpers
 * @description General-purpose helper utilities for URL construction, data posting,
 * date conversion, trial period calculation, and redirect URL generation with
 * toast notification parameters.
 *
 * Used throughout the app for:
 * - Resolving the canonical site URL across environments (local, Vercel, production)
 * - Posting JSON data to API endpoints with credentials
 * - Converting Stripe timestamps to JavaScript Date objects
 * - Calculating subscription trial end dates
 * - Building redirect URLs with status/error query parameters for toast notifications
 *
 * @example
 * ```ts
 * import { getURL, getStatusRedirect, getErrorRedirect } from '@/utils/helpers';
 *
 * const siteUrl = getURL('/dashboard');
 * const successRedirect = getStatusRedirect('/', 'Welcome!', 'You are signed in.');
 * const errorRedirect = getErrorRedirect('/signin', 'Failed', 'Invalid credentials.');
 * ```
 */

import type { Tables } from '@/types_db';

type Price = Tables<'prices'>;

/**
 * Resolves the canonical base URL for the application, appending an optional path.
 *
 * Resolution order:
 * 1. `NEXT_PUBLIC_SITE_URL` (production)
 * 2. `NEXT_PUBLIC_VERCEL_URL` (Vercel preview deployments)
 * 3. `http://localhost:3000/` (local development fallback)
 *
 * @param path - Optional path segment to append (leading slashes are stripped).
 * @returns The fully-qualified URL string.
 *
 * @example
 * ```ts
 * getURL();              // "https://mnnr.app"
 * getURL('dashboard');   // "https://mnnr.app/dashboard"
 * getURL('/api/health'); // "https://mnnr.app/api/health"
 * ```
 */
export const getURL = (path: string = '') => {
  // Check if NEXT_PUBLIC_SITE_URL is set and non-empty. Set this to your site URL in production env.
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL &&
    process.env.NEXT_PUBLIC_SITE_URL.trim() !== ''
      ? process.env.NEXT_PUBLIC_SITE_URL
      : // If not set, check for NEXT_PUBLIC_VERCEL_URL, which is automatically set by Vercel.
        process?.env?.NEXT_PUBLIC_VERCEL_URL &&
          process.env.NEXT_PUBLIC_VERCEL_URL.trim() !== ''
        ? process.env.NEXT_PUBLIC_VERCEL_URL
        : // If neither is set, default to localhost for local development.
          'http://localhost:3000/';

  // Trim the URL and remove trailing slash if exists.
  url = url.replace(/\/+$/, '');
  // Make sure to include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}`;
  // Ensure path starts without a slash to avoid double slashes in the final URL.
  path = path.replace(/^\/+/, '');

  // Concatenate the URL and the path.
  return path ? `${url}/${path}` : url;
};

/**
 * Posts JSON data to a given URL using same-origin credentials.
 *
 * @param options.url - The endpoint URL to POST to.
 * @param options.data - Optional payload containing a `price` object.
 * @returns The parsed JSON response.
 */
export const postData = async ({
  url,
  data
}: {
  url: string;
  data?: { price: Price };
}) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    credentials: 'same-origin',
    body: JSON.stringify(data)
  });

  return res.json();
};

/**
 * Converts a Unix timestamp in seconds to a JavaScript `Date` object.
 *
 * Used primarily for converting Stripe timestamp fields to JS dates for database storage.
 *
 * @param secs - Unix timestamp in seconds.
 * @returns A `Date` object representing the given timestamp.
 */
export const toDateTime = (secs: number) => {
  var t = new Date(+0); // Unix epoch start.
  t.setSeconds(secs);
  return t;
};

/**
 * Calculates the Unix timestamp (seconds) for when a subscription trial should end.
 *
 * Returns `undefined` if trial days is null, undefined, or less than 2 days.
 * Adds one extra buffer day to the trial period.
 *
 * @param trialPeriodDays - Number of trial days, or null/undefined for no trial.
 * @returns Unix timestamp in seconds for the trial end, or `undefined`.
 */
export const calculateTrialEndUnixTimestamp = (
  trialPeriodDays: number | null | undefined
) => {
  // Check if trialPeriodDays is null, undefined, or less than 2 days
  if (
    trialPeriodDays === null ||
    trialPeriodDays === undefined ||
    trialPeriodDays < 2
  ) {
    return undefined;
  }

  const currentDate = new Date(); // Current date and time
  const trialEnd = new Date(
    currentDate.getTime() + (trialPeriodDays + 1) * 24 * 60 * 60 * 1000
  ); // Add trial days
  return Math.floor(trialEnd.getTime() / 1000); // Convert to Unix timestamp in seconds
};

const toastKeyMap: { [key: string]: string[] } = {
  status: ['status', 'status_description'],
  error: ['error', 'error_description']
};

/**
 * Builds a redirect URL with encoded toast notification query parameters.
 *
 * @param path - Base path for the redirect.
 * @param toastType - Type of toast: `'status'` or `'error'`.
 * @param toastName - Short toast title.
 * @param toastDescription - Optional longer description.
 * @param disableButton - If true, appends `disable_button=true`.
 * @param arbitraryParams - Optional additional query string to append.
 * @returns The constructed redirect path with query parameters.
 */
const getToastRedirect = (
  path: string,
  toastType: string,
  toastName: string,
  toastDescription: string = '',
  disableButton: boolean = false,
  arbitraryParams: string = ''
): string => {
  const [nameKey, descriptionKey] = toastKeyMap[toastType];

  let redirectPath = `${path}?${nameKey}=${encodeURIComponent(toastName)}`;

  if (toastDescription) {
    redirectPath += `&${descriptionKey}=${encodeURIComponent(toastDescription)}`;
  }

  if (disableButton) {
    redirectPath += `&disable_button=true`;
  }

  if (arbitraryParams) {
    redirectPath += `&${arbitraryParams}`;
  }

  return redirectPath;
};

/**
 * Builds a redirect URL with success toast notification parameters.
 *
 * @param path - Base path for the redirect.
 * @param statusName - Short status title (e.g., `'Success!'`).
 * @param statusDescription - Optional longer description.
 * @param disableButton - If true, disables form buttons on the target page.
 * @param arbitraryParams - Optional additional query string.
 * @returns The redirect path with `?status=...&status_description=...` params.
 */
export const getStatusRedirect = (
  path: string,
  statusName: string,
  statusDescription: string = '',
  disableButton: boolean = false,
  arbitraryParams: string = ''
) =>
  getToastRedirect(
    path,
    'status',
    statusName,
    statusDescription,
    disableButton,
    arbitraryParams
  );

/**
 * Builds a redirect URL with error toast notification parameters.
 *
 * @param path - Base path for the redirect.
 * @param errorName - Short error title (e.g., `'Sign in failed.'`).
 * @param errorDescription - Optional longer description.
 * @param disableButton - If true, disables form buttons on the target page.
 * @param arbitraryParams - Optional additional query string.
 * @returns The redirect path with `?error=...&error_description=...` params.
 */
export const getErrorRedirect = (
  path: string,
  errorName: string,
  errorDescription: string = '',
  disableButton: boolean = false,
  arbitraryParams: string = ''
) =>
  getToastRedirect(
    path,
    'error',
    errorName,
    errorDescription,
    disableButton,
    arbitraryParams
  );
