const express = require("express");
const router = express.Router();
const controller = require("../controllers/slotController");

router.post("/", controller.createSlot);
router.get("/", controller.getSlots);

module.exports = router;
