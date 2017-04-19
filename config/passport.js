const _ = require('lodash');
const passport = require('passport');
const request = require('request');
const nodemailer = require('nodemailer');
const LocalStrategy = require('passport-local').Strategy;
//const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const OAuthStrategy = require('passport-oauth').OAuthStrategy;
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
const User = require('../models/User');
const config = require('./main');

let transporter = nodemailer.createTransport(config.smtp);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
  User.findOne({ email: email.toLowerCase() }, (err, user) => {
    if (err) { return done(err); }
    if (!user) {
      return done(null, false, { msg: `Email ${email} not found.` });
    }

    user.comparePassword(password, (err, isMatch) => {
      if (err) { return done(err); }
      if (isMatch) {
        return done(null, user);
      }
      return done(null, false, { msg: 'Invalid email or password.' });
    });
  });
}));


/**
 * OAuth Strategy Overview
 *
 * - User is already logged in.
 *   - Check if there is an existing account with a provider id.
 *     - If there is, return an error message. (Account merging not supported)
 *     - Else link new OAuth account with currently logged-in user.
 * - User is not logged in.
 *   - Check if it's a returning user.
 *     - If returning user, sign in and we are done.
 *     - Else check if there is an existing account with user's email.
 *       - If there is, return an error message.
 *       - Else create a new account.
 */


/**
 * Sign in with LinkedIn.
 */
// passport.use(new LinkedInStrategy({
//   clientID: process.env.LINKEDIN_ID,
//   clientSecret: process.env.LINKEDIN_SECRET,
//   callbackURL: process.env.LINKEDIN_CALLBACK_URL,
//   scope: ['r_basicprofile', 'r_emailaddress'],
//   passReqToCallback: true
// }, (req, accessToken, refreshToken, profile, done) => {
//   if (req.user) {
//     User.findOne({ linkedin: profile.id }, (err, existingUser) => {
//       if (err) { return done(err); }
//       if (existingUser) {
//         req.flash('errors', { msg: 'There is already a LinkedIn account that belongs to you. Sign in with that account or delete it, then link it with your current account.' });
//         done(err);
//       } else {
//         User.findById(req.user.id, (err, user) => {
//           if (err) { return done(err); }
//           user.linkedin = profile.id;
//           user.tokens.push({ kind: 'linkedin', accessToken });
//           user.profile.name = user.profile.name || profile.displayName;
//           user.profile.location = user.profile.location || profile._json.location.name;
//           user.profile.picture = user.profile.picture || profile._json.pictureUrl;
//           user.profile.website = user.profile.website || profile._json.publicProfileUrl;
//           user.save((err) => {
//             if (err) { return done(err); }
//             req.flash('info', { msg: 'LinkedIn account has been linked.' });
//             done(err, user);
//           });
//         });
//       }
//     });
//   } else {
//     User.findOne({ linkedin: profile.id }, (err, existingUser) => {
//       if (err) { return done(err); }
//       if (existingUser) {
//         return done(null, existingUser);
//       }
//       User.findOne({ email: profile._json.emailAddress }, (err, existingEmailUser) => {
//         if (err) { return done(err); }
//         if (existingEmailUser) {
//           req.flash('errors', { msg: 'There is already an account using this email address. Sign in to that account and link it with LinkedIn manually from Account Settings.' });
//           done(err);
//         } else {
//           const user = new User();
//           user.linkedin = profile.id;
//           user.tokens.push({ kind: 'linkedin', accessToken });
//           user.email = profile._json.emailAddress;
//           user.profile.name = profile.displayName;
//           user.profile.location = profile._json.location.name;
//           user.profile.picture = profile._json.pictureUrl;
//           user.profile.website = profile._json.publicProfileUrl;
//           user.save((err) => {
//             done(err, user);
//           });
//         }
//       });
//     });
//   }
// }));


/**
 * Login Required middleware.
 */
exports.isAuthenticated = (req, res, next) => {

  if (req.isAuthenticated() && req.user.isActivated) {
    return next();
  }

  if(req.isAuthenticated() && !req.user.isActivated){
      req.flash('info', { msg: 'Please check your email '+req.user.email+' and activate your account.' });
  }

  res.redirect('/login');
};

/**
 * Authorization Required middleware.
 */
exports.isAuthorized = (req, res, next) => {
  const provider = req.path.split('/').slice(-1)[0];

  if (_.find(req.user.tokens, { kind: provider })) {
    next();
  } else {
    res.redirect(`/auth/${provider}`);
  }
};
