const Template = require("../models/Template");
const Submission = require("../models/Submission");
const XLSX = require("xlsx");
const { generateTrackingNumber } = require("../utils/tracking");
const { VALID_CHECK_VALUES, VALID_STATUSES } = require("../utils/constants");

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const MIN_MONTHS_BEFORE_EXPIRY = 6;
const PHONE_PATTERN = /^[+]?[\d\s().-]{7,20}$/;

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

function parseDateInput(rawValue, fieldLabel) {
  const value = `${rawValue || ""}`.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${fieldLabel} must be a valid date`);
  }

  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${fieldLabel} must be a valid date`);
  }

  return parsed;
}

function toUtcDateOnly(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addUtcMonths(date, months) {
  const day = date.getUTCDate();
  const shifted = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  shifted.setUTCMonth(shifted.getUTCMonth() + months);

  const lastDayOfTargetMonth = new Date(
    Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, 0)
  ).getUTCDate();

  shifted.setUTCDate(Math.min(day, lastDayOfTargetMonth));
  return shifted;
}

function validateProductDateRules(productSampleAnswers) {
  const manufacturingRaw = productSampleAnswers.product_manufacturing_date;
  const expiryRaw = productSampleAnswers.product_expiration_date;

  if (!manufacturingRaw || !expiryRaw) {
    return;
  }

  const manufacturingDate = parseDateInput(
    manufacturingRaw,
    "Product manufacturing date"
  );
  const expiryDate = parseDateInput(expiryRaw, "Product expiration date");

  if (manufacturingDate >= expiryDate) {
    throw new Error("Product expiration date must be after manufacturing date");
  }

  const today = toUtcDateOnly(new Date());
  const minimumAllowedExpiry = addUtcMonths(today, MIN_MONTHS_BEFORE_EXPIRY);

  if (expiryDate < minimumAllowedExpiry) {
    const remainingDays = Math.floor((expiryDate - today) / DAY_IN_MS);

    if (remainingDays < 0) {
      throw new Error("Product has already expired");
    }

    throw new Error("Product expiration date must be at least 6 months from today");
  }
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
    const { templateId, applicantName, applicantPhone, productName, productSampleAnswers } = req.body;

    const template = await Template.findOne({ templateId });
    if (!template) {
      res.status(400).json({ error: "Invalid templateId" });
      return;
    }

    const cleanApplicantName = `${applicantName || ""}`.trim();
    const cleanApplicantPhone = `${applicantPhone || ""}`.trim();
    const cleanProductName = `${productName || ""}`.trim();

    if (!cleanApplicantName) {
      res.status(400).json({ error: "Name of applicant is required" });
      return;
    }

    if (!cleanProductName) {
      res.status(400).json({ error: "Name of product is required" });
      return;
    }

    if (!cleanApplicantPhone) {
      res.status(400).json({ error: "Applicant phone number is required" });
      return;
    }

    if (!PHONE_PATTERN.test(cleanApplicantPhone)) {
      res.status(400).json({ error: "Applicant phone number is invalid" });
      return;
    }

    const normalizedAnswers = normalizeProductSampleAnswers(template, productSampleAnswers);
    validateProductDateRules(normalizedAnswers);
    const now = new Date();
    const trackingNumber = await generateTrackingNumber(template.templateId, now);

    const submission = await Submission.create({
      trackingNumber,
      templateId: template.templateId,
      templateSnapshot: template.toObject(),
      applicantName: cleanApplicantName,
      applicantPhone: cleanApplicantPhone,
      productName: cleanProductName,
      productSampleAnswers: normalizedAnswers,
      documentsChecklist: buildDefaultDocumentChecklist(template),
      status: "RECEIVED",
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
        "trackingNumber templateId applicantName applicantPhone productName status createdAt updatedAt templateSnapshot.title"
      )
      .lean();

    const mapped = submissions.map((item) => ({
      id: item._id?.toString?.() || item._id,
      trackingNumber: item.trackingNumber,
      templateId: item.templateId,
      templateTitle: item.templateSnapshot?.title || "",
      applicantName: item.applicantName,
      applicantPhone: item.applicantPhone || "",
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

    const currentStatus = `${submission.status || ""}`.toUpperCase();
    const nextStatus = req.body.status
      ? parseStatus(req.body.status)
      : VALID_STATUSES.includes(currentStatus)
        ? currentStatus
        : "RECEIVED";
    const decisionRemark = `${req.body.decisionRemark || submission.decisionRemark || ""}`.trim();

    if (nextStatus === "REJECTED" && !decisionRemark) {
      res.status(400).json({ error: "Rejection reason is required when status is REJECTED" });
      return;
    }

    submission.status = nextStatus;
    submission.decisionRemark = nextStatus === "REJECTED" ? decisionRemark : "";

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

    const nextStatus = parseStatus(req.body.status);
    const decisionRemark = `${req.body.decisionRemark || submission.decisionRemark || ""}`.trim();

    if (nextStatus === "REJECTED" && !decisionRemark) {
      res.status(400).json({ error: "Rejection reason is required when status is REJECTED" });
      return;
    }

    submission.status = nextStatus;
    submission.decisionRemark = nextStatus === "REJECTED" ? decisionRemark : "";
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

function buildAllSubmissionsExcelRows(submissions) {
  const sampleCodeToLabel = new Map();
  const checklistCodeToLabel = new Map();
  const sampleCodes = new Set();
  const checklistCodes = new Set();

  for (const submission of submissions) {
    for (const item of submission.templateSnapshot?.productSample || []) {
      sampleCodes.add(item.code);
      if (!sampleCodeToLabel.has(item.code)) {
        sampleCodeToLabel.set(item.code, item.label || item.code);
      }
    }

    for (const item of submission.templateSnapshot?.documentsRequired || []) {
      checklistCodes.add(item.code);
      if (!checklistCodeToLabel.has(item.code)) {
        checklistCodeToLabel.set(item.code, item.label || item.code);
      }
    }
  }

  const orderedSampleCodes = Array.from(sampleCodes).sort((left, right) => left.localeCompare(right));
  const orderedChecklistCodes = Array.from(checklistCodes).sort((left, right) =>
    left.localeCompare(right)
  );

  return submissions.map((submission) => {
    const answers = normalizeMap(submission.productSampleAnswers || {});
    const checklistEntries = new Map(
      (submission.documentsChecklist || []).map((entry) => [entry.code, entry])
    );

    const row = {
      "Tracking Number": submission.trackingNumber || "",
      "Template ID": submission.templateId || "",
      "Template Title": submission.templateSnapshot?.title || "",
      "Applicant Name": submission.applicantName || "",
      "Applicant Phone": submission.applicantPhone || "",
      "Product Name": submission.productName || "",
      Status: submission.status || "",
      "Client Submitted At": submission.clientSubmittedAt
        ? new Date(submission.clientSubmittedAt).toISOString()
        : "",
      "Admin Reviewed At": submission.adminReviewedAt
        ? new Date(submission.adminReviewedAt).toISOString()
        : "",
      "Received By": submission.reviewedBy || "",
      "Rejection Reason": submission.decisionRemark || "",
      "Created At": submission.createdAt ? new Date(submission.createdAt).toISOString() : "",
      "Updated At": submission.updatedAt ? new Date(submission.updatedAt).toISOString() : "",
    };

    for (const code of orderedSampleCodes) {
      const label = sampleCodeToLabel.get(code) || code;
      row[`Sample: ${label}`] = answers[code] || "";
    }

    for (const code of orderedChecklistCodes) {
      const label = checklistCodeToLabel.get(code) || code;
      const entry = checklistEntries.get(code);
      row[`Checklist: ${label} (Status)`] = entry?.status || "";
      row[`Checklist: ${label} (Remark)`] = entry?.remark || "";
    }

    return row;
  });
}

async function exportAllSubmissionsToExcel(req, res, next) {
  try {
    const submissions = await Submission.find({})
      .sort({ createdAt: -1 })
      .lean();

    const rows = buildAllSubmissionsExcelRows(submissions);
    const worksheet = XLSX.utils.json_to_sheet(rows.length ? rows : [{ Note: "No submissions available" }]);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Submissions");

    const fileBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    const dateTag = new Date().toISOString().slice(0, 10);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="samples-submissions-${dateTag}.xlsx"`
    );
    res.send(fileBuffer);
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
  exportAllSubmissionsToExcel,
};
