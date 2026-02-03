const { simulateDay } = require("../services/simulationService");

exports.simulateOpdDay = async (req, res) => {
  try {
    const summary = await simulateDay();
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
