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
const session = require("express-session");
const fileUpload = require("express-fileupload");

//added new dependencies (mongodb  -> database) - (dotenv -> pass encryption) 
const mongoose = require("mongoose");
const dns = require("dns");
// Set up dotenv
const dotenv = require("dotenv");
dotenv.config({ path: "./config/.env" });

//Set up express-session
app.use(session( {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

// new middleware for session
app.use((req, res, next) => {
// copy the user to the global ejs variable "user"
    res.locals.user = req.session.user;
    res.locals.DATA_CLERK_ROLE = process.env.DATA_CLERK_ROLE;
    res.locals.CUSTOMER_ROLE = process.env.CUSTOMER_ROLE;
    next();
});


//Set up body-Parser
app.use(express.urlencoded({ extended: true }));

// set expresslayouts and engine to ejs
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "layouts/main");

// set public folder to static
app.use(express.static(path.join(__dirname, "public")));

// Set up file upload middleware
app.use(fileUpload());

//Set up controllers
const generalController = require("./controllers/generalController");
app.use("/", generalController);

const mealkitsController = require("./controllers/mealkitsController");
app.use("/mealkits", mealkitsController);

const loadDataController = require("./controllers/loadDataController");
app.use("/", loadDataController);



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
// Modified listened now that the database was added
// lines modified to work around ECONNREFUSED AND querySrv
// Define a port to listen to requests on.
const HTTP_PORT = process.env.PORT || 8080;

async function connectToMongo() {
    try {
        await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
        console.log("Connected to MongoDB");
    } catch (err) {
        if (err && err.code === "ECONNREFUSED" && err.syscall === "querySrv") {
            console.warn("MongoDB SRV lookup failed with local DNS. Retrying with public DNS resolvers...");
            dns.setServers(["8.8.8.8", "1.1.1.1"]);
            await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
            console.log("Connected to MongoDB (public DNS fallback)");
            return;
        }

        throw err;
    }
}

connectToMongo()
    .then(() => {
        // Listen on port 8080. The default port for http is 80, https is 443. We use 8080 here
        // because sometimes port 80 is in use by other applications on the machine
        app.listen(HTTP_PORT, onHttpStart);
    })
    .catch((err => {
        console.error("Couldn't connect to the database:", err.message);
    }))

    // Call this function after the http server starts listening for requests.
function onHttpStart() {
    console.log(`Express http server listening on: http://localhost:${HTTP_PORT}`);
}