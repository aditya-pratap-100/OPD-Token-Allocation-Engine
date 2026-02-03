const Slot = require("../models/Slot");

exports.createSlot = async (req, res) => {
  try {
    const slot = await Slot.create(req.body);
    res.status(201).json(slot);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getSlots = async (req, res) => {
  try {
    const filter = req.query.doctorId
      ? { doctorId: req.query.doctorId }
      : {};

    const slots = await Slot.find(filter).populate("doctorId");
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
