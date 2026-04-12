const express = require("express");
const router = express.Router();
const mealKitUtil = require("../modules/mealkit-util.js");
const auth = require("../modules/auth.js");
const mailgun = require("../modules/mailmessage.js");
const userModel = require("../modules/userModel");
const FormData = require("form-data"); // form-data v4.0.1
const Mailgun = require("mailgun.js"); // mailgun.js v11.1.0
const bcryptjs = require("bcryptjs");


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

//Route after user sign-up
router.get("/welcome", (req, res) => {
    res.render("general/welcome");
});

router.get("/cart", auth.logInCustomer, (req, res) => {
    res.render("mealkits/cart");
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
                // Extract email and password from req.body
                const { email, password, role} = req.body;
                let userErrors = [];
                userModel.nameModel.findOne({
                    email
                })
                    .then(user => {
                        if (user) {
                            bcryptjs.compare(password, user.password)
                                .then(matched => {
                                    if (matched) {
                                        req.session.user = {
                                            _id: user._id,
                                            firstName: user.firstName,
                                            lastName: user.lastName,
                                            email: user.email,
                                            role
                                        };
                                        console.log(`A ${req.session.user.role} signed in`);

                                        if(role === process.env.DATA_CLERK_ROLE){
                                            res.redirect("/mealkits/list");
                                        }
                                        else{
                                            res.redirect("/cart");
                                        }
                                    
                                    } 
                                    else {
                                        console.log("Password didn't match");
                                        userErrors.push("Email or password was wrong");
                                        res.render("users/log-in", {
                                            userErrors,
                                            values: req.body
                                        })
                                    }

                                })
                                .catch(err => {
                                    userErrors.push("There was a problem, try again");
                                    console.log("Unable to compare passwords" + err);
                                    userErrors.push("Issue happened");
                                    res.render("users/log-in", {
                                        userErrors,
                                        values: req.body
                                    });

                                })
                        }

                        else {
                            userErrors.push(`Sorry, you entered an invalid email and/or password`);
                            console.log(userErrors[0]);
                            res.render("users/log-in", {
                                userErrors,
                                values: req.body
                            })
                        }

                    })
                    .catch(err => {
                        // not able to query
                        console.log("Unable to query the database" + err);
                        res.render("users/log-in", {
                            systemError: "There was a problem signing you in. Please try again.",
                            values: req.body,
                            errors: {}
                        });
                    })
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

router.get("/log-out", (req,res) => {
    //clear the session from memory
    req.session.destroy();
    res.redirect("/log-in");
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
                // VALIDATION PASSED -> SAVE TO DATABASE, THEN SEND EMAIL, THEN REDIRECT
                let { firstName, lastName, email, password } = req.body;

                auth.checkUserExists(email, errors)
                    .then((userExists) => {
                        if (userExists) {
                            return res.render("users/sign-up", {
                                errors: errors,
                                values: req.body
                            });
                        }
                        const newUser = new userModel.nameModel({
                            firstName, lastName, email, password
                        });

                        return newUser.save()
                            .then(user => {
                                console.log(`User ${user.firstName} added.`);
                                return mailgun.sendSimpleMessage(req.body);
                            })
                            .then(() => {
                                res.redirect("/welcome");
                            });
                    })
                    .catch(err => {
                        console.log(`Couldn't create a document for: ${firstName}\n${err}`);
                        res.redirect("/");
                    });
            }
        })
        .catch((err) => {
            console.log("Validation Logic Error:", err);
        });
});

module.exports = router;
