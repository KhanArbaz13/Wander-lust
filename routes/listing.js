const express = require("express");
const router = express.Router();
//import the schema for listing
const Listing = require("../models/listing.js");
//import warpAsync for error handling
const warpAsync = require("../utils/warpAsync.js");
//import for custom errors
const ExpressError = require("../utils/ExpressError.js");
//import for Schema validation JOI
const { listingSchema } = require("../schema.js");

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

//Show all listings index route
router.get(
  "/",
  warpAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  })
);

//render new listing page
router.get("/new", (req, res) => {
  res.render("listings/new.ejs");
});
// create new listing

router.post(
  "/",
  validateListing, //call function
  warpAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("sucess", "New Listing Added");
    res.redirect("/listings");
  })
);

//get details of listing Show Route

router.get(
  "/:id",
  warpAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listing });
  })
);

//Render edit page

router.get(
  "/:id/edit",
  warpAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);

    res.render("listings/edit.ejs", { listing });
  })
);
//Update route
router.put(
  "/:id",
  validateListing, //call function
  warpAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    res.redirect(`/listings/${id}`);
  })
);

//Delete Listing
router.delete(
  "/:id/delete",
  warpAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id, { ...req.body.listing });

    res.redirect(`/listings`);
  })
);

module.exports = router;
