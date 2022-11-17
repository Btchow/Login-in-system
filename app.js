const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require("mongoose");
require("dotenv").config();
const authRoute = require("./routes/authRoute.js");
require("./config/passport");
const profileRoute = require("./routes/profileRoute");
// const cookieSession = require("cookie-session");
const passport = require("passport");
const session = require("express-session");
const flash = require("connect-flash");
// const passportConfig = require("./config/passport")
// passportConfig(passport);
// const session = require("express-session");
// const flash = require("connect-flash");
// const bodyParser = require("body-parser");
// const User = require("./model/User.js");
// const bcrypt = require("bcrypt");

mongoose
  .connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connecting to mongodb altas ..");
  })
  .catch((err) => console.log(err));

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//the order of middleware is important
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
// app.use(
//   cookieSession({
//     keys: [process.env.SECRET],
//   })
// );

//store cookie in user browser
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");

  next();
});
app.use("/auth", authRoute);
app.use("/profile", profileRoute);

app.get("/", (req, res) => {
  res.render("index", { user: req.user });
});

app.listen(8080, () => {
  console.log(`Server started on port 8080`);
});
