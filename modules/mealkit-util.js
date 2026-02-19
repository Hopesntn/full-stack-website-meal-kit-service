
const mealkits = [
    {
        title: "Classic Beef and Broccoli",
        includes: "Steamed Brown Rice & Toasted Sesame Seeds",
        description: "Tender beef strips and fresh broccoli in a savory garlic soy sauce.",
        category: "Classic Meals",
        price: 17.99,
        cookingTime: 20,
        servings: 2,
        imageUrl: "/assets/beef-and-broccoli-2.png",
        featuredMealKit: true
    },
    {
        title: "Glazed Chicken Meatballs",
        includes: "Fluffy White Rice & Fresh Lemon Wedges",
        description: "Juicy chicken meatballs tossed in a sweet and tangy glaze.",
        category: "Classic Meals",
        price: 25.99,
        cookingTime: 25,
        servings: 4,
        imageUrl: "/assets/chicken-meal-prep-menu.jpg",
        featuredMealKit: false
    },
    {
        title: "Hot Honey Ground Beef Bowls",
        includes: "Roasted Sweet Potatoes, Sliced Avocado & Cottage Cheese",
        description: "Spicy and sweet ground beef served over hearty roasted sweet potatoes.",
        category: "Classic Meals",
        price: 20.99,
        cookingTime: 30,
        servings: 2,
        imageUrl: "/assets/Hot-Honey-Ground-Beef-and-Sweet-Potato-Bowls.jpg",
        featuredMealKit: true
    },
    {
        title: "Teriyaki Beef Burger Bowl",
        includes: "Grilled Pineapple, Pickled Red Onions & Toasted Cashews",
        description: "A deconstructed teriyaki burger served over rice with vibrant toppings.",
        category: "Classic Meals",
        price: 19.99,
        cookingTime: 25,
        servings: 2,
        imageUrl: "/assets/Kansas-Beef-Burger-Bowls-4-Ways-Teriyaki-Bowl-1-e1721922160561-400x400.jpg",
        featuredMealKit: false
    },
    {
        title: "Crispy Chicken Superfood Bowl",
        includes: "Roasted Beets, Butternut Squash, Feta Cheese & Wild Rice",
        description: "Crispy breaded chicken layered over a nutrient-packed colorful salad.",
        category: "Healthy Food",
        price: 15.99,
        cookingTime: 35,
        servings: 4,
        imageUrl: "/assets/Superfood-Salad-Bowls-6-735x1103.webp",
        featuredMealKit: true
    },
    {
        title: "Mediterranean Chickpea Quinoa Salad",
        includes: "Pomegranate Seeds, Cucumber & Hard-Boiled Egg",
        description: "A refreshing and protein-packed vegetarian salad with a bright vinaigrette.",
        category: "Vegetarian Meals",
        price: 14.99,
        cookingTime: 15,
        servings: 2,
        imageUrl: "/assets/vegetarian-meal-prep-recipes.jpg",
        featuredMealKit: false
    }
];

let getAllMealKits = () =>
{
    return mealkits;
}

let getFeaturedMealKits = (mealkits) =>
{
    let featuredKits = [];

    mealkits.forEach(meal => 
    {
        if(meal.featuredMealKit){
            featuredKits.push(meal)
        }
    });
    return featuredKits;
}

let getMealKitsByCategory = (mealkits) =>
{
    let mealsMap = {};

    mealkits.forEach(meal =>
    {
        if(!mealsMap[meal.category]) 
        {
            mealsMap[meal.category] = [];
        }

        mealsMap[meal.category].push(meal);
    });

    let categoryMeals = [];

    for(const category in mealsMap)
    {
        categoryMeals.push({
            categoryName: category,
            mealkits: mealsMap[category]
        });
    }

    return categoryMeals;
    
}

module.exports = {getAllMealKits, getFeaturedMealKits, getMealKitsByCategory};