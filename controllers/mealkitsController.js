const express = require("express");
const router = express.Router();
const mealKitUtil = require("../modules/mealkit-util.js");

router.get("/on-the-menu", (req, res) => {
    const Meals = mealKitUtil.getAllMealKits();
    const categoryMeals = mealKitUtil.getMealKitsByCategory(Meals);
    res.render("mealkits/on-the-menu", { categoryMealKits: categoryMeals });
});

module.exports = router;