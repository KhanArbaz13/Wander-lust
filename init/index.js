const mongoose = require("mongoose");
const initData = require("./data.js");
const listing = require("../models/listing.js");

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

const initDB = async () => {
  await listing.deleteMany({});
  await listing.insertMany(initData.data);
  console.log("data initalized");
};

initDB();
