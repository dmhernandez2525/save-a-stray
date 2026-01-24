import User from './User';
import Animal from './Animal';
import Application from './Application';
import Shelter from './Shelter';
import Microchip from './Microchip';

export { User, Animal, Application, Shelter, Microchip };

// Also import models to ensure they are registered with Mongoose
import './User';
import './Animal';
import './Application';
import './Shelter';
import './Microchip';
