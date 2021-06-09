const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy;



const GOOGLE_CLIENT_ID = '256696008780-uk2uctlhrs8vrpg7vdtamurnilf70gr8.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = 'VLDyE6WcpAGfka_Q50tPGwIy';
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:4000/controller/auth/google/callback",
    passReqToCallback: true
  },
  function(request, accessToken, refreshToken, profile, done) {
      return done(null, profile);
  }));

passport.serializeUser(function(user,done) {
    done(null,user);
});
passport.deserializeUser(function(user,done) {
    done(null,user);
});



