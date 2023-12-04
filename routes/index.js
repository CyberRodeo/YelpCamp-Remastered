var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user")
var Campground = require("../models/campgrounds");
var Comment = require("../models/comment");

    router.get("/", function(req, res){
        res.render("landingRM");
    });

 
  

   
    //-=-=-=--=-
    //About us||
    //=-=-=-=-=-

    router.get("/aboutUs", function(req, res){
        res.render("about");
    });



    // =-=-=-=-=--=-
    // Auth Routes
    //=-=-=-=-=-=-=-=
    router.get("/register", function(req, res){
        res.render("signup");
    });
    // handling reg form
    router.post("/register", function(req, res){
        var newUser = new User({username: req.body.username, profpic: req.body.profpic});
        User.register(newUser, req.body.password, function(err, user){
            if(err){
                req.flash("error", err.message);
                return res.render("register");
            } 
            passport.authenticate("local")(req, res, function(){
                req.flash("success", "Welcome to YelpCamp " + user.username)
                res.redirect("/campgrounds");
            });
        });
    });

    // Show login Form 
    router.get("/login", function(req, res){
        res.render("loginRM");
    });

    //handling login logic
    // var olduser =  User.username;


    router.post("/login" ,passport.authenticate("local",    
    {   
        successFlash: ("success", "Welcome Back!!"),
        successRedirect: "/campgrounds",
        failureFlash:  ("error", "Check the Username or Password you entered is correct!!"),
        failureRedirect: "/login"
    }), function(req, res){});

    //log out route
    router.get("/logout", function(req, res){
        req.logout();
        req.flash("success", "Logged out!");
        res.redirect("/");
    });

    // function isLoggedIn(req, res, next){
    //     if(req.isAuthenticated()){
    //         return next();
    //     }
    //     res.redirect("/login");
    // }; 

module.exports = router;