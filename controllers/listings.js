const Listing = require("../models/listing");
const axios = require('axios');
const apiKey = process.env.MAP_TOKEN;


module.exports.index = async (req,res) => { // render all listings 
    const allLists = await Listing.find({}); 
    res.render("listings/index.ejs", { allLists});
};

module.exports.renderNewForm = (req,res) => {   
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req,res) => {

    let {id} = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path : "reviews" ,
            populate : {
                path : "author",
            }
        })
        .populate("owner");

    if(!listing){
        req.flash("error" , "Listing you requested for doesn't exist ! ");
        res.redirect("/listings");
    }

    res.render("listings/show.ejs", {listing});
};

module.exports.createListing = async (req,res,next) => {

    const addressToSearch = req.body.listing.location;
    console.log(req.body.listing.location);

    const response = await axios.get('http://dev.virtualearth.net/REST/v1/Locations', {
        params: {
            query: addressToSearch,
            key: apiKey,
        },
    });

        // Extract the coordinates from the API response
    const coordinates = response.data.resourceSets[0].resources[0].point.coordinates;

        // Display the coordinates
    const responseObj = {
        coordinates: {
            latitude: coordinates[0],
            longitude: coordinates[1],
        },
    };

    let url = req.file.path;
    let filename = req.file.filename;


    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    let geoObj = { type : 'Point' , coordinates : [ responseObj.coordinates.longitude , responseObj.coordinates.latitude]};
    newListing.geometry = geoObj;

    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success" ,"New Listing Created!");
    res.redirect("/listings");   
};

module.exports.renderEditForm = async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error" , "Listing you requested for doesn't exist ! ");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250"); // cloudinary api for changing image quality 

    res.render("listings/edit.ejs" , {listing ,originalImageUrl});
};

module.exports.updateListing = async (req,res) => { // validate listing act as middleware in this request 

    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing}); // converting every object from request from body from listings into element update in listings database 
    console.log(req.body);
    if(typeof req.file !== "undefined"){ 
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
        await listing.save();
    }

    req.flash("success" , "Listing Updated! ");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req,res) => {
    let {id} = req.params;
    let deletedlisting  = await Listing.findByIdAndDelete(id);
    console.log(deletedlisting);
    req.flash("success" , "Listing Deleted ");
    res.redirect("/listings");
};

