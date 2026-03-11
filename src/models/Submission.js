const mongoose = require("mongoose");
const { VALID_CHECK_VALUES, VALID_STATUSES } = require("../utils/constants");

const checklistEntrySchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    label: { type: String, required: true },
    status: {
      type: String,
      enum: VALID_CHECK_VALUES,
      default: "PENDING",
    },
    remark: { type: String, default: "" },
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    trackingNumber: { type: String, required: true, unique: true, index: true },
    templateId: { type: String, required: true, index: true },
    templateSnapshot: { type: Object, required: true },
    applicantName: { type: String, required: true, trim: true },
    applicantPhone: { type: String, trim: true, default: "" },
    productName: { type: String, required: true, trim: true },
    productSampleAnswers: { type: Map, of: String, default: {} },
    documentsChecklist: { type: [checklistEntrySchema], default: [] },
    status: {
      type: String,
      enum: VALID_STATUSES,
      default: "RECEIVED",
      index: true,
    },
    decisionRemark: { type: String, default: "" },
    reviewedBy: { type: String, default: "" },
    clientSubmittedAt: { type: Date },
    adminReviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Submission", submissionSchema);
