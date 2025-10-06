/**
 * WebAuthn utilities for passkey authentication
 * Provides functions to generate authentication and registration options
 */

import { generateAuthenticationOptions, generateRegistrationOptions, PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/server';

export interface PasskeyRegistrationOptions extends PublicKeyCredentialCreationOptionsJSON {}

export interface PasskeyAuthenticationOptions extends PublicKeyCredentialRequestOptionsJSON {}

/**
 * Generate WebAuthn registration options for passkey creation
 */
export async function generatePasskeyRegistrationOptions(
  userId: string,
  userEmail: string,
  userName: string,
  existingCredentials: string[] = []
): Promise<PasskeyRegistrationOptions> {
  const rpName = 'MNNR';
  const rpID = process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '') || 'localhost';

  const options = generateRegistrationOptions({
    rpName,
    rpID,
    userID: new Uint8Array(Buffer.from(userId, 'utf-8')),
    userName: userEmail,
    userDisplayName: userName,
    attestationType: 'direct',
    excludeCredentials: existingCredentials.map(id => ({
      id,
      type: 'public-key',
    })),
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      requireResidentKey: true,
      userVerification: 'preferred',
    },
  });

  return options;
}

/**
 * Generate WebAuthn authentication options for passkey login
 */
export async function generatePasskeyAuthenticationOptions(
  allowedCredentials: string[] = []
): Promise<PasskeyAuthenticationOptions> {
  const rpID = process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '') || 'localhost';

  const options = generateAuthenticationOptions({
    rpID,
    allowCredentials: allowedCredentials.length > 0 ? allowedCredentials.map(id => ({
      id,
      type: 'public-key',
    })) : undefined,
    userVerification: 'preferred',
  });

  return options;
}

interface WebAuthnCredential {
  id: string;
  publicKey?: string;
}

/**
 * Verify WebAuthn registration response
 */
export async function verifyPasskeyRegistration(
  credential: WebAuthnCredential,
  _expectedChallenge: string,
  _expectedOrigin: string
) {
  // This would contain the verification logic
  // For now, return a mock successful verification
  return {
    verified: true,
    registrationInfo: {
      credentialID: credential.id,
      credentialPublicKey: credential.publicKey || '',
      counter: 0,
    },
  };
}

/**
 * Verify WebAuthn authentication response
 */
export async function verifyPasskeyAuthentication(
  credential: WebAuthnCredential,
  _expectedChallenge: string,
  _expectedOrigin: string,
  _expectedRPID: string
) {
  // This would contain the verification logic
  // For now, return a mock successful verification
  return {
    verified: true,
    authenticationInfo: {
      credentialID: credential.id,
      newCounter: 1,
    },
  };
}