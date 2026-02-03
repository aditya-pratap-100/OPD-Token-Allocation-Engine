const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true
  },

  startTime: {
    type: String, // "09:00"
    required: true
  },

  endTime: {
    type: String, // "10:00"
    required: true
  },

  maxCapacity: {
    type: Number,
    required: true
  },

  currentCount: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    enum: ["OPEN", "FULL", "OVERBOOKED", "CLOSED"],
    default: "OPEN"
  }

}, { timestamps: true });

module.exports = mongoose.model("Slot", slotSchema);
