/*************************************************************************************
# WEB322
# WEB322 - 2261 Project

I declare that this assignment is my own work in accordance with the Seneca Academic
Policy. No part of this assignment has been copied manually or electronically from
any other source (including web sites) or distributed to other students.

## Student Information
Student Name  : Fabricio Alejandro Ortiz Fiallos
Student ID    : 120220249
Student Email : faortiz-fiallos@myseneca.ca
Course/Section: WEB322/NCC
**************************************************************************************/

const path = require("path");
const express = require("express");
const app = express();
const expressLayouts = require('express-ejs-layouts');
const mealKitUtil = require("./modules/mealkit-util.js");

// set expresslayouts and engine to ejs
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "layouts/main");

// set public folder to static
app.use(express.static(path.join(__dirname, "public")));

// Add your routes here
// e.g. app.get() { ... }
app.get("/", (req, res) => {
    const Meals = mealKitUtil.getAllMealKits();
    const featuredMeals = mealKitUtil.getFeaturedMealKits(Meals);
    res.render("home", {featuredMealsKits: featuredMeals});
});

app.get("/on-the-menu", (req, res) => {
    const Meals = mealKitUtil.getAllMealKits();
    const categoryMeals = mealKitUtil.getMealKitsByCategory(Meals);
    res.render("on-the-menu", { categoryMealKits: categoryMeals});
});

app.get("/sign-up", (req, res) => {
    res.render("sign-up");
});

app.get("/log-in", (req, res) => {
    res.render("log-in");
});

// This use() will not allow requests to go beyond it
// so we place it at the end of the file, after the other routes.
// This function will catch all other requests that don't match
// any other route handlers declared before it.
// This means we can use it as a sort of 'catch all' when no route match is found.
// We use this function to handle 404 requests to pages that are not found.
app.use((req, res) => {
    res.status(404).render("error");
});

// This use() will add an error handler function to
// catch all errors.
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).render("error")
});


// *** DO NOT MODIFY THE LINES BELOW ***

// Define a port to listen to requests on.
const HTTP_PORT = process.env.PORT || 8080;

// Call this function after the http server starts listening for requests.
function onHttpStart() {
    console.log(`Express http server listening on: http://localhost:${HTTP_PORT}`);
}
  
// Listen on port 8080. The default port for http is 80, https is 443. We use 8080 here
// because sometimes port 80 is in use by other applications on the machine
app.listen(HTTP_PORT, onHttpStart);