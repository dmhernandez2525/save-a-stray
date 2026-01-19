const models = require("./models");
const express = require("express");
const db = require("../config/keys.js").MONGO_URI;
const { createHandler } = require("graphql-http/lib/use/express");
const schema = require("./schema/schema");
const cors = require("cors");
const mongoose = require("mongoose");
const FacebookStrategy = require("passport-facebook").Strategy;
const Keys = require("../config/keys");
const User = require("./models/User");
const passport = require("passport");
const { facebookRegister } = require("./services/auth")

passport.use(
  new FacebookStrategy({
    clientID: Keys.fbookClient,
    clientSecret: Keys.fbookKey,
    callbackURL: 'https://save-a-stray.herokuapp.com/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'photos', 'email']
  },
    async (accessToken, refreshToken, profile, cb) => {
      let userData = await facebookRegister(profile)
      let userStuff = { userId: userData.id, token: userData.token }
      cb(null, userStuff);
    },
  ),
);

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});


const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.use(cors());
app.use(passport.initialize());

if (!db) {
  throw new Error("You must provide a string to connect to MongoDB Atlas");
}

app.use(passport.session());

// Use graphql-http instead of deprecated express-graphql
app.all("/graphql", createHandler({ schema }));

// Use Express built-in JSON parser instead of body-parser
app.use(express.json());

app.get('/a', () => console.log(11111111111111));
app.get('/facebooklogin', cors(), passport.authenticate('facebook'));
app.get(
  '/auth/facebook/callback', cors(),
  passport.authenticate('facebook', {
    session: false
  }),
  (req, res) => {
    res.json({ my_token: req.userStuff.token })
  },
);

// Connect to MongoDB (Mongoose 8.x - no deprecated options needed)
mongoose
  .connect(db)
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch(err => console.log(err));

module.exports = app;
