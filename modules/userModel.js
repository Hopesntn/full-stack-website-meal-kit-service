const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});


// has for passwords (do not use arrow function )
userSchema.pre("save", async function (next) {
    const user = this;

    // don't change pass if already hashed
    if(!user.isModified('password')) {
        return;
    }

    try {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
    }
    //generate a unique SALT
    // when you generate the hash use 10 rounds
    catch (err) {
        throw new Error(`Hashing Failed: ${err.message}`);
    }
});

const nameModel = mongoose.model("Users", userSchema);
module.exports = {nameModel};
