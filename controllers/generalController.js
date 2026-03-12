const express = require("express");
const router = express.Router();
const mealKitUtil = require("../modules/mealkit-util.js");

//const userModel = require("../models/userModel");


//Main Route
router.get("/", (req, res) => {
    const meals = mealKitUtil.getAllMealKits();
    const featuredMeals = mealKitUtil.getFeaturedMealKits(meals);
    res.render("general/home", {featuredMealsKits: featuredMeals});
});

//Route to the home page
router.get("/home", (req, res) => {
    const meals = mealKitUtil.getAllMealKits();
    const featuredMeals = mealKitUtil.getFeaturedMealKits(meals);
    res.render("general/home", {featuredMealsKits: featuredMeals});
});

// Route for Sign-Up page
router.get("/sign-up", (req, res) => {
    res.render("users/sign-up");
});

//Route for Log-in page
router.get("/log-in", (req, res) => {
    res.render("users/log-in");
});


// post for validation
router.post("/sign-up", (req, res) => {
    
    console.log(req.body);
    const { firstName, lastName, email, password} = req.body;
    
    // add validation logic



    
    const newUser = new userModel ({
        firstName, lastName, email, password
    });
   
    newUser.save()
        .then(user => {
            console.log(`User $(user.firstName} has been added
                to the Collection.`);
            res.redirect("/");
        })
        .catch(err => {
            console.log(`Error adding user to the collection...$(err)`);
            res.render("users/sign-up");
        });

});

module.exports = router;
