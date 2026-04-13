const express = require("express");
const router = express.Router();
const mealKitUtil = require("../modules/mealkit-util.js");
const { mealKitModel } = require("../modules/mealkitModel.js");
const loadData = require("../modules/load-data.js");

//
// Route to load meal kit data
router.get("/load-data/mealkits", async (req, res) => {
    if (!req.session.user || req.session.user.role !== process.env.DATA_CLERK_ROLE) {
        return res.status(403).render("error", {
            title: "Forbidden",
            status: 403,
            error: { message: "You are not authorized to add meal kits" }
        });
    }

    try {
        const isEmpty = await loadData.checkMealkits();

        if (isEmpty) {
            await mealKitModel.insertMany(mealKitUtil.getAllMealKits());
            return res.render("error", {
                title: "Load Data",
                status: 200,
                error: { message: "Added meal kits to the database" }
            });
        }

        return res.render("error", {
            title: "Load Data",
            status: 200,
            error: { message: "Meal kits have already been added to the database" }
        });
    } catch (err) {
        return res.status(500).render("error", {
            title: "Load Data Error",
            status: 500,
            error: { message: "Error loading meal kits to the database" }
        });
    }
}); 


module.exports = router;