const { mealKitModel } = require("./mealkitModel.js");


// check if the mealkits collection is empty

const checkMealkits = async () => {
    const count = await mealKitModel.countDocuments();

    return count === 0;
}

module.exports = {checkMealkits};
