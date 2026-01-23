import { Keys } from '../shared/types';

const keys: Keys = {
  MONGO_URI: process.env.MONGO_URI || '',
  secretOrKey: process.env.SECRET_OR_KEY || '',
  fbookKey: process.env.FBOOK_KEY || '',
  fbookClient: process.env.FBOOK_CLIENT || '',
  fbookCallbackURL: process.env.FBOOK_CALLBACK_URL || '',
  googClient: process.env.GOOG_CLIENT || '',
  googkey: process.env.GOOG_SECRET || ''
};

export default keys;
