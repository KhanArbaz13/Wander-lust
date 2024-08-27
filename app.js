const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
//import the schema
const Listing = require("./models/listing.js");

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

// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "villa",
//     description: "best in town",
//     price: 2000,
//     location: "Pahalgam, Kashmir",
//     country: "India",
//   });
//   await sampleListing.save();
//   console.log("Listing Added");
//   res.send("test GG");
// });

//Show all listings
app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
});

// create new listing
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

app.post("/listings", async (req, res) => {
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
});

//get details of listing

app.get("/listing/:id", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", { listing });
});

//Edit Listing

app.get("/listings/:id/edit", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);

  res.render("listings/edit.ejs", { listing });
});

app.put("/listing/:id", async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  res.redirect(`/listing/${id}`);
});

//Delete Listing
app.delete("/listings/:id/delete", async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id, { ...req.body.listing });

  res.redirect(`/listings`);
});
