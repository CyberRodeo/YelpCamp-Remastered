var express = require("express");
var router = express.Router();
var Campground = require("../models/campgrounds");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|webp|png|gif|jfif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary').v2;
cloudinary.config({  
    cloud_name: 'yelpcamphimanshu',
    api_key: '738481826292867',
    api_secret: '6rIBD9Nj1J5TE27O9dSXNc4--E8',
    secure: true
    //CLOUDINARY_URL=cloudinary://873618198731159:aFHRZQc7jhigXjpyFZZcxv0RXxA@yelpcamplegend
    //CLOUDINARY_URL=cloudinary://738481826292867.6rIBD9Nj1J5TE27O9dSXNc4--E8@yelpcamphimanshu
});

router.post("/",middleware.isLoggedIn, upload.single('image'), function(req, res){
 
    // var name = req.body.name;
    // var image = req.body.image;
    // var desc = req.body.description;
    // var author = {
    //     id: req.user._id,
    //     username: req.user.username
    // }
    // var NewCamp = {name : name , img: image, description: desc, author: author};
    // Campground.create(NewCamp, function(err, newlyCreated){
    //     if(err){
    //         console.log(err);
    //     } else {
    //         console.log(newlyCreated);
    //         req.flash("success", "New Campground is Posted!!")
    //         res.redirect("/campgrounds");
    //     }
    // });
 
    cloudinary.uploader.upload(req.file.path, function(err, result) {
        if(err) {
          req.flash('error', err.message);
          return res.redirect('back');
        } else {
            console.log(result);
        }
        // add cloudinary url for the image to the campground object under image property
        req.body.campground.img = result.secure_url;
        // add image's public_id to campground object
        req.body.campground.imgId = result.public_id;
        // add author to campground
        req.body.campground.author = {
          id: req.user._id,
          username: req.user.username,
          profpic: req.user.profpic
        }
        Campground.create(req.body.campground, function(err, campground) {
          if (err) {
            req.flash('error', err.message);
            return res.redirect('back');
          }
          req.flash("success", "Campground Successfully Hosted :)")
          res.redirect('/campgrounds/' + campground.id);
        });
      });
  });
      
// });

router.get("/",  function(req, res){
    if(req.query.search) {
        escapeRegex(req.query.search);

        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Campground.find({name: regex}, function(err, allCampgrounds){
            if(err){
                console.log(err);
            } else { 
                if(allCampgrounds.length == 0) {
                    req.flash("error", "No Campgrounds found, try Searching anything else :)");
                }
                return res.render("campgrounds/indexRE", {campgrounds: allCampgrounds, currentUser: req.user});
            }
        });
    } else {
        Campground.find({}, function(err, allCampgrounds){
            if(err){
                console.log(err);
            } else {
                res.render("campgrounds/indexRE", {campgrounds: allCampgrounds, currentUser: req.user});
            }
        });
    }
    
});

router.get("/new",middleware.isLoggedIn, (req, res) => {
    res.render("campgrounds/newRM");
});

router.get("/:id", function(req, res){
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            req.flash("error", "Something went wrong, try again later..")
            console.log(err);
        } else {
            console.log(foundCampground);
            res.render("campgrounds/showRM", {camps: foundCampground});
        }
    });
});

//Edit
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){   
        Campground.findById(req.params.id, function(err, foundcampground){
            res.render("campgrounds/editRM",{campground: foundcampground}); 
        });    
});




router.put("/:id", middleware.checkCampgroundOwnership , upload.single('image'), function(req, res){  
    Campground.findById(req.params.id, async function(err, updatedCampground){
        if(err){
            req.flash("error", err.message)
            res.redirect("back");
        } else {
            if(req.file) {
                try {
                     await cloudinary.uploader.destroy(updatedCampground.imgId)
                     var result = await cloudinary.uploader.upload(req.file.path);
                     updatedCampground.imgId = result.public_id;
                     updatedCampground.img   = result.secure_url; 
                } catch(err){   
                     req.flash("error", err.message)
                     return res.redirect("back");
                }
            }  
            updatedCampground.price = req.body.price;
            updatedCampground.name = req.body.name;
            updatedCampground.fullname = req.body.fullname;
            updatedCampground.map = req.body.map;
            updatedCampground.description = req.body.description;
            updatedCampground.save();
            req.flash("success", "Successfully updated your Campground :0");
            res.redirect("/campgrounds/" + req.params.id); 
        }

    });
    // Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
    //     if(err){
    //         req.flash("error", "Something went wrong while updating the Campground!")
    //         res.redirect("/campgrounds");
    //     } else {
    //         req.flash("success", "Successfully updated your Campground!");
    //         res.redirect("/campgrounds/" + req.params.id); 
    //     }
    // });
});

//destroy route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req,res){
    Campground.findById(req.params.id, async function(err, campground){
        if(err){ 
            req.flash("error", "Something went wrong while deleting your Campground!")
            res.redirect("/campgrounds");
        } try {
            await cloudinary.uploader.destroy(campground.imgId);
            campground.remove();
            req.flash("success", "Sucessfully deleted your Campground!");
            res.redirect("/campgrounds");
        } catch(err){
            if(err){
                req.flash("error", err.message)
                res.redirect("back");
            }
        }
    });
    
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;