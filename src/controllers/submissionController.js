const Template = require("../models/Template");
const Submission = require("../models/Submission");
const { generateTrackingNumber } = require("../utils/tracking");
const { VALID_CHECK_VALUES, VALID_STATUSES } = require("../utils/constants");

function normalizeMap(mapValue) {
  if (!mapValue) {
    return {};
  }

  if (mapValue instanceof Map) {
    return Object.fromEntries(mapValue.entries());
  }

  return mapValue;
}

function serializeSubmission(submission) {
  const plain = submission.toObject ? submission.toObject() : submission;
  const templateSnapshot = plain.templateSnapshot || {};
  const templateSnapshotWithId = templateSnapshot.templateId
    ? { ...templateSnapshot, id: templateSnapshot.templateId }
    : templateSnapshot;

  return {
    ...plain,
    id: plain.id || plain._id?.toString?.() || plain._id,
    templateSnapshot: templateSnapshotWithId,
    productSampleAnswers: normalizeMap(plain.productSampleAnswers),
  };
}

function buildDefaultDocumentChecklist(template) {
  return template.documentsRequired.map((item) => ({
    code: item.code,
    label: item.label,
    status: "PENDING",
    remark: "",
  }));
}

function normalizeProductSampleAnswers(template, answers) {
  const incoming = answers || {};
  const normalized = {};

  for (const item of template.productSample) {
    const value = incoming[item.code];
    const cleanValue = typeof value === "string" ? value.trim() : `${value || ""}`.trim();

    if (item.required && !cleanValue) {
      throw new Error(`Missing required product sample field: ${item.label}`);
    }

    normalized[item.code] = cleanValue;
  }

  return normalized;
}

function parseStatus(value) {
  const status = `${value || ""}`.toUpperCase();
  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`Invalid status: ${value}`);
  }
  return status;
}

function parseChecklistStatus(value) {
  const status = `${value || ""}`.toUpperCase();
  if (!VALID_CHECK_VALUES.includes(status)) {
    throw new Error(`Invalid checklist status: ${value}`);
  }
  return status;
}

async function createSubmission(req, res, next) {
  try {
    const { templateId, applicantName, productName, productSampleAnswers } = req.body;

    const template = await Template.findOne({ templateId });
    if (!template) {
      res.status(400).json({ error: "Invalid templateId" });
      return;
    }

    const cleanApplicantName = `${applicantName || ""}`.trim();
    const cleanProductName = `${productName || ""}`.trim();

    if (!cleanApplicantName) {
      res.status(400).json({ error: "Name of applicant is required" });
      return;
    }

    if (!cleanProductName) {
      res.status(400).json({ error: "Name of product is required" });
      return;
    }

    const normalizedAnswers = normalizeProductSampleAnswers(template, productSampleAnswers);
    const now = new Date();
    const trackingNumber = await generateTrackingNumber(template.templateId, now);

    const submission = await Submission.create({
      trackingNumber,
      templateId: template.templateId,
      templateSnapshot: template.toObject(),
      applicantName: cleanApplicantName,
      productName: cleanProductName,
      productSampleAnswers: normalizedAnswers,
      documentsChecklist: buildDefaultDocumentChecklist(template),
      status: "SUBMITTED",
      decisionRemark: "",
      reviewedBy: "",
      clientSubmittedAt: now,
      adminReviewedAt: null,
    });

    res.status(201).json({ submission: serializeSubmission(submission) });
  } catch (error) {
    next(error);
  }
}

async function listSubmissions(req, res, next) {
  try {
    const { templateId = "", status = "" } = req.query;
    const filters = {};

    if (templateId) {
      filters.templateId = templateId;
    }

    if (status) {
      const cleanStatus = `${status}`.toUpperCase();
      if (VALID_STATUSES.includes(cleanStatus)) {
        filters.status = cleanStatus;
      }
    }

    const submissions = await Submission.find(filters)
      .sort({ createdAt: -1 })
      .select(
        "trackingNumber templateId applicantName productName status createdAt updatedAt templateSnapshot.title"
      )
      .lean();

    const mapped = submissions.map((item) => ({
      id: item._id?.toString?.() || item._id,
      trackingNumber: item.trackingNumber,
      templateId: item.templateId,
      templateTitle: item.templateSnapshot?.title || "",
      applicantName: item.applicantName,
      productName: item.productName,
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    res.json({ submissions: mapped });
  } catch (error) {
    next(error);
  }
}

async function getSubmissionById(req, res, next) {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      res.status(404).json({ error: "Submission not found" });
      return;
    }

    res.json({ submission: serializeSubmission(submission) });
  } catch (error) {
    next(error);
  }
}

async function updateDocumentsChecklist(req, res, next) {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      res.status(404).json({ error: "Submission not found" });
      return;
    }

    const checklistUpdates = Array.isArray(req.body.checklist) ? req.body.checklist : [];
    const updateMap = new Map(checklistUpdates.map((item) => [item.code, item]));

    submission.documentsChecklist = submission.documentsChecklist.map((entry) => {
      const update = updateMap.get(entry.code);
      if (!update) {
        return entry;
      }

      return {
        ...entry.toObject(),
        status: parseChecklistStatus(update.status || entry.status),
        remark: `${update.remark || ""}`.trim(),
      };
    });

    if (req.body.status) {
      submission.status = parseStatus(req.body.status);
    } else if (submission.status === "SUBMITTED") {
      submission.status = "IN_REVIEW";
    }

    submission.reviewedBy = `${req.body.reviewedBy || submission.reviewedBy || ""}`.trim();
    submission.adminReviewedAt = new Date();

    await submission.save();

    res.json({ submission: serializeSubmission(submission) });
  } catch (error) {
    next(error);
  }
}

async function updateSubmissionStatus(req, res, next) {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      res.status(404).json({ error: "Submission not found" });
      return;
    }

    submission.status = parseStatus(req.body.status);
    submission.decisionRemark = `${req.body.decisionRemark || submission.decisionRemark || ""}`.trim();
    submission.reviewedBy = `${req.body.reviewedBy || submission.reviewedBy || ""}`.trim();
    submission.adminReviewedAt = new Date();

    await submission.save();

    res.json({ submission: serializeSubmission(submission) });
  } catch (error) {
    next(error);
  }
}

async function getExportPayload(req, res, next) {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      res.status(404).json({ error: "Submission not found" });
      return;
    }

    res.json({
      generatedAt: new Date().toISOString(),
      submission: serializeSubmission(submission),
      template: submission.templateSnapshot,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createSubmission,
  listSubmissions,
  getSubmissionById,
  updateDocumentsChecklist,
  updateSubmissionStatus,
  getExportPayload,
};
