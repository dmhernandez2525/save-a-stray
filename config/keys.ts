import { Keys } from '../shared/types';

let keys: Keys;

if (process.env.NODE_ENV === 'production') {
  keys = require('./keys_prod').default || require('./keys_prod');
} else {
  keys = require('./keys_dev').default || require('./keys_dev');
}

export default keys;
