import { OAuth2Client, TokenPayload } from 'google-auth-library';
import keys from '../../config/keys';

export interface OAuthProfile {
  provider: 'google' | 'facebook';
  providerId: string;
  email: string;
  name: string;
}

const getGoogleClient = (): OAuth2Client => {
  return new OAuth2Client(keys.googClient, keys.googkey);
};

const assertGoogleConfig = (): void => {
  if (!keys.googClient || !keys.googkey) {
    throw new Error('Google OAuth is not configured');
  }
};

const assertFacebookConfig = (): void => {
  if (!keys.fbookClient || !keys.fbookKey) {
    throw new Error('Facebook OAuth is not configured');
  }
};

const ensureGooglePayload = (payload: TokenPayload | undefined): TokenPayload => {
  if (!payload?.sub || !payload.email || !payload.name) {
    throw new Error('Google OAuth profile is missing required fields');
  }

  return payload;
};

export const buildGoogleOAuthUrl = (redirectUri: string, state?: string): string => {
  assertGoogleConfig();
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', keys.googClient);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', 'consent');
  if (state) {
    url.searchParams.set('state', state);
  }
  return url.toString();
};

export const exchangeGoogleCode = async (
  code: string,
  redirectUri: string
): Promise<OAuthProfile> => {
  assertGoogleConfig();

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: keys.googClient,
      client_secret: keys.googkey,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google token exchange failed: ${response.status} ${body}`);
  }

  const tokenResponse = (await response.json()) as { id_token?: string };
  if (!tokenResponse.id_token) {
    throw new Error('Google token exchange did not return an id_token');
  }

  const client = getGoogleClient();
  const ticket = await client.verifyIdToken({
    idToken: tokenResponse.id_token,
    audience: keys.googClient,
  });

  const payload = ensureGooglePayload(ticket.getPayload());
  return {
    provider: 'google',
    providerId: payload.sub,
    email: payload.email as string,
    name: payload.name as string,
  };
};

export const buildFacebookOAuthUrl = (redirectUri: string, state?: string): string => {
  assertFacebookConfig();
  const url = new URL('https://www.facebook.com/v22.0/dialog/oauth');
  url.searchParams.set('client_id', keys.fbookClient);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'email,public_profile');
  if (state) {
    url.searchParams.set('state', state);
  }
  return url.toString();
};

export const exchangeFacebookCode = async (
  code: string,
  redirectUri: string
): Promise<OAuthProfile> => {
  assertFacebookConfig();

  const tokenUrl = new URL('https://graph.facebook.com/v22.0/oauth/access_token');
  tokenUrl.searchParams.set('client_id', keys.fbookClient);
  tokenUrl.searchParams.set('client_secret', keys.fbookKey);
  tokenUrl.searchParams.set('redirect_uri', redirectUri);
  tokenUrl.searchParams.set('code', code);

  const tokenResponse = await fetch(tokenUrl.toString());
  if (!tokenResponse.ok) {
    const body = await tokenResponse.text();
    throw new Error(`Facebook token exchange failed: ${tokenResponse.status} ${body}`);
  }

  const tokenData = (await tokenResponse.json()) as { access_token?: string };
  if (!tokenData.access_token) {
    throw new Error('Facebook token exchange did not return an access token');
  }

  const profileUrl = new URL('https://graph.facebook.com/me');
  profileUrl.searchParams.set('fields', 'id,name,email');
  profileUrl.searchParams.set('access_token', tokenData.access_token);

  const profileResponse = await fetch(profileUrl.toString());
  if (!profileResponse.ok) {
    const body = await profileResponse.text();
    throw new Error(`Facebook profile lookup failed: ${profileResponse.status} ${body}`);
  }

  const profile = (await profileResponse.json()) as {
    id?: string;
    email?: string;
    name?: string;
  };

  if (!profile.id || !profile.name || !profile.email) {
    throw new Error('Facebook profile is missing id, name, or email');
  }

  return {
    provider: 'facebook',
    providerId: profile.id,
    email: profile.email,
    name: profile.name,
  };
};
