const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
//import for custom errors
const ExpressError = require("./utils/ExpressError.js");
//import all listing routes
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

// Start server on port 8080
const port = 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port} 🔥`);
});

//mongodb://127.0.0.1:27017/<dataBase name>'

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

//main funtion call to connect to mongoDB
main()
  .then(() => {
    console.log("connection sucessful");
  })
  .catch((err) => console.log(err));

//Connect to mondoDb using mongoose
async function main() {
  await mongoose.connect(MONGO_URL);

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const sessionOptions = {
  secret: "mnbkgs64n64flsddjfs456jdnfqi5453534mwnb23kn4j32ji4jb423b4",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 21 * 60 * 60 * 1000,
    maxAge: 7 * 21 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.get("/", (req, res) => {
  res.redirect(`/listings`);
});

app.use(session(sessionOptions));
app.use(flash());

app.use((req, res, next) => {
  res.locals.sucess = req.flash("sucess");
  next();
});

app.get("/", (req, res) => {
  res.redirect(`/listings`);
});

//use all listing routes
app.use("/listings", listings);

//all review routes
app.use("/listings/:id/reviews", reviews);

//default route

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});
//Servr side  error handling
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Error" } = err;
  res.status(statusCode).render("error.ejs", { err });
  //res.status(statusCode).send(message);
});
