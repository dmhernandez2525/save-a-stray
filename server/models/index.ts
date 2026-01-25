import User from './User';
import Animal from './Animal';
import Application from './Application';
import Shelter from './Shelter';
import Foster from './Foster';
import SavedSearch from './SavedSearch';
import ApplicationTemplate from './ApplicationTemplate';
import ActivityLog from './ActivityLog';
import TerminalReader from './TerminalReader';
import Message from './Message';

export { User, Animal, Application, Shelter, Foster, SavedSearch, ApplicationTemplate, ActivityLog, TerminalReader, Message };

// Also import models to ensure they are registered with Mongoose
import './User';
import './Animal';
import './Application';
import './Shelter';
import './Foster';
import './SavedSearch';
import './ApplicationTemplate';
import './ActivityLog';
import './TerminalReader';
import './Message';
