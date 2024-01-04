const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose"); // used to make salting in passwords 
                                                                  // to do hashing in passwords 

const userSchema = new Schema ( {
    email : {
        type :String,
        required : true,
    } 
});

// PBKDF2 ALGORITHM USED FOR HASHING AND SALTING ;
userSchema.plugin(passportLocalMongoose); // automatically implement salting and hashing 

module.exports = mongoose.model('User' , userSchema);
