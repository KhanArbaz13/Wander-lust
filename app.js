const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
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

app.get("/", (req, res) => {
  res.send("working root");
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
