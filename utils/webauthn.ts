/**
 * WebAuthn/Passkeys Implementation
 * Passwordless authentication using biometrics (Face ID, Touch ID, Windows Hello)
 */

import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type VerifiedRegistrationResponse,
  type VerifiedAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/types';
import { createClient } from '@/utils/supabase/server';
import { logger } from './logger';
import crypto from 'crypto';

// Environment configuration
const rpName = process.env.NEXT_PUBLIC_SITE_NAME || 'MNNR';
const rpID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';
const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export interface Passkey {
  id: string;
  user_id: string;
  credential_id: string;
  public_key: string;
  counter: number;
  device_type: string;
  created_at: string;
  last_used_at?: string;
  friendly_name?: string;
}

/**
 * Generate registration options for a new passkey
 */
export async function generatePasskeyRegistrationOptions(
  userId: string,
  userEmail: string,
  userName?: string
): Promise<PublicKeyCredentialCreationOptionsJSON> {
  try {
    const supabase = createClient();

    // Get existing passkeys to exclude
    const { data: existingPasskeys } = await supabase
      .from('passkeys')
      .select('credential_id')
      .eq('user_id', userId);

    const excludeCredentials = existingPasskeys?.map((p) => ({
      id: p.credential_id,
      type: 'public-key' as const,
    })) || [];

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: userId,
      userName: userName || userEmail,
      userDisplayName: userName || userEmail.split('@')[0],
      attestationType: 'none',
      excludeCredentials,
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform', // Prefer platform authenticators (Face ID, Touch ID)
      },
    });

    // Store challenge for verification
    await supabase.from('passkey_challenges').insert({
      user_id: userId,
      challenge: options.challenge,
      type: 'registration',
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
    });

    logger.info('Passkey registration options generated', { userId });

    return options;
  } catch (error) {
    logger.error('Failed to generate passkey registration options', error, { userId });
    throw new Error('Failed to generate passkey registration options');
  }
}

/**
 * Verify passkey registration response
 */
export async function verifyPasskeyRegistration(
  userId: string,
  response: RegistrationResponseJSON,
  friendlyName?: string
): Promise<{ verified: boolean; passkey?: Passkey }> {
  try {
    const supabase = createClient();

    // Get the challenge
    const { data: challengeData } = await supabase
      .from('passkey_challenges')
      .select('challenge')
      .eq('user_id', userId)
      .eq('type', 'registration')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!challengeData) {
      throw new Error('Challenge not found');
    }

    // Verify the registration response
    const verification: VerifiedRegistrationResponse = await verifyRegistrationResponse({
      response,
      expectedChallenge: challengeData.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      logger.warn('Passkey registration verification failed', { userId });
      return { verified: false };
    }

    const { credentialID, credentialPublicKey, counter } = verification.registrationInfo;

    // Store the passkey
    const { data: passkey, error } = await supabase
      .from('passkeys')
      .insert({
        user_id: userId,
        credential_id: Buffer.from(credentialID).toString('base64'),
        public_key: Buffer.from(credentialPublicKey).toString('base64'),
        counter,
        device_type: getDeviceType(response),
        friendly_name: friendlyName || `Passkey ${new Date().toLocaleDateString()}`,
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to store passkey', error, { userId });
      throw error;
    }

    // Delete used challenge
    await supabase
      .from('passkey_challenges')
      .delete()
      .eq('user_id', userId)
      .eq('type', 'registration');

    logger.info('Passkey registered successfully', { userId, passkeyId: passkey.id });

    return { verified: true, passkey };
  } catch (error) {
    logger.error('Failed to verify passkey registration', error, { userId });
    return { verified: false };
  }
}

/**
 * Generate authentication options for passkey login
 */
export async function generatePasskeyAuthenticationOptions(
  userEmail?: string
): Promise<PublicKeyCredentialRequestOptionsJSON> {
  try {
    const supabase = createClient();

    let allowCredentials: Array<{ id: string; type: 'public-key' }> | undefined;

    if (userEmail) {
      // Get user's passkeys
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', userEmail)
        .single();

      if (user) {
        const { data: passkeys } = await supabase
          .from('passkeys')
          .select('credential_id')
          .eq('user_id', user.id);

        allowCredentials = passkeys?.map((p) => ({
          id: p.credential_id,
          type: 'public-key' as const,
        }));
      }
    }

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials,
      userVerification: 'preferred',
    });

    // Store challenge
    const challengeId = crypto.randomUUID();
    await supabase.from('passkey_challenges').insert({
      id: challengeId,
      challenge: options.challenge,
      type: 'authentication',
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });

    logger.info('Passkey authentication options generated', { userEmail });

    return { ...options, challengeId } as any;
  } catch (error) {
    logger.error('Failed to generate passkey authentication options', error);
    throw new Error('Failed to generate passkey authentication options');
  }
}

