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

// added new dependencies (mongodb  -> database) - (dotenv -> pass encryption) 
const mongoose = require("mongoose");
//dotenv.config({ path: "./config/.env"});

//Set up body-Parser
app.use(express.urlencoded({extended: false}));


// set expresslayouts and engine to ejs
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "layouts/main");

// set public folder to static
app.use(express.static(path.join(__dirname, "public")));


//Set up controllers
const generalController = require("./controllers/generalController");
app.use("/", generalController);

const mealkitsController = require("./controllers/mealkitsController");
app.use("/mealkits", mealkitsController);



// This use() will not allow requests to go beyond it
// so we place it at the end of the file, after the other routes.
// This function will catch all other requests that don't match
// any other route handlers declared before it.
// This means we can use it as a sort of 'catch all' when no route match is found.
// We use this function to handle 404 requests to pages that are not found.
app.use((req, res) => {
    res.status(404).render("error", {
        title: "Error",
        status: 404,
        error: null
    });
});

// This use() will add an error handler function to
// catch all errors.
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).render("error", {
        title: "Error",
        status: err.message,
        error: err
    })
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