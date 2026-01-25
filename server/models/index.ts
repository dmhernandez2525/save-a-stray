import User from './User';
import Animal from './Animal';
import Application from './Application';
import Shelter from './Shelter';
import Foster from './Foster';
import SavedSearch from './SavedSearch';
import ApplicationTemplate from './ApplicationTemplate';

export { User, Animal, Application, Shelter, Foster, SavedSearch, ApplicationTemplate };

// Also import models to ensure they are registered with Mongoose
import './User';
import './Animal';
import './Application';
import './Shelter';
import './Foster';
import './SavedSearch';
import './ApplicationTemplate';
