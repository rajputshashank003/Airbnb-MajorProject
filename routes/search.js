const express = require("express");
const router = express.Router({mergeParams : true});
const searchController = require("../controllers/searched.js");

router.post("/" , searchController.searched);

module.exports = router;