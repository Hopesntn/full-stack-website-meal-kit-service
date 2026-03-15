const express = require("express");
const router = express.Router();
const mealKitUtil = require("../modules/mealkit-util.js");
const auth = require("../modules/auth-module.js");

const userModel = require("../modules/userModel");


//Main Route
router.get("/", (req, res) => {
    const meals = mealKitUtil.getAllMealKits();
    const featuredMeals = mealKitUtil.getFeaturedMealKits(meals);
    res.render("general/home", { featuredMealsKits: featuredMeals });
});

//Route to the home page
router.get("/home", (req, res) => {
    const meals = mealKitUtil.getAllMealKits();
    const featuredMeals = mealKitUtil.getFeaturedMealKits(meals);
    res.render("general/home", { featuredMealsKits: featuredMeals });
});

// Route for Sign-Up page
router.get("/sign-up", (req, res) => {
    res.render("users/sign-up");
});

//Route for Log-in page
router.get("/log-in", (req, res) => {
    res.render("users/log-in");
});


// post for validation -> Log-In
router.post("/log-in", (req, res) => {
    auth.validateAndLogIn(req.body)
        .then((result) => {
            // result is the "errors" object from your logic file
            if (Object.keys(result).length > 0) {
                res.render("users/log-in", {
                    errors: result,
                    values: req.body
                });
            } else {
                // In Assignment 3 you will check the DB here. 
                // For now, we just simulate success.
                res.render("general/welcome");
            }
        })
        .catch((err) => {
            res.render("users/log-in", {
                systemError: "An unexpected error occurred.",
                values: req.body,
                errors: {}
            });
        });
});

// post for validation -> Sign-Up
router.post("/sign-up", (req, res) => {
    auth.validateAndSignUp(req.body)
        .then((errors) => {
            if (Object.keys(errors).length > 0) {
                // VALIDATION FAILED
                res.render("users/sign-up", {
                    errors: errors,
                    values: req.body
                });
            } else {
                // VALIDATION PASSED -> NOW SAVE TO DATABASE
                // Note: userModel must be required at the top of the file
                const { firstName, lastName, email, password } = req.body;
                const newUser = new userModel({ firstName, lastName, email, password });

                newUser.save()
                    .then(user => {
                        console.log(`User ${user.firstName} added.`);
                        res.redirect("/general/welcome");
                    })
                    .catch(err => {
                        console.log("DB Error:", err);
                        res.render("users/sign-up", {
                            systemError: "Database error, please try again.",
                            values: req.body,
                            errors: {}
                        });
                    });
            }
        })
        .catch((err) => {
            console.log("Validation Logic Error:", err);
        });
});

module.exports = router;
