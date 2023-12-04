var express = require("express");
var Campground = require("./models/campgrounds");
var mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/yelpcamp", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() =>{
    console.log('connected to db!');
}).catch(err => {
    console.err("ERROR",err.message);
});


function dbQuery(){
    Campground.find({}, (err, allCampgrounds)=>{
        if(err){
            console.log(err);
        } else {
            return allCampgrounds;
        }
    });
};

console.log(dbQuery());