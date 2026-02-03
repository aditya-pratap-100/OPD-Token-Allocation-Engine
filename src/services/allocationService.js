const Slot = require("../models/Slot");
const Token = require("../models/Token");
const findLowestPriorityToken = async (slotId) => {
  return await Token.find({ slotId, status: "BOOKED" })
    .sort({ priority: -1, createdAt: 1 })
    .limit(1);
};

const allocateToken = async ({
  patientName,
  doctorId,
  slotId,
  source,
  priority
}) => {

  const slot = await Slot.findById(slotId);
  if (!slot) throw new Error("Slot not found");

  //  Emergency always allowed
  if (source === "EMERGENCY") {
    const token = await Token.create({
      patientName,
      doctorId,
      slotId,
      source,
      priority
    });

    slot.currentCount += 1;
    slot.status = "OVERBOOKED";
    await slot.save();

    return {
      status: "ALLOCATED_EMERGENCY",
      token
    };
  }

  //  Slot has capacity
  if (slot.currentCount < slot.maxCapacity) {
    const token = await Token.create({
      patientName,
      doctorId,
      slotId,
      source,
      priority
    });

    slot.currentCount += 1;
    if (slot.currentCount === slot.maxCapacity) {
      slot.status = "FULL";
    }
    await slot.save();

    return {
      status: "ALLOCATED",
      token
    };
  }

  //  Slot is full → check priority
  const [lowestToken] = await findLowestPriorityToken(slotId);

  if (!lowestToken) {
    return { status: "FAILED" };
  }

  // Higher priority wins
  if (priority < lowestToken.priority) {
    // bump old token
    lowestToken.status = "CANCELLED";
    await lowestToken.save();

    const token = await Token.create({
      patientName,
      doctorId,
      slotId,
      source,
      priority
    });

    return {
      status: "ALLOCATED_BY_BUMPING",
      bumpedToken: lowestToken._id,
      token
    };
  }

  // Cannot allocate  put in WAITLIST
  const waitlistedToken = await Token.create({
  patientName,
  doctorId,
  slotId,
  source,
  priority,
  status: "WAITLISTED"
});

return {
  status: "WAITLISTED",
  token: waitlistedToken
};
};


const findNextWaitlistedToken = async (slotId) => {
  return await Token.find({ slotId, status: "WAITLISTED" })
    .sort({ priority: 1, createdAt: 1 })
    .limit(1);
};

const cancelToken = async (tokenId) => {
  const token = await Token.findById(tokenId);
  if (!token) throw new Error("Token not found");

  if (token.status !== "BOOKED") {
    return { status: "IGNORED" };
  }

  token.status = "CANCELLED";
  await token.save();

  const slot = await Slot.findById(token.slotId);
  slot.currentCount -= 1;
  slot.status = "OPEN";
  await slot.save();

  // 🔁 refill from waitlist
  const [nextToken] = await findNextWaitlistedToken(slot._id);

  if (nextToken) {
    nextToken.status = "BOOKED";
    await nextToken.save();

    slot.currentCount += 1;
    if (slot.currentCount === slot.maxCapacity) {
      slot.status = "FULL";
    }
    await slot.save();

    return {
      status: "CANCELLED_AND_REALLOCATED",
      reallocatedToken: nextToken._id
    };
  }

  return { status: "CANCELLED_NO_WAITLIST" };
};

const markNoShow = async (tokenId) => {
  const token = await Token.findById(tokenId);
  if (!token) throw new Error("Token not found");

  token.status = "NO_SHOW";
  await token.save();

  return await cancelToken(tokenId);
};

module.exports = { allocateToken , cancelToken};



