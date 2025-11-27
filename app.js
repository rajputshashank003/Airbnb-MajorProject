if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}
const cors = require('cors');
const express = require("express");
const app = express();

// here we used MVC FRAMEWORK MODELS VIEWS AND CONTROLLERS MENTION IT ON RESUME 

const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");// help to create layouts or templates 

const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const MongoStore = require("connect-mongo");

const {listingSchema , reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");

const listingRouter = require("./routes/listing.js"); 
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const searchRouter = require("./routes/search.js");
const tempRouter = require("./routes/temp.js");

const session = require("express-session");
const flash = require("connect-flash");

const path = require("path");

const passport = require("passport"); // sessions are required for passport because in same session user doesn't have to register again 
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const Listing = require("./models/listing");

const { rmSync } = require("fs");
const { serialize } = require("v8");
const { isLoggedIn } = require("./middleware.js");
app.set("view engine" ,"ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"public")));   
app.use(cors({ origin: '*' }));

const dbUrl = process.env.ATLASDB_URL; 
// const dbUrl = "mongodb://127.0.0.1:27017/wanderlust";

// app.get("/" ,(req,res) => { 
//     res.send("hii ! i am root ");
// }); 

const store = MongoStore.create({
    mongoUrl : dbUrl,
    crypto : {
        secret : process.env.SECRET,
    },
    touchAfter : 24 * 3600 ,
});
 
store.on("error" , () => {
    console.log("ERROR in mongo-session-store" , error);
});

const sessionOptions = {
    store ,
    secret: process.env.SECRET,
    resave :false,
    saveUninitialized : true,
    cookie : {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true, 
    },
};


app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session()); // identify same user on different page 
passport.use(new LocalStrategy(User.authenticate())); 

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res ,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser", async (req,res) => {
//     let fakeUser = new User({
//         email : "student@gmail.com",
//         username : "delt-student",
//     });

//     let registeredUser = await User.register(fakeUser, "hello"); // also check username is unique or not !
//     res.send(registeredUser);    
// });



app.use("/listings" , listingRouter);
app.use("/listings/:id/reviews" , reviewRouter);
app.use("/" , userRouter);
app.use("/searched", searchRouter);
app.use("/temp", tempRouter);

const multiavatar = require('@multiavatar/multiavatar');


main()
    .then( () => { 
        console.log("connected to database");
    }) 
    .catch(err=> { 
        console.log(err);
        console.log("error agya bhai database connection me !");
    });


async function main() {
    await mongoose.connect(dbUrl);
}

app.get("/",(req, res) => {
    res.redirect("/listings");
});
app.get("/currprofile" , isLoggedIn, async (req,res) => {
    const avatar = multiavatar(`87656${Math.round(Math.random() * 1000)}`);

    let filteredLists  = [];
    let filteredLists2  = [];
    let count = 0;
    if(res.locals.currUser){
        const input = res.locals.currUser.username;
        const allLists = await Listing.find({})
            .populate({
                path : "reviews" ,
                populate : {
                    path : "author",
                }
            })
            .populate("owner");

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
            if(list.reviews[0] && list.reviews[0].author.username){
                i = input.toLowerCase();
                l = list.reviews[0].author.username.toLowerCase();
                let val4 = matchWords(l,i);

                if(Object.keys(val4).length >= 1){
                    filteredLists.push(list);
                    count++;
                }
            }
        }

        for(list of allLists){
                i = input.toLowerCase();
                l = list.owner.username.toLowerCase();
                let val4 = matchWords(l,i);

                if(Object.keys(val4).length >= 1){
                    filteredLists2.push(list);
                    count++;
                }
        }

    }
    
    res.render("users/currProfile.ejs" , {filteredLists , count , filteredLists2, avatar});

});
app.get("/editProfile" ,(req, res) => {
    req.flash("success", " Page in developing phase !");
    res.redirect("/currProfile");   
});



app.all("*",(req,res,next) => {
    next(new ExpressError(404, "Page Not Found!"));
})
app.use((err,req,res,next) => {
    let {status=500 , message ="something went wrong!"} = err;
    res.status(status).render("error.ejs",{message});
    // res.status(status).send(message );
});


app.listen(8080, () => {
    console.log("server listening on port 8080");
});