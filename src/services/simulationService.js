const Doctor = require("../models/Doctor");
const Slot = require("../models/Slot");
const Token = require("../models/Token");
const { allocateToken, cancelToken } = require("./allocationService");

const PRIORITIES = [
  { source: "ONLINE", priority: 4 },
  { source: "WALKIN", priority: 5 },
  { source: "FOLLOWUP", priority: 3 },
  { source: "PAID", priority: 2 }
];

const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const simulateDay = async () => {
  // clean previous simulation data (optional but neat)
  await Doctor.deleteMany({});
  await Slot.deleteMany({});
  await Token.deleteMany({});

  // 1️ Create doctors
  const doctors = await Doctor.insertMany([
    { name: "Dr. Sharma", specialization: "General" },
    { name: "Dr. Mehta", specialization: "Ortho" },
    { name: "Dr. Khan", specialization: "ENT" }
  ]);

  // 2️ Create slots (9–12, 3 slots each)
  const slots = [];
  for (const doc of doctors) {
    const times = [
      ["09:00", "10:00"],
      ["10:00", "11:00"],
      ["11:00", "12:00"]
    ];

    for (const [start, end] of times) {
      slots.push({
        doctorId: doc._id,
        startTime: start,
        endTime: end,
        maxCapacity: 2,
        currentCount: 0,
        status: "OPEN"
      });
    }
  }
  const createdSlots = await Slot.insertMany(slots);

  // 3️ Random bookings
  let tokensBooked = 0;
  for (let i = 0; i < 12; i++) {
    const slot = randomPick(createdSlots);
    const pick = randomPick(PRIORITIES);

    const res = await allocateToken({
      patientName: `Patient-${i + 1}`,
      doctorId: slot.doctorId,
      slotId: slot._id,
      source: pick.source,
      priority: pick.priority
    });

    if (res.status.startsWith("ALLOCATED")) tokensBooked++;
  }

  // 4️ Emergency insertions
  let emergencies = 0;
  for (let i = 0; i < 2; i++) {
    const slot = randomPick(createdSlots);
    await allocateToken({
      patientName: `Emergency-${i + 1}`,
      doctorId: slot.doctorId,
      slotId: slot._id,
      source: "EMERGENCY",
      priority: 1
    });
    emergencies++;
  }

  // 5️ Random cancellations
  const bookedTokens = await Token.find({ status: "BOOKED" }).limit(3);
  let cancellations = 0;
  for (const t of bookedTokens) {
    await cancelToken(t._id);
    cancellations++;
  }

  // 6️ Summary
  const waitlisted = await Token.countDocuments({ status: "WAITLISTED" });

  return {
    doctors: doctors.length,
    slotsCreated: createdSlots.length,
    tokensBooked,
    emergencies,
    cancellations,
    waitlistedRemaining: waitlisted
  };
};

module.exports = { simulateDay };
