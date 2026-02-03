const express = require("express");
const router = express.Router();
const tokenController = require("../controllers/tokenController");

router.post("/book", tokenController.bookToken);
router.post("/cancel/:tokenId", tokenController.cancelToken);

module.exports = router;
