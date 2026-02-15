/**
 * @module auth-helpers/settings
 * @description Authentication configuration toggles and view-type helpers.
 *
 * Controls which authentication methods are enabled (OAuth, email magic link,
 * password) and whether redirects happen on the server or client side.
 * Also provides helpers to derive the list of valid sign-in views and the
 * default view based on the current configuration.
 */

// Boolean toggles to determine which auth types are allowed
const allowOauth = true;
const allowEmail = true;
const allowPassword = true;

// Boolean toggle to determine whether auth interface should route through server or client
// (Currently set to false because screen sometimes flickers with server redirects)
const allowServerRedirect = false;

// Check that at least one of allowPassword and allowEmail is true
if (!allowPassword && !allowEmail)
  throw new Error('At least one of allowPassword and allowEmail must be true');

/** Returns the currently enabled authentication method flags. */
export const getAuthTypes = () => {
  return { allowOauth, allowEmail, allowPassword };
};

/** Returns the list of valid sign-in view type strings based on enabled auth methods. */
export const getViewTypes = () => {
  // Define the valid view types
  let viewTypes: string[] = [];
  if (allowEmail) {
    viewTypes = [...viewTypes, 'email_signin'];
  }
  if (allowPassword) {
    viewTypes = [
      ...viewTypes,
      'password_signin',
      'forgot_password',
      'update_password',
      'signup'
    ];
  }

  return viewTypes;
};

/**
 * Determines the default sign-in view, respecting the user's preferred view if valid.
 * @param preferredSignInView - Cookie-stored preferred view, or null.
 * @returns The view type string to render (e.g., `'password_signin'`).
 */
export const getDefaultSignInView = (preferredSignInView: string | null) => {
  // Define the default sign in view
  let defaultView = allowPassword ? 'password_signin' : 'email_signin';
  if (preferredSignInView && getViewTypes().includes(preferredSignInView)) {
    defaultView = preferredSignInView;
  }

  return defaultView;
};

/** Returns `'server'` or `'client'` based on the redirect method configuration. */
export const getRedirectMethod = () => {
  return allowServerRedirect ? 'server' : 'client';
};
