var express          = require("express"),
    app              = express(),
    bodyParser       = require("body-parser"),
    mongoose         = require("mongoose"), 
    flash            = require("connect-flash"),
    passport         = require("passport"),
    LocalStrategy    = require("passport-local"),
    methodOverride   = require("method-override"),
    Campground       = require("./models/campgrounds"),
    User             = require("./models/user"),
    seedDB           = require("./seeds"),
    Comment          = require("./models/comment"),
    dotenv           = require("dotenv");

var commentRoutes    = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes      = require("./routes/index")   
       

mongoose.connect("mongodb://127.0.0.1:27017/yelpcamp", {useNewUrlParser: true, useUnifiedTopology: true});
// 
app.use(bodyParser.urlencoded({extended : true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.static('public'));
app.use(methodOverride("_method"));
app.use(flash());
// seed the database
//  seedDB();

//passport config
app.use(require("express-session")({ 
    secret: "secret",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error       = req.flash("error");
    res.locals.success     = req.flash("success");
    next();
});




// testing
app.get("/test", (req, res) => {
    res.render('comments/editRM')
});

app.get('/arcane', (req, res) => {
    res.render('arcane')
});

app.use(indexRoutes);
app.use(commentRoutes);
app.use("/campgrounds" ,campgroundRoutes);

app.listen(5000 || process.env.PORT, process.env.IP, function(){ 
    console.log("YelpCamp's server is online...");
});
