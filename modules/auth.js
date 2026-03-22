const express = require("express");
const router = express.Router();
const user = require('./userModel');

const validateAndSignUp = async (formData) => {
   let errors = {};

   const { firstName, lastName, email, password } = formData;

   if (!firstName || firstName.trim() === "")
      errors.firstName = "Please enter a valid first name";

   if (!lastName || lastName.trim() === "")
      errors.lastName = "Please enter a valid last name";

   if (!email || email.trim() === "")
      errors.email = "Please enter a valid email address";

   if (!password || password.trim() === "")
      errors.password = "Please enter a valid password";

   const passPattern = /^(?=.*?[0-9])(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[^0-9A-Za-z]).{8,12}$/;

   if (!passPattern.test(password)) {
      errors.password = "Password must be 8-12 characters and include uppercase, lowercase, a number, and a special character.";
   }

   const emailPattern = /^\S+@\S+\.\S+$/;

   if (!emailPattern.test(email)) {
      errors.email = "Must have a valid email address"
   }

   return errors;
}

const validateAndLogIn = async (formData) => {
   let errors = {};

   const { email, password } = formData;

   if (!email || email.trim() === "")
      errors.email = "Please enter your email";

   if (!password || password.trim() === "")
      errors.password = "Please enter your password"

   return errors;
}

function renderUnauthorized(res) {
   return res.status(401).render("error", {
      title: "Unauthorized",
      status: 401,
      error: { message: "You are not authorized to view this page" }
   });
}

async function checkUserExists(email, errors = {}) {
   try {
      const existingUser = await user.nameModel.findOne({ email: email });

      if (existingUser) {
         errors.email = "Invalid credentials try again.";
         return true;
      }

      return false;
   } catch (err) {
      errors.email = "Unexpected error happened, try again.";
      return true;
   }
}

function logInStatus(req, res, next) {
   if(req.session.user) {
      return next();
   }

   return renderUnauthorized(res);
}

function logInCustomer(req, res, next) {
   if (req.session.user && req.session.user.role === process.env.CUSTOMER_ROLE) {
      return next();
   }

   return renderUnauthorized(res);
}

function logInDataClerk(req, res, next) {

   if (req.session.user && req.session.user.role === process.env.DATA_CLERK_ROLE) {
      return next();
   }

   return renderUnauthorized(res);
}






module.exports = {
   validateAndSignUp,
   validateAndLogIn,
   checkUserExists,
   logInStatus,
   logInCustomer,
   logInDataClerk
};


