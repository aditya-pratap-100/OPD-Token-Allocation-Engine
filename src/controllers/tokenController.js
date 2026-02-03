const { allocateToken } = require("../services/allocationService");
const { cancelToken } = require("../services/allocationService");

exports.bookToken = async (req, res) => {
  try {
    const result = await allocateToken(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.cancelToken = async (req, res) => {
  try {
    const result = await cancelToken(req.params.tokenId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// 📌 Note:

//No logic here

//Only input → service → output