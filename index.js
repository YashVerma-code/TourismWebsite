const express=require("express");
const mongoose=require("mongoose");
const methodOverride=require("method-override");
const path=require("path");
const ejsMate=require("ejs-mate");
const app=express();
const port=8080;

const session=require("express-session");
const flash=require("connect-flash");
const passport=require("passport")
const LocalStrategy=require("passport-local").Strategy;


const Listing=require("./models/listing.js");
const Review=require("./models/reviews.js");
const User=require("./models/user.js");

const {listingSchema ,reviewSchema}=require("./schema.js");

const wrapAsync=require("./utils/wrapAsyc.js");

const ExpressError=require("./utils/ExpressError.js");


const sessionOptions={
    secret:"mysecretcode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+(1000*60*60*24*3),
        maxAge:1000*60*60*24*3,
        httpOnly:true,
    }
}


app.engine("ejs",ejsMate);

app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");

app.use(methodOverride("_method"));
app.use(express.static("public"));
app.use(express.static(path.join(__dirname,"public")));

app.use(express.urlencoded({extended:true})); 


app.use(session(sessionOptions));
app.use(flash());

// Passport 

app.use(passport.initialize());
// To initialize passport
app.use(passport.session());
// A web application needs the ability to identify users as they browse from page to page.
// This series of requests and responses, each associated with the same user, is known as a session.

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());



app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
})

// Joi -- npm package , which is used to validate schema


// Routes
async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

main().then(()=>{
    console.log("Connected to db");
}).catch((err)=>{
    console.log(err);
});

app.listen(port,(res)=>{
    console.log(`Server is listening at port ${port}`);
})

app.get("/",(req,res)=>{
    // res.send("Working");
    res.redirect("/listings");
})

const validateListing = (req, res,next)=>{
    let {error}=listingSchema.validate(req.body);

    if(error){
        throw new ExpressError(400,error.details[0].message);
    }else{
        next();
    }

}
const validateReview = (req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);

    if(error){
        throw new ExpressError(400,error.details[0].message);
    }else{
        next();
    }

}
// Login And signUp
app.get("/signup",(req,res,next)=>{
    res.render("Users/signup.ejs");
})


app.post("/signup",wrapAsync(async(req,res,next)=>{
    try{
        let {username,email,password}=req.body;
        const newUser =new User({email,username});
    
        const registeredUser=await User.register(newUser,password);
        console.log(registeredUser);
        req.log(registeredUser,err=>{
            if(err){
                return next(err);
            }
            req.flash("success","Welcome to wanderlust!");
            res.redirect("/listings");
        })
    }catch(err){
        req.flash("error",err.message);
        res.redirect("/signup")
    }
})
)

app.get("/login",(req,res)=>{
    res.render("Users/login.ejs");
})

app.post("/login",
    passport.authenticate("local" ,{failureRedirect:"/login",failureFlash:true}),
    async(req,res,next)=>{
        try{
            req.flash("success","Welcome to Wanderlust! You are logged in.");
            res.redirect("/listings");
        }catch(err){
            req.flash("error",err.message);
            res.redirect("/login");
        }
});

app.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            next(err)
        }
        req.flash("success","You are logged out!");
        res.redirect("/listings");
    });
})

// Create route
app.post("/listings",validateListing, wrapAsync(async(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.flash("error","You must be logged in to create listing");
        return res.redirect("/login");

    }
        const newListing=new Listing(req.body.listing);
        console.log(newListing);
        await newListing.save();

        req.flash("success","New Listing Created");

        res.redirect("/listings");

})
);

// Index route
app.get("/listings",wrapAsync(async(req,res)=>{ 
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}))

// New route
app.get("/listings/new",(req,res)=>{
    console.log(req.user);
    if(!req.isAuthenticated()){
        req.flash("error","You must be logged in to create listing");
        return res.redirect("/login");

    }
    res.render("listings/new.ejs");
})

// edit route
app.put("/listings/:id",
    validateListing,
    wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const updateData = {
        image: {filename:'defaultFile'},
        ...req.body.listing
    };
    console.log(updateData);
    await Listing.findByIdAndUpdate(id, updateData);
    res.redirect(`/listings/${id}`);
})
)

// Delete route
app.delete("/listings/:id",wrapAsync(async(req,res,next)=>{
    try{
        if(!req.isAuthenticated()){
            req.flash("error","You must be logged in to create listing");
            return res.redirect("/login");
    
        }
        let {id}=req.params;
        let listing=await Listing.findByIdAndDelete(id);
        console.log(listing);
        req.flash("success","Listing Deleted")
        res.redirect("/listings");
    }catch(e){
        next(e);
    }

})
);

// Reviews 
// Post route
app.post("/listings/:id/reviews",validateReview,wrapAsync(async(req,res,next)=>{
    let listing=await Listing.findById(req.params.id);
    let newreview=new Review(req.body.review);

    listing.reviews.push(newreview);
    await newreview.save();
    await listing.save();
    req.flash("success","Added a review");
    console.log("New Review Saved");
    res.send("Review Saved");
    
}));

// Show route
app.get("/listings/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs",{listing})
})
)

// Edit route
app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    console.log(listing);
    
    res.render("listings/edit.ejs",{listing})
})
)

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not found"));
});

// Error handling middleware
app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something went wrong"}=err;
    res.status(statusCode).render("listings/error.ejs",{err});
    // res.status(statusCode).send(message);
});


