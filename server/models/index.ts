import User from './User';
import Animal from './Animal';
import Application from './Application';
import Shelter from './Shelter';

export { User, Animal, Application, Shelter };

// Also import models to ensure they are registered with Mongoose
import './User';
import './Animal';
import './Application';
import './Shelter';
