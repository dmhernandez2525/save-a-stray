import User from './User';
import Animal from './Animal';
import Application from './Application';
import Shelter from './Shelter';
import AdoptionFee from './AdoptionFee';

export { User, Animal, Application, Shelter, AdoptionFee };

// Also import models to ensure they are registered with Mongoose
import './User';
import './Animal';
import './Application';
import './Shelter';
import './AdoptionFee';
