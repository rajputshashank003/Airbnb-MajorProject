const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({}); // await means firstly all data in database delete then next commands can execute
  initData.data = initData.data.map( (obj) =>( {
    ...obj, 
    owner : "658e884ab2b6f029864a3d66",
  }));

  initData.data = initData.data.map( (obj) =>( {
    ...obj, 
    geometry : {type : 'Point' , coordinates : [23.65, 77.98]},
  }));
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();