const mongoose = require("mongoose");

const checklistItemSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    serialNumber: { type: Number, required: true },
    label: { type: String, required: true },
    inputType: { type: String },
    required: { type: Boolean },
  },
  { _id: false }
);

const templateSchema = new mongoose.Schema(
  {
    templateId: { type: String, required: true, unique: true, index: true },
    annexure: { type: String, required: true },
    sopRef: { type: String, required: true },
    title: { type: String, required: true },
    directorate: { type: String, required: true },
    documentsRequired: { type: [checklistItemSchema], default: [] },
    productSample: { type: [checklistItemSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Template", templateSchema);
