const passport = require("passport");
const GoogleStategy = require("passport-google-oauth20");
const User = require("../model/User");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
//only need serualize user id into cookie, cz miniae the storage
//serialized = creating cookie
passport.serializeUser((user, done) => {
  console.log("Serializing user now");
  done(null, user._id);
});

passport.deserializeUser((_id, done) => {
  console.log("Deserializing user now");
  User.findById({ _id }).then((user) => {
    console.log("Found user.");
    done(null, user);
  });
});

passport.use(
  new LocalStrategy((username, password, done) => {
    console.log(username, password);
    User.findOne({ email: username })
      .then(async(user) => {
        if (!user) {
          return done(null, false);
        }
        await bcrypt.compare(password, user.password, function (err, result) {
          if (err) {
            return done(null, false);
          }

          if (!result) {
            return done(null, false);
          } else {
            return done(null, user);
          }
        });
      })
      .catch((err) => {
        return done(null, false);
      });
  })
);

passport.use(
  new GoogleStategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/redirect",
    },
    (accessToken, refreshToken, profile, done) => {
      //passport call back
      console.log(profile);
      User.findOne({ googleID: profile.id }).then((foundUser) => {
        if (foundUser) {
          console.log("User already exist");
          done(null, foundUser);
        } else {
          new User({
            name: profile.displayName,
            googleID: profile.id,
            thumbnail: profile.photos[0].value,
            email: profile.email,
          })
            .save()
            .then((newUser) => {
              console.log("New user added");
              done(null, newUser);
            });
        }
      });
    }
  )
);
