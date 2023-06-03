const mongoose = require("mongoose");

var userNutritionListSchema = new mongoose.Schema(
  {
    listName: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    dietList: [
      {
        meal: String,
        foods: [
          {
            foodName: String,
            totalCalories: Number,
            description: String,
            isChecked: {
              type: Boolean,
              default: false,
            },
          },
        ],
      },
    ],
    currentTodayList: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

const UserNutritionList = mongoose.model(
  "UserNutritionList",
  userNutritionListSchema
);

module.exports = UserNutritionList;
