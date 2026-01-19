import './models';
import express, { Request, Response, NextFunction } from 'express';
import keys from '../config/keys';
import { createHandler } from 'graphql-http/lib/use/express';
import schema from './schema/schema';
import cors from 'cors';
import mongoose from 'mongoose';
import { Strategy as FacebookStrategy, Profile } from 'passport-facebook';
import passport from 'passport';
import { facebookRegister } from './services/auth';

const db = keys.MONGO_URI;

interface UserStuff {
  userId: string;
  token: string;
}

passport.use(
  new FacebookStrategy({
    clientID: keys.fbookClient,
    clientSecret: keys.fbookKey,
    callbackURL: 'https://save-a-stray.herokuapp.com/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'photos', 'email']
  },
    async (accessToken: string, refreshToken: string, profile: Profile, cb: (error: Error | null, user?: UserStuff) => void) => {
      try {
        const userData = await facebookRegister(profile);
        const userStuff: UserStuff = { userId: userData._id, token: userData.token };
        cb(null, userStuff);
      } catch (error) {
        cb(error as Error);
      }
    },
  ),
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((obj: Express.User, cb) => {
  cb(null, obj);
});

const app = express();

// Health check endpoint for Render.com
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use((_req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.use(cors());
app.use(passport.initialize());

app.use(passport.session());

// Use graphql-http instead of deprecated express-graphql
app.all("/graphql", createHandler({ schema }));

// Use Express built-in JSON parser
app.use(express.json());

app.get('/a', () => console.log(11111111111111));
app.get('/facebooklogin', cors(), passport.authenticate('facebook'));
app.get(
  '/auth/facebook/callback',
  cors(),
  passport.authenticate('facebook', { session: false }),
  (req: Request & { userStuff?: UserStuff }, res: Response) => {
    res.json({ my_token: req.userStuff?.token });
  },
);

// Connect to MongoDB
if (db) {
  mongoose
    .connect(db)
    .then(() => console.log("Connected to MongoDB successfully"))
    .catch(err => console.error("MongoDB connection error:", err));
} else {
  console.warn("WARNING: MONGO_URI not configured. Database features will not work.");
}

export default app;
