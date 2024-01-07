const Listing = require("../models/listing");

module.exports.searched =  async (req, res) => {
    function checkFor ( str1,str2) {
        const lowerCaseStr1 = str1.toLowerCase();
        const lowerCaseStr2 = str2.toLowerCase();

        const noSpaceStr1 = lowerCaseStr1.replace(/\s/g, '');
        const noSpaceStr2 = lowerCaseStr2.replace(/\s/g, '');

        return noSpaceStr1 === noSpaceStr2;
    };
    
    const input = req.body.input;

    let allLists = await Listing.find({}).populate("owner"); 

    let filteredLists  = [];
    

    function matchWords(paragraph1, paragraph2) {
        const words1 = paragraph1.split(" ");
        const words2 = paragraph2.split(" ");
        const matches = {};
        for (const word1 of words1) {
          for (const word2 of words2) {
            if (word1 === word2) {
              matches[word1] = word2;
            }
          }
        }
        return matches;
    }

    for(list of allLists){
        let i = input.toLowerCase();
        let l = list.country.toLowerCase();
        let val1 = checkFor(l,i);

        i = input.toLowerCase();
        l = list.title.toLowerCase();
        let val2 = matchWords(l,i);

        i = input.toLowerCase();
        l = list.location.toLowerCase();
        let val3 = matchWords(l,i);

        i = input.toLowerCase();
        l = list.owner.username.toLowerCase();
        let val4 = matchWords(l,i);

        if(val1 || Object.keys(val2).length >= 1 || Object.keys(val3).length >= 1 || Object.keys(val4).length >= 1){
            filteredLists.push(list);
        }
    }
    allLists = filteredLists;
    if(allLists.length == 0){
        req.flash("error" , "No listing found !");
        res.redirect("/listings");
    } else {
        res.render("listings/index.ejs", {allLists});
    }
};