/**
 * Verify passkey authentication response
 */
export async function verifyPasskeyAuthentication(
  response: AuthenticationResponseJSON,
  challengeId: string
): Promise<{ verified: boolean; userId?: string }> {
  try {
    const supabase = createClient();

    // Get the challenge
    const { data: challengeData } = await supabase
      .from('passkey_challenges')
      .select('challenge')
      .eq('id', challengeId)
      .eq('type', 'authentication')
      .single();

    if (!challengeData) {
      throw new Error('Challenge not found');
    }

    // Get the passkey
    const credentialId = response.id;
    const { data: passkey } = await supabase
      .from('passkeys')
      .select('*')
      .eq('credential_id', credentialId)
      .single();

    if (!passkey) {
      logger.warn('Passkey not found', { credentialId });
      return { verified: false };
    }

    // Verify the authentication response
    const verification: VerifiedAuthenticationResponse = await verifyAuthenticationResponse({
      response,
      expectedChallenge: challengeData.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        credentialID: Buffer.from(passkey.credential_id, 'base64'),
        credentialPublicKey: Buffer.from(passkey.public_key, 'base64'),
        counter: passkey.counter,
      },
    });

    if (!verification.verified) {
      logger.warn('Passkey authentication verification failed', { userId: passkey.user_id });
      return { verified: false };
    }

    // Update counter and last used
    await supabase
      .from('passkeys')
      .update({
        counter: verification.authenticationInfo.newCounter,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', passkey.id);

    // Delete used challenge
    await supabase
      .from('passkey_challenges')
      .delete()
      .eq('id', challengeId);

    logger.info('Passkey authentication successful', { userId: passkey.user_id });

    return { verified: true, userId: passkey.user_id };
  } catch (error) {
    logger.error('Failed to verify passkey authentication', error);
    return { verified: false };
  }
}

/**
 * Get all passkeys for a user
 */
export async function getUserPasskeys(userId: string): Promise<Passkey[]> {
  try {
    const supabase = createClient();

    const { data: passkeys, error } = await supabase
      .from('passkeys')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to get user passkeys', error, { userId });
      return [];
    }

    return passkeys || [];
  } catch (error) {
    logger.error('Failed to get user passkeys', error, { userId });
    return [];
  }
}

/**
 * Delete a passkey
 */
export async function deletePasskey(userId: string, passkeyId: string): Promise<boolean> {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('passkeys')
      .delete()
      .eq('id', passkeyId)
      .eq('user_id', userId); // Ensure user owns the passkey

    if (error) {
      logger.error('Failed to delete passkey', error, { userId, passkeyId });
      return false;
    }

    logger.info('Passkey deleted', { userId, passkeyId });
    return true;
  } catch (error) {
    logger.error('Failed to delete passkey', error, { userId, passkeyId });
    return false;
  }
}

/**
 * Rename a passkey
 */
export async function renamePasskey(
  userId: string,
  passkeyId: string,
  friendlyName: string
): Promise<boolean> {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('passkeys')
      .update({ friendly_name: friendlyName })
      .eq('id', passkeyId)
      .eq('user_id', userId);

    if (error) {
      logger.error('Failed to rename passkey', error, { userId, passkeyId });
      return false;
    }

    logger.info('Passkey renamed', { userId, passkeyId, friendlyName });
    return true;
  } catch (error) {
    logger.error('Failed to rename passkey', error, { userId, passkeyId });
    return false;
  }
}

/**
 * Get device type from registration response
 */
function getDeviceType(response: RegistrationResponseJSON): string {
  // This is a simplified version - you can enhance it
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';

  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    return 'iOS';
  } else if (userAgent.includes('Android')) {
    return 'Android';
  } else if (userAgent.includes('Mac')) {
    return 'macOS';
  } else if (userAgent.includes('Windows')) {
    return 'Windows';
  } else {
    return 'Unknown';
  }
}

/**
 * Check if user has any passkeys
 */
export async function userHasPasskeys(userId: string): Promise<boolean> {
  try {
    const supabase = createClient();

    const { count } = await supabase
      .from('passkeys')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    return (count || 0) > 0;
  } catch (error) {
    logger.error('Failed to check if user has passkeys', error, { userId });
    return false;
  }
}
