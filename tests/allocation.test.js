const mongoose = require("mongoose");
const Doctor = require("../src/models/Doctor");
const Slot = require("../src/models/Slot");
const Token = require("../src/models/Token");

const {
  allocateToken,
  cancelToken
} = require("../src/services/allocationService");


// 🔗 Connect to TEST DB
beforeAll(async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/opd-test");
});

// 🔚 Cleanup after all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

// 🧹 Clean DB before each test
beforeEach(async () => {
  await Doctor.deleteMany({});
  await Slot.deleteMany({});
  await Token.deleteMany({});
});


//  TEST 1 — Allocation when slot has capacity
test("allocates token when slot has free capacity", async () => {
  const doctor = await Doctor.create({
    name: "Dr Test",
    specialization: "General"
  });

  const slot = await Slot.create({
    doctorId: doctor._id,
    startTime: "09:00",
    endTime: "10:00",
    maxCapacity: 1,
    currentCount: 0,
    status: "OPEN"
  });

  const result = await allocateToken({
    patientName: "Patient A",
    doctorId: doctor._id,
    slotId: slot._id,
    source: "ONLINE",
    priority: 4
  });

  expect(result.status).toBe("ALLOCATED");

  const tokens = await Token.find({});
  expect(tokens.length).toBe(1);
  expect(tokens[0].status).toBe("BOOKED");
});


//  TEST 2 — Waitlist when slot is full
test("waitlists token when slot is full", async () => {
  const doctor = await Doctor.create({
    name: "Dr Test",
    specialization: "General"
  });

  const slot = await Slot.create({
    doctorId: doctor._id,
    startTime: "09:00",
    endTime: "10:00",
    maxCapacity: 1,
    currentCount: 0,
    status: "OPEN"
  });

  // First booking
  await allocateToken({
    patientName: "Patient A",
    doctorId: doctor._id,
    slotId: slot._id,
    source: "ONLINE",
    priority: 4
  });

  // Second booking → should be waitlisted
  const result = await allocateToken({
    patientName: "Patient B",
    doctorId: doctor._id,
    slotId: slot._id,
    source: "WALKIN",
    priority: 5
  });

  expect(result.status).toBe("WAITLISTED");

  const waitlisted = await Token.findOne({ status: "WAITLISTED" });
  expect(waitlisted).not.toBeNull();
});


//  TEST 3 — Cancellation triggers reallocation
test("cancellation reallocates waitlisted token", async () => {
  const doctor = await Doctor.create({
    name: "Dr Test",
    specialization: "General"
  });

  const slot = await Slot.create({
    doctorId: doctor._id,
    startTime: "09:00",
    endTime: "10:00",
    maxCapacity: 1,
    currentCount: 0,
    status: "OPEN"
  });

  const first = await allocateToken({
    patientName: "Patient A",
    doctorId: doctor._id,
    slotId: slot._id,
    source: "ONLINE",
    priority: 4
  });

  await allocateToken({
    patientName: "Patient B",
    doctorId: doctor._id,
    slotId: slot._id,
    source: "WALKIN",
    priority: 5
  });

  const result = await cancelToken(first.token._id);

  expect(result.status).toBe("CANCELLED_AND_REALLOCATED");

  const booked = await Token.findOne({ status: "BOOKED" });
  expect(booked.patientName).toBe("Patient B");
});