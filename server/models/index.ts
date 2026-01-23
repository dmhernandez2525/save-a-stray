import User from './User';
import Animal from './Animal';
import Application from './Application';
import Shelter from './Shelter';
import Foster from './Foster';
import SavedSearch from './SavedSearch';

export { User, Animal, Application, Shelter, Foster, SavedSearch };

// Also import models to ensure they are registered with Mongoose
import './User';
import './Animal';
import './Application';
import './Shelter';
import './Foster';
import './SavedSearch';
