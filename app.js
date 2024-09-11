const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
//import the schema for listing
const Listing = require("./models/listing.js");
//import warpAsync for error handling
const warpAsync = require("./utils/warpAsync.js");
//import for custom errors
const ExpressError = require("./utils/ExpressError.js");
//import for Schema validation JOI
const { listingSchema, reviewSchema } = require("./schema.js");
//import the schema for review
const Review = require("./models/review.js");

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

//Validate Schema listing
const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

//Validate Schema reviews
const validateReview = (req, res, next) => {
  console.log(req.body);
  let { error } = reviewSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};
//Show all listings index route
app.get(
  "/listings",
  warpAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  })
);

//render new listing page
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});
// create new listing

app.post(
  "/listings",
  validateListing, //call function
  warpAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  })
);

//get details of listing Show Route

app.get(
  "/listing/:id",
  warpAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listing });
  })
);

//Render edit page

app.get(
  "/listings/:id/edit",
  warpAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);

    res.render("listings/edit.ejs", { listing });
  })
);
//Update route
app.put(
  "/listing/:id",
  validateListing, //call function
  warpAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    res.redirect(`/listing/${id}`);
  })
);

//Delete Listing
app.delete(
  "/listings/:id/delete",
  warpAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id, { ...req.body.listing });

    res.redirect(`/listings`);
  })
);
//Create reviews path
app.post(
  "/listings/:id/reviews",
  validateReview,
  warpAsync(async (req, res) => {
    console.log(req.body.review);
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    let { id } = req.params;
    res.redirect(`/listing/${id}`);
  })
);
//delete review
app.delete(
  "/listing/:id/reviews/:reviewId",
  warpAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listing/${id}`);
  })
);

//last option

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});
//Servr side  error handling
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Error" } = err;
  res.status(statusCode).render("error.ejs", { err });
  //res.status(statusCode).send(message);
});
