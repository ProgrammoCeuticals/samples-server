const Counter = require("../models/Counter");

const TEMPLATE_PREFIX = {
  new_registration: "ANN1",
  renewal: "ANN2",
  variation: "ANN3",
};

async function nextSequence(name) {
  const counter = await Counter.findOneAndUpdate(
    { name },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return counter.sequence;
}

function formatDate(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

async function generateTrackingNumber(templateId, date = new Date()) {
  const sequence = await nextSequence("submission");
  const prefix = TEMPLATE_PREFIX[templateId] || "ANNX";
  const datePart = formatDate(date);
  return `SAMPLES-${prefix}-${datePart}-${String(sequence).padStart(5, "0")}`;
}

module.exports = {
  generateTrackingNumber,
};
