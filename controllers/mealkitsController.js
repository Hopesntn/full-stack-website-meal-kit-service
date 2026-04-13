const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const mealKitUtil = require("../modules/mealkit-util.js");
const auth = require("../modules/auth.js");
const mailgun = require("../modules/mailmessage.js");
const { mealKitModel } = require("../modules/mealkitModel.js");
const FormData = require("form-data");
const Mailgun = require("mailgun.js");

// GET - On the menu page (public)
router.get("/on-the-menu", (req, res) => {
    mealKitModel.find()
        .then(meals => {
            const categoryMeals = mealKitUtil.getMealKitsByCategory(meals);
            res.render("mealkits/on-the-menu", { categoryMealKits: categoryMeals });
        })
        .catch(err => {
            res.status(500).render("error", {
                title: "Error",
                status: 500,
                error: { message: "Error loading meal kits" }
            });
        });
});

// GET - Meal kits list for data clerk
router.get("/list", auth.logInDataClerk, (req, res) => {
    mealKitModel.find().sort({ title: 1 })
        .then(meals => {
            res.render("mealkits/list", { mealKits: meals });
        })
        .catch(err => {
            res.status(500).render("error", {
                title: "Error",
                status: 500,
                error: { message: "Error loading meal kits" }
            });
        });
});

// GET - Add meal kit form
router.get("/add", auth.logInDataClerk, (req, res) => {
    res.render("mealkits/add", { values: {}, errors: {} });
});

// POST - Add meal kit
router.post("/add", auth.logInDataClerk, (req, res) => {
    const { title, includes, description, category, price, cookingTime, servings, featuredMealKit } = req.body;
    const errors = {};

    if (!title || title.trim() === "") errors.title = "Title is required";
    if (!includes || includes.trim() === "") errors.includes = "Includes is required";
    if (!description || description.trim() === "") errors.description = "Description is required";
    if (!category || category.trim() === "") errors.category = "Category is required";
    if (!price || isNaN(price) || parseFloat(price) <= 0) errors.price = "Price must be greater than 0";
    if (!cookingTime || isNaN(cookingTime) || !Number.isInteger(parseFloat(cookingTime)) || parseInt(cookingTime) <= 0) {
        errors.cookingTime = "Cooking time must be a positive integer";
    }
    if (!servings || isNaN(servings) || !Number.isInteger(parseFloat(servings)) || parseInt(servings) <= 0) {
        errors.servings = "Servings must be a positive integer";
    }
    
    if (!req.files || Object.keys(req.files).length === 0) {
        errors.imageUrl = "Image is required";
    } else {
        const uploadedFile = req.files.imageUrl;
        const allowedMimes = ["image/jpeg", "image/png", "image/gif"];
        if (!allowedMimes.includes(uploadedFile.mimetype)) {
            errors.imageUrl = "Only jpg, jpeg, png, and gif are allowed";
        }
    }

    if (Object.keys(errors).length > 0) {
        return res.render("mealkits/add", { 
            values: req.body, 
            errors: errors 
        });
    }

    const uploadedFile = req.files.imageUrl;
    const fileName = Date.now() + "_" + uploadedFile.name;
    const uploadPath = path.join(__dirname, "../public/assets", fileName);

    uploadedFile.mv(uploadPath, (err) => {
        if (err) {
            errors.imageUrl = "Error uploading image";
            return res.render("mealkits/add", { 
                values: req.body, 
                errors: errors 
            });
        }

        const newMealKit = new mealKitModel({
            title: title,
            includes: includes,
            description: description,
            category: category,
            price: parseFloat(price),
            cookingTime: parseInt(cookingTime),
            servings: parseInt(servings),
            imageUrl: "/assets/" + fileName,
            featuredMealKit: featuredMealKit === "on"
        });

        newMealKit.save()
            .then(saved => {
                res.redirect("/mealkits/list");
            })
            .catch(err => {
                fs.unlink(uploadPath, () => {});
                errors.general = "Error saving meal kit to database";
                res.render("mealkits/add", { 
                    values: req.body, 
                    errors: errors 
                });
            });
    });
});

// GET - Edit meal kit form
router.get("/edit/:id", auth.logInDataClerk, (req, res) => {
    mealKitModel.findById(req.params.id)
        .then(meal => {
            if (!meal) {
                return res.status(404).render("error", {
                    title: "Error",
                    status: 404,
                    error: { message: "Meal kit not found" }
                });
            }
            res.render("mealkits/edit", { mealKit: meal, errors: {} });
        })
        .catch(err => {
            res.status(500).render("error", {
                title: "Error",
                status: 500,
                error: { message: "Error loading meal kit" }
            });
        });
});

