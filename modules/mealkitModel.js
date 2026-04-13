const mongoose = require("mongoose");

const mealKitSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    includes: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0.01 },
    cookingTime: { type: Number, required: true, min: 1 },
    servings: { type: Number, required: true, min: 1 },
    imageUrl: { type: String, required: true, trim: true },
    featuredMealKit: { type: Boolean, required: true, default: false }
});

const mealKitModel = mongoose.model("MealKits", mealKitSchema);

module.exports = { mealKitModel };
