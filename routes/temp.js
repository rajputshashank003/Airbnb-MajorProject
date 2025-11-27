const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const listingController = require("../controllers/listings.js");

const router = express.Router();

router
    .route("/")
    .get(wrapAsync(listingController.index))


module.exports = router;