const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: true
  },

  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true
  },

  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Slot",
    required: true
  },

  source: {
    type: String,
    enum: ["ONLINE", "WALKIN", "PAID", "FOLLOWUP", "EMERGENCY"],
    required: true
  },

  priority: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: ["BOOKED", "WAITLISTED", "CANCELLED", "NO_SHOW", "COMPLETED"],
    default: "BOOKED"
  }

}, { timestamps: true });

module.exports = mongoose.model("Token", tokenSchema);
