const express = require("express");
const openAIController = require("./../controllers/openAIController");

const router = express.Router();

router.post("/nutrimind", openAIController.openai);

module.exports = router;
