import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import keys from '../../config/keys';
import User from '../models/User';
import { UserAuthPayload } from '../../shared/types';
import { buildUserAuthPayload, issueSessionAndAccessToken, normalizeEmail } from './auth-helpers';
import { createOneTimeToken } from './auth-tokens';

interface FacebookProfile {
  id: string;
  displayName: string;
  emails?: Array<{ value?: string }>;
}

interface TokenData {
  token: string;
}

export const facebookRegister = async (profile: FacebookProfile): Promise<UserAuthPayload> => {
  const email = normalizeEmail(profile.emails?.[0]?.value || `${profile.id}@facebook.local`);

  let user = await User.findOne({ $or: [{ fbookId: profile.id }, { email }] });
  if (!user) {
    const password = await bcrypt.hash(createOneTimeToken(), 12);
    user = new User({
      name: profile.displayName,
      email,
      password,
      userRole: 'endUser',
      fbookId: profile.id,
      emailVerified: true,
    });
    await user.save();
  }

  user.fbookId = profile.id;
  if (!user.emailVerified) {
    user.emailVerified = true;
  }
  await user.save();

  return issueSessionAndAccessToken(user);
};

export const verifyUser = async (data: TokenData): Promise<{ loggedIn: boolean; _id: string | null }> => {
  try {
    const decoded = jwt.verify(data.token, keys.secretOrKey, { algorithms: ['HS256'] }) as {
      id: string;
    };

    const user = await User.findById(decoded.id);
    if (!user) {
      return { loggedIn: false, _id: null };
    }

    return { loggedIn: true, _id: user._id.toString() };
  } catch {
    return { loggedIn: false, _id: null };
  }
};

export const userId = async (data: TokenData): Promise<Partial<UserAuthPayload>> => {
  try {
    const decoded = jwt.verify(data.token, keys.secretOrKey, { algorithms: ['HS256'] }) as {
      id: string;
    };

    const user = await User.findById(decoded.id);
    if (!user) {
      return { loggedIn: false };
    }

    return buildUserAuthPayload(user, { token: data.token });
  } catch {
    return { loggedIn: false };
  }
};
