// Schema for each listing

const mongoose = require("mongoose");
const Scheam = mongoose.Schema;

const listingSchema = new Scheam({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  image: {
    type: String,
    //set default link for image if no image is provided
    default:
      "https://unsplash.com/photos/turned-off-flat-screen-television-on-white-dresser-dv9AoOYegRc",
    set: (v) =>
      v === ""
        ? "https://unsplash.com/photos/turned-off-flat-screen-television-on-white-dresser-dv9AoOYegRc"
        : v,
  },
  price: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
