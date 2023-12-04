// var mongoose = require("mongoose");

// var campgroundSchema = new mongoose.Schema({
//     name: String,
//     img: String,
//     description: String
// });

// module.exports = mongoose.model("Campground", campgroundSchema);

var mongoose = require("mongoose");

var campgroundSchema = new mongoose.Schema({
   name: String,
   price: String,
   img: String,
   map: String,
   imgId: String,
   description: String,
   author: {
      id:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      username: String,
      profpic: String
   },
   comments: [
      {  
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment",
         
      }
   ]
});

module.exports = mongoose.model("Campground", campgroundSchema);
