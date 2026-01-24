import User from './User';
import Animal from './Animal';
import Application from './Application';
import Shelter from './Shelter';
import IntakeLog from './IntakeLog';

export { User, Animal, Application, Shelter, IntakeLog };

// Also import models to ensure they are registered with Mongoose
import './User';
import './Animal';
import './Application';
import './Shelter';
import './IntakeLog';
