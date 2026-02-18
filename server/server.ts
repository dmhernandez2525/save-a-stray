import './models';
import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import mongoose from 'mongoose';
import { Strategy as FacebookStrategy, Profile } from 'passport-facebook';
import passport from 'passport';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import keys from '../config/keys';
import schema from './schema/schema';
import { facebookRegister } from './services/auth-legacy';
import { createGraphQLContext, GraphQLContext } from './graphql/context';
import { logger } from './services/logger';
import { createGraphQLValidationRules } from './graphql/validation-rules';
import { formatGraphQLError } from './graphql/errors';
import { authRateLimitMiddleware } from './middleware/auth-rate-limit';
import apiV1Router from './routes/api-v1';

const db = keys.MONGO_URI;

interface UserStuff {
  userId: string;
  token: string;
}

// Only initialize Facebook OAuth if credentials are configured
if (keys.fbookClient && keys.fbookKey) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: keys.fbookClient,
        clientSecret: keys.fbookKey,
        callbackURL: keys.fbookCallbackURL || '/auth/facebook/callback',
        profileFields: ['id', 'displayName', 'photos', 'email'],
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        cb: (error: Error | null, user?: UserStuff) => void
      ) => {
        try {
          const userData = await facebookRegister(profile);
          const userStuff: UserStuff = { userId: userData._id, token: userData.token };
          cb(null, userStuff);
        } catch (error) {
          cb(error as Error);
        }
      }
    )
  );
} else {
  logger.warn('facebook_oauth_unconfigured', {
    message: 'Facebook OAuth not configured. FBOOK_CLIENT and FBOOK_KEY env vars required.',
  });
}

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((obj: Express.User, cb) => {
  cb(null, obj);
});

const app = express();
const httpServer = createServer(app);

// Health check endpoint for Render.com
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Configure CORS with specific allowed origins
const getAllowedOrigins = (): string[] => {
  const originsEnv = process.env.ALLOWED_ORIGINS;
  if (originsEnv) {
    return originsEnv
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
  }
  // Default allowed origins for development
  if (process.env.NODE_ENV !== 'production') {
    return [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
    ];
  }
  // In production, require explicit configuration
  logger.warn('cors_unconfigured', {
    message: 'ALLOWED_ORIGINS not configured in production. CORS will be restrictive.',
  });
  return [];
};

const allowedOrigins = getAllowedOrigins();

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) {
      callback(null, true);
      return;
    }
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(passport.initialize());
// Only use passport.session() when Facebook OAuth is configured
if (keys.fbookClient && keys.fbookKey) {
  app.use(passport.session());
}

app.get('/facebooklogin', cors(), passport.authenticate('facebook'));
app.get(
  '/auth/facebook/callback',
  cors(),
  passport.authenticate('facebook', { session: false }),
  (req: Request & { userStuff?: UserStuff }, res: Response) => {
    res.json({ my_token: req.userStuff?.token });
  }
);

// REST API v1
app.use('/api/v1', apiV1Router);

// Connect to MongoDB
if (db) {
  mongoose
    .connect(db)
    .then(() => logger.info('mongodb_connected', { message: 'Connected to MongoDB successfully' }))
    .catch((err: Error) => logger.error('mongodb_connection_error', { message: err.message }));
} else {
  logger.warn('mongodb_unconfigured', {
    message: 'MONGO_URI not configured. Database features will not work.',
  });
}

const startApolloServer = async (): Promise<void> => {
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx) => {
        // Accept both 'authorization' and 'Authorization' for case-insensitive header handling
        const params = ctx.connectionParams ?? {};
        const authHeader =
          typeof params.authorization === 'string'
            ? params.authorization
            : typeof params.Authorization === 'string'
              ? params.Authorization
              : undefined;
        return createGraphQLContext(undefined, authHeader);
      },
    },
    wsServer
  );

  const apolloServer = new ApolloServer<GraphQLContext>({
    schema,
    validationRules: createGraphQLValidationRules(),
    formatError: formatGraphQLError,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await apolloServer.start();

  app.use(
    '/graphql',
    express.json(),
    authRateLimitMiddleware,
    expressMiddleware(apolloServer, {
      context: async ({ req, res }) => createGraphQLContext(req, undefined, res),
    }) as express.RequestHandler
  );
};

export { app, httpServer, startApolloServer };
export default app;
