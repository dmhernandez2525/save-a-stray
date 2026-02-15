import { Types } from 'mongoose';

export const encodeCursor = (id: string): string =>
  Buffer.from(id, 'utf8').toString('base64url');

export const decodeCursor = (cursor: string): string | null => {
  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf8');
    return decoded.length > 0 ? decoded : null;
  } catch {
    return null;
  }
};

export const toObjectId = (id: string): Types.ObjectId | null => {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }
  return new Types.ObjectId(id);
};
