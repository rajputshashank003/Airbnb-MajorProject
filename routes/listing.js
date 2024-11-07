const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema , reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const {isLoggedIn , isOwner , validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer( { storage } );

// router.route() use to combine two route with same link

router
    .route("/")
    .get(wrapAsync(listingController.index)) //index route 
    .post(                                      // create route
        isLoggedIn,
        upload.single("listing[image]"),
        validateListing,
        wrapAsync(listingController.createListing)
    );

router.get("/allListingsMap" , wrapAsync(listingController.allListingsMap))


// to make new route listing here isloggesin works as middleware for checking authentication 
router.get("/new" , isLoggedIn , listingController.renderNewForm);

router
    .route("/:id")
    .get(wrapAsync(listingController.showListing)) // show route : print the data of any individual listing 
    .put(                                          // update route
        isLoggedIn ,    
        isOwner,
        upload.single("listing[image]"),
        validateListing ,
        wrapAsync(listingController.updateListing)
    )
    .delete(                                      // delete route 
        isLoggedIn,
        isOwner,
        wrapAsync(listingController.destroyListing)
    );


// index route
// router.get("/" ,wrapAsync(listingController.index));

// edit route
router.get("/:id/edit",
    isLoggedIn ,
    isOwner,
    wrapAsync(listingController.renderEditForm)
);


//create route 
// router.post(
//     "/" ,
//     isLoggedIn,
//     validateListing,
//     wrapAsync(listingController.createListing)
// );



module.exports = router;