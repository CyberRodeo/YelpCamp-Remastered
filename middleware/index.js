var Campground = require("../models/campgrounds");
var Comment = require("../models/comment");
var middlewareObj ={};

middlewareObj.checkCampgroundOwnership = function(req, res, next){
    if(req.isAuthenticated()){         
        Campground.findById(req.params.id, function(err, foundcampground){
            if(err){
                req.flash("error", "Campground Not Found!")
                res.redirect("back");
            } else {
                  //user owns??
                  if(foundcampground.author.id.equals(req.user.id)){
                        next();
                  } else {
                    req.flash("error", "You Don't Have Permission Do That!");
                    res.redirect("back");
                }
            } 
        });
    } else {
        res.redirect("back");
    }

};


middlewareObj.checkCommentOwnership = function(req, res, next){
        if(req.isAuthenticated()){         
            Comment.findById(req.params.comment_id, function(err, foundComment){
                if(err){
                    res.redirect("back");
                } else {
                      //user owns??
                      if(foundComment.author.id.equals(req.user.id)){
                            next();
                      } else {
                        req.flash("error", "You Don't Have Permission To Do That!")
                        res.redirect("back");
                    }
                } 
            });
        } else {
            req.flash("error", "You need to be logged in to do that!")
            res.redirect("back");
        }
    
    };

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that!");    
    res.redirect("/login");
};


module.exports = middlewareObj;