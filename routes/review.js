const express = require("express");
const router = express.Router({ mergeParams: true });
//import warpAsync for error handling
const warpAsync = require("../utils/warpAsync.js");
//import for custom errors
const ExpressError = require("../utils/ExpressError.js");
//import for Schema validation JOI
const { reviewSchema } = require("../schema.js");
//import the schema for review
const Review = require("../models/review.js");
//import the schema for listing
const Listing = require("../models/listing.js");

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

//Create reviews path
router.post(
  "/",
  validateReview,
  warpAsync(async (req, res) => {
    console.log(req.body.review);
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    let { id } = req.params;
    res.redirect(`/listings/${id}`);
  })
);
//delete review
router.delete(
  "/:reviewId",
  warpAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;