// POST - Edit meal kit
router.post("/edit/:id", auth.logInDataClerk, (req, res) => {
    const { title, includes, description, category, price, cookingTime, servings, featuredMealKit } = req.body;
    const errors = {};

    if (!title || title.trim() === "") errors.title = "Title is required";
    if (!includes || includes.trim() === "") errors.includes = "Includes is required";
    if (!description || description.trim() === "") errors.description = "Description is required";
    if (!category || category.trim() === "") errors.category = "Category is required";
    if (!price || isNaN(price) || parseFloat(price) <= 0) errors.price = "Price must be greater than 0";
    if (!cookingTime || isNaN(cookingTime) || !Number.isInteger(parseFloat(cookingTime)) || parseInt(cookingTime) <= 0) {
        errors.cookingTime = "Cooking time must be a positive integer";
    }
    if (!servings || isNaN(servings) || !Number.isInteger(parseFloat(servings)) || parseInt(servings) <= 0) {
        errors.servings = "Servings must be a positive integer";
    }

    if (Object.keys(errors).length > 0) {
        return mealKitModel.findById(req.params.id)
            .then(meal => {
                res.render("mealkits/edit", { 
                    mealKit: { ...meal.toObject(), ...req.body },
                    errors: errors 
                });
            });
    }

    mealKitModel.findById(req.params.id)
        .then(meal => {
            if (!meal) {
                return res.status(404).render("error", {
                    title: "Error",
                    status: 404,
                    error: { message: "Meal kit not found" }
                });
            }

            let imageUrl = meal.imageUrl;

            if (req.files && Object.keys(req.files).length > 0) {
                const uploadedFile = req.files.imageUrl;
                const allowedMimes = ["image/jpeg", "image/png", "image/gif"];
                
                if (!allowedMimes.includes(uploadedFile.mimetype)) {
                    errors.imageUrl = "Only jpg, jpeg, png, and gif are allowed";
                    return res.render("mealkits/edit", { 
                        mealKit: meal, 
                        errors: errors 
                    });
                }

                const fileName = Date.now() + "_" + uploadedFile.name;
                const uploadPath = path.join(__dirname, "../public/assets", fileName);

                uploadedFile.mv(uploadPath, (err) => {
                    if (err) {
                        errors.imageUrl = "Error uploading image";
                        return res.render("mealkits/edit", { 
                            mealKit: meal, 
                            errors: errors 
                        });
                    }

                    const oldImagePath = path.join(__dirname, "../public", meal.imageUrl);
                    fs.unlink(oldImagePath, () => {});

                    imageUrl = "/assets/" + fileName;

                    mealKitModel.findByIdAndUpdate(req.params.id, {
                        title: title,
                        includes: includes,
                        description: description,
                        category: category,
                        price: parseFloat(price),
                        cookingTime: parseInt(cookingTime),
                        servings: parseInt(servings),
                        imageUrl: imageUrl,
                        featuredMealKit: featuredMealKit === "on"
                    }, { new: true })
                        .then(updated => {
                            res.redirect("/mealkits/list");
                        });
                });
            } else {
                mealKitModel.findByIdAndUpdate(req.params.id, {
                    title: title,
                    includes: includes,
                    description: description,
                    category: category,
                    price: parseFloat(price),
                    cookingTime: parseInt(cookingTime),
                    servings: parseInt(servings),
                    imageUrl: imageUrl,
                    featuredMealKit: featuredMealKit === "on"
                }, { new: true })
                    .then(updated => {
                        res.redirect("/mealkits/list");
                    });
            }
        })
        .catch(err => {
            res.status(500).render("error", {
                title: "Error",
                status: 500,
                error: { message: "Error updating meal kit" }
            });
        });
});

// GET - Remove meal kit confirmation
router.get("/remove/:id", auth.logInDataClerk, (req, res) => {
    mealKitModel.findById(req.params.id)
        .then(meal => {
            if (!meal) {
                return res.status(404).render("error", {
                    title: "Error",
                    status: 404,
                    error: { message: "Meal kit not found" }
                });
            }
            res.render("mealkits/remove", { mealKit: meal });
        })
        .catch(err => {
            res.status(500).render("error", {
                title: "Error",
                status: 500,
                error: { message: "Error loading meal kit" }
            });
        });
});

// POST - Remove meal kit
router.post("/remove/:id", auth.logInDataClerk, (req, res) => {
    mealKitModel.findByIdAndDelete(req.params.id)
        .then(meal => {
            if (meal && meal.imageUrl) {
                const imagePath = path.join(__dirname, "../public", meal.imageUrl);
                fs.unlink(imagePath, () => {});
            }
            res.redirect("/mealkits/list");
        })
        .catch(err => {
            res.status(500).render("error", {
                title: "Error",
                status: 500,
                error: { message: "Error deleting meal kit" }
            });
        });
});

// POST - Add item to cart
router.post("/add-to-cart/:id", auth.logInCustomer, (req, res) => {
    mealKitModel.findById(req.params.id)
        .then(meal => {
            if (!meal) {
                return res.status(404).json({ error: "Meal kit not found" });
            }

            if (!req.session.cart) {
                req.session.cart = [];
            }

            const existingItem = req.session.cart.find(item => item._id.toString() === req.params.id);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                req.session.cart.push({
                    _id: meal._id,
                    title: meal.title,
                    includes: meal.includes,
                    price: meal.price,
                    imageUrl: meal.imageUrl,
                    quantity: 1
                });
            }

            res.redirect("/cart");
        })
        .catch(err => {
            res.status(500).json({ error: "Error adding to cart" });
        });
});

// POST - Update cart quantity
router.post("/update-cart", auth.logInCustomer, (req, res) => {
    const { itemId, quantity } = req.body;

    if (!req.session.cart) {
        req.session.cart = [];
    }

    const item = req.session.cart.find(i => i._id.toString() === itemId);

    if (item) {
        if (parseInt(quantity) > 0) {
            item.quantity = parseInt(quantity);
        } else {
            req.session.cart = req.session.cart.filter(i => i._id.toString() !== itemId);
        }
    }

    res.redirect("/cart");
});

// POST - Remove from cart
router.post("/remove-from-cart/:id", auth.logInCustomer, (req, res) => {
    if (req.session.cart) {
        req.session.cart = req.session.cart.filter(item => item._id.toString() !== req.params.id);
    }
    res.redirect("/cart");
});

module.exports = router;