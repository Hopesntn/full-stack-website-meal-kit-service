const bcrypt = require('bcryptjs');

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
      errors.email = "Couldn't log in with this email or password.";

   if (!password || password.trim() === "")
      errors.password = "Couldn't log in with this email or password."

   return errors;
}


module.exports = { validateAndSignUp, validateAndLogIn };


