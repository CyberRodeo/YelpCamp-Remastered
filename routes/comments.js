var express = require("express");
var router = express.Router();
var Campground = require("../models/campgrounds");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//-=--=-=-=-=-=-=-
//comments routes|
//=-=-=--=-=-=--==

router.get("/campgrounds/:id/comments/new", middleware.isLoggedIn,function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else {
            res.render("comments/newRM", {camps: campground});  
        }
    });
});

router.post("/campgrounds/:id/comments", middleware.isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
            req.flash("error", "Something went wrong!!")
            res.redirect("/campgrounds");
        } else {
            // console.log(req.body.comment); 
            Comment.create(req.body.comment,  function(err, comment){
                if(err){
                    req.flash("error", "Something Went Wrong! We will try to fix that soon!!")
                    console.log(err);
                } else {
                    comment.author.id       = req.user._id;
                    comment.author.username = req.user.username;
                    comment.author.profpic  = req.user.profpic;
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    console.log(comment);
                    req.flash("success", "Sucessfully Added Your Review!")
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
}); 
//comment edit
router.get("/campgrounds/:id/comments/:comment_id/edit",middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            res.redirect("back");
        } else {
            res.render("comments/editRM", {camps_id: req.params.id, comment: foundComment});
        }
    });
});

//comment update
router.put("/campgrounds/:id/comments/:comment_id", middleware.checkCommentOwnership,function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            req.flash("error", "Something went wrong!!")
            res.redirect("back");
        } else {
            req.flash("success", "Succesfully edited your Review")
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

//comment destroy!!! route
router.delete("/campgrounds/:id/comments/:comment_id",middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            req.flash("error", "We found an error while deleting your Review!!")
            res.redirect("back");
        } else {
            req.flash("success", "Review Removed!")
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});


// function isLoggedIn(req, res, next){
//     if(req.isAuthenticated()){
//         return next();
//     }
//     res.redirect("/login");
// }; 

//middleware
// function checkCommentOwnership(req, res, next){
//     if(req.isAuthenticated()){         
//         Comment.findById(req.params.comment_id, function(err, foundComment){
//             if(err){
//                 res.redirect("back");
//             } else {
//                   //user owns??
//                   if(foundComment.author.id.equals(req.user.id)){
//                         next();
//                   } else {
//                     res.redirect("back");
//                 }
//             } 
//         });
//     } else {
//         res.redirect("back");
//     }

// }

module.exports = router;    