const express = require("express");
const userNutritionListController = require("./../controllers/userNutritionListController");
const authController = require("./../controllers/authController");
const router = express.Router();

router.post(
  "/userNutritionList",
  authController.protect,
  userNutritionListController.saveUserNutritionList
);

router.get(
  "/getUserNutritionLists",
  authController.protect,
  userNutritionListController.getUserNutritionLists
);

router.put(
  "/updateUserNutritionList/:id",
  authController.protect,
  userNutritionListController.updateUserNutritionList
);

router.post(
  "/toggleFoodCheck/:id",
  authController.protect,
  userNutritionListController.toggleFoodCheck
);

router.post(
  "/setCurrentTodayList",
  authController.protect,
  userNutritionListController.setCurrentTodayList
);

router.get(
  "/getCurrentTodayList",
  authController.protect,
  userNutritionListController.getCurrentTodayList
);

router.post(
  "/recipe",
  authController.protect,
  userNutritionListController.recipe
);

module.exports = router;
