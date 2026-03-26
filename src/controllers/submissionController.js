const Template = require("../models/Template");
const Submission = require("../models/Submission");
const XLSX = require("xlsx");
const { generateTrackingNumber } = require("../utils/tracking");
const { VALID_CHECK_VALUES, VALID_STATUSES } = require("../utils/constants");

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const MIN_MONTHS_BEFORE_EXPIRY = 6;
const PHONE_PATTERN = /^[+]?[\d\s().-]{7,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BRAND_NAME_FIELD_CODE = "brand_name";
const GENERIC_NAME_FIELD_CODE = "generic_name";
const DISTRIBUTOR_FIELD_CODE = "distributor";
const SOURCE_FIELD_CODE = "source";
const MANUFACTURER_FIELD_CODE = "manufacturer";
const DOSAGE_FORM_FIELD_CODE = "dosage_form";
const MANUFACTURING_DATE_FIELD_CODE = "manufacturing_date";
const EXPIRY_DATE_FIELD_CODE = "expiry_date";
const PACK_SIZE_FIELD_CODE = "pack_size";
const BATCH_NUMBER_FIELD_CODE = "batch_no";
const QUANTITY_FIELD_CODE = "quantity";
const SAMPLING_DATE_FIELD_CODE = "sampling_date";
const PHARMACOPOEIA_FIELD_CODE = "pharmacopoeia";
const STORAGE_CONDITION_FIELD_CODE = "storage_condition";
const REASON_FOR_ANALYSIS_FIELD_CODE = "reason_for_analysis";
const REQUIRED_TEST_FIELD_CODE = "required_test";
const CATEGORY_FIELD_CODE = "category";
const PHYSICAL_DESCRIPTION_FIELD_CODE = "physical_description";
const COUNTRY_OF_ORIGIN_FIELD_CODE = "country_of_origin";
const PORT_OF_ENTRY_FIELD_CODE = "port_of_entry";
const RISK_FACTOR_FIELD_CODE = "risk_factor";
const PRODUCT_CLASS_FIELD_CODE = "product_class";
const NAPAMS_NUMBER_FIELD_CODE = "napams_number";
const NAFDAC_NUMBER_FIELD_CODE = "nafdac_no";
const STRENGTH_FIELD_CODE = "strength";
const CONSIGNMENT_SIZE_FIELD = "consignmentSize";
const RETEST_DATE_FIELD = "retestDate";
const TEST_REQUEST_NO_FIELD = "testRequestNo";
const TEST_PARAMETERS_FIELD = "testParameters";
const SEARCHABLE_SUBMISSION_FIELDS = [
  "napamsNumber",
  "trackingNumber",
  "applicantName",
  "productName",
  "reviewedBy",
  "officerName",
  "decisionRemark",
  "labComment",
  "consignmentSize",
  "retestDate",
  "testRequestNo",
  "testParameters",
  "sampleReceivedDate",
  "takenToLabDate",
  "labReportReceivedDate",
  `productSampleAnswers.${BRAND_NAME_FIELD_CODE}`,
  `productSampleAnswers.${GENERIC_NAME_FIELD_CODE}`,
  `productSampleAnswers.${PRODUCT_CLASS_FIELD_CODE}`,
  `productSampleAnswers.${NAPAMS_NUMBER_FIELD_CODE}`,
  `productSampleAnswers.${NAFDAC_NUMBER_FIELD_CODE}`,
  `productSampleAnswers.${DOSAGE_FORM_FIELD_CODE}`,
  `productSampleAnswers.${STRENGTH_FIELD_CODE}`,
  `productSampleAnswers.${PACK_SIZE_FIELD_CODE}`,
  `productSampleAnswers.${BATCH_NUMBER_FIELD_CODE}`,
  `productSampleAnswers.${SOURCE_FIELD_CODE}`,
  `productSampleAnswers.${DISTRIBUTOR_FIELD_CODE}`,
  `productSampleAnswers.${MANUFACTURER_FIELD_CODE}`,
  `productSampleAnswers.${PHARMACOPOEIA_FIELD_CODE}`,
  `productSampleAnswers.${STORAGE_CONDITION_FIELD_CODE}`,
  `productSampleAnswers.${REASON_FOR_ANALYSIS_FIELD_CODE}`,
  `productSampleAnswers.${REQUIRED_TEST_FIELD_CODE}`,
  `productSampleAnswers.${CATEGORY_FIELD_CODE}`,
  `productSampleAnswers.${PHYSICAL_DESCRIPTION_FIELD_CODE}`,
  `productSampleAnswers.${COUNTRY_OF_ORIGIN_FIELD_CODE}`,
  `productSampleAnswers.${PORT_OF_ENTRY_FIELD_CODE}`,
  `productSampleAnswers.${RISK_FACTOR_FIELD_CODE}`,
];

const MANIFEST_EXPORT_COLUMNS = [
  { header: "BRAND NAME", code: BRAND_NAME_FIELD_CODE },
  { header: "GENERIC NAME", code: GENERIC_NAME_FIELD_CODE },
  { header: "PRODUCT CLASS", code: PRODUCT_CLASS_FIELD_CODE },
  { header: "NAFDAC NO", code: NAFDAC_NUMBER_FIELD_CODE },
  { header: "DOSAGE FORM", code: DOSAGE_FORM_FIELD_CODE },
  { header: "STRENGTH", code: STRENGTH_FIELD_CODE },
  { header: "PACK SIZE", code: PACK_SIZE_FIELD_CODE },
  { header: "MANUF. DATE", code: MANUFACTURING_DATE_FIELD_CODE },
  { header: "EXPIRY DATE", code: EXPIRY_DATE_FIELD_CODE },
  { header: "BATCH NO", code: BATCH_NUMBER_FIELD_CODE },
  { header: "SOURCE", code: SOURCE_FIELD_CODE },
  { header: "DISTRIBUTOR", code: DISTRIBUTOR_FIELD_CODE },
  { header: "QTY", code: QUANTITY_FIELD_CODE },
  { header: "MANUFACTURER", code: MANUFACTURER_FIELD_CODE },
  { header: "SAMPLING DATE", code: SAMPLING_DATE_FIELD_CODE },
  { header: "CONSIGNMENT SIZE", submissionKey: CONSIGNMENT_SIZE_FIELD },
  { header: "RETEST DATE", submissionKey: RETEST_DATE_FIELD },
  { header: "PHARMACOPOEIA", code: PHARMACOPOEIA_FIELD_CODE },
  { header: "STORAGE CONDITION", code: STORAGE_CONDITION_FIELD_CODE },
  { header: "REASON FOR ANALYSIS", code: REASON_FOR_ANALYSIS_FIELD_CODE },
  { header: "REQUIRED TEST", code: REQUIRED_TEST_FIELD_CODE },
  { header: "NAME OF OFFICER", submissionKey: "officerName" },
  { header: "DESIGNATION", submissionKey: "officerDesignation" },
  { header: "PHONE NO", submissionKey: "officerPhone" },
  { header: "EMAIL", submissionKey: "officerEmail" },
  { header: "CATEGORY", code: CATEGORY_FIELD_CODE },
  { header: "PHYSICAL DESCRIPTION", code: PHYSICAL_DESCRIPTION_FIELD_CODE },
  { header: "COUNTRY OF ORIGIN", code: COUNTRY_OF_ORIGIN_FIELD_CODE },
  { header: "PORT OF ENTRY", code: PORT_OF_ENTRY_FIELD_CODE },
  { header: "TEST REQUEST NO", submissionKey: TEST_REQUEST_NO_FIELD },
  { header: "TEST PARAMETERS", submissionKey: TEST_PARAMETERS_FIELD },
  { header: "RISK FACTOR", code: RISK_FACTOR_FIELD_CODE },
  { header: "DATE SAMPLE RECEIVED", submissionKey: "sampleReceivedDate" },
  { header: "DATE TAKEN TO LAB", submissionKey: "takenToLabDate" },
  { header: "DATE LAB REPORT RECEIVED", submissionKey: "labReportReceivedDate" },
  { header: "LAB COMMENT", submissionKey: "labComment" },
];

const MANIFEST_HEADER_SET = new Set(MANIFEST_EXPORT_COLUMNS.map((column) => column.header));
const REASON_TO_TEMPLATE_ID = {
  "new registration": "new_registration",
  registration: "new_registration",
  new: "new_registration",
  renewal: "renewal",
  variation: "variation",
};

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
    const defaultValue =
      typeof item.defaultValue === "string" ? item.defaultValue.trim() : "";
    const resolvedValue = item.readOnly ? defaultValue : cleanValue || defaultValue;

    if (item.required && !resolvedValue) {
      throw new Error(`Missing required product sample field: ${item.label}`);
    }

    normalized[item.code] = resolvedValue;
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
  const manufacturingRaw = productSampleAnswers[MANUFACTURING_DATE_FIELD_CODE];
  const expiryRaw = productSampleAnswers[EXPIRY_DATE_FIELD_CODE];

  if (!manufacturingRaw || !expiryRaw) {
    return;
  }

  const manufacturingDate = parseDateInput(
    manufacturingRaw,
    "Product manufacturing date"
  );
  const expiryDate = parseDateInput(expiryRaw, "Product expiration date");

  if (manufacturingDate >= expiryDate) {
    throw new Error(
      "Sample cannot be registered because the product expiration date must be after the manufacturing date"
    );
  }

  const today = toUtcDateOnly(new Date());
  const minimumAllowedExpiry = addUtcMonths(today, MIN_MONTHS_BEFORE_EXPIRY);

  if (expiryDate < minimumAllowedExpiry) {
    const remainingDays = Math.floor((expiryDate - today) / DAY_IN_MS);

    if (remainingDays < 0) {
      throw new Error("Sample cannot be registered because the product has already expired");
    }

    throw new Error(
      "Sample cannot be registered because the product expiration date must be at least 6 months from today"
    );
  }
}

function getAnswerValue(answers, code) {
  return `${answers?.[code] || ""}`.trim();
}

function escapeRegex(value) {
  return `${value || ""}`.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildSubmissionSearchFilter(rawQuery) {
  const cleanQuery = `${rawQuery || ""}`.trim();

  if (!cleanQuery) {
    return null;
  }

  const terms = cleanQuery.split(/\s+/).filter(Boolean).slice(0, 8);
  if (!terms.length) {
    return null;
  }

  return {
    $and: terms.map((term) => {
      const regex = new RegExp(escapeRegex(term), "i");
      return {
        $or: SEARCHABLE_SUBMISSION_FIELDS.map((field) => ({ [field]: regex })),
      };
    }),
  };
}

function scoreIdentifierMatch(value, query) {
  const cleanValue = `${value || ""}`.trim().toLowerCase();
  const cleanQuery = `${query || ""}`.trim().toLowerCase();

  if (!cleanValue || !cleanQuery) {
    return 0;
  }

  if (cleanValue === cleanQuery) {
    return 3;
  }

  if (cleanValue.startsWith(cleanQuery)) {
    return 2;
  }

  if (cleanValue.includes(cleanQuery)) {
    return 1;
  }

  return 0;
}

function scoreSubmissionSearchMatch(submission, rawQuery) {
  const answers = normalizeMap(submission.productSampleAnswers || {});
  const query = `${rawQuery || ""}`.trim();

  if (!query) {
    return 0;
  }

  const weightedFields = [
    { value: submission.napamsNumber, weight: 300 },
    { value: submission.trackingNumber, weight: 220 },
    { value: getAnswerValue(answers, BRAND_NAME_FIELD_CODE), weight: 160 },
    { value: getAnswerValue(answers, GENERIC_NAME_FIELD_CODE), weight: 140 },
    { value: submission.productName, weight: 140 },
    { value: getAnswerValue(answers, BATCH_NUMBER_FIELD_CODE), weight: 120 },
    { value: getAnswerValue(answers, DISTRIBUTOR_FIELD_CODE), weight: 100 },
    { value: getAnswerValue(answers, SOURCE_FIELD_CODE), weight: 100 },
    { value: getAnswerValue(answers, MANUFACTURER_FIELD_CODE), weight: 90 },
    { value: getAnswerValue(answers, NAFDAC_NUMBER_FIELD_CODE), weight: 80 },
    { value: getAnswerValue(answers, DOSAGE_FORM_FIELD_CODE), weight: 70 },
    { value: submission.reviewedBy, weight: 40 },
    { value: submission.labComment, weight: 30 },
  ];

  return weightedFields.reduce((score, field) => {
    return score + scoreIdentifierMatch(field.value, query) * field.weight;
  }, 0);
}

function buildManifestExcelRows(submissions) {
  return submissions.map((submission) => {
    const answers = normalizeMap(submission.productSampleAnswers || {});
    const row = {};

    for (const column of MANIFEST_EXPORT_COLUMNS) {
      if (column.code) {
        row[column.header] = getAnswerValue(answers, column.code);
        continue;
      }

      if (column.submissionKey) {
        row[column.header] = `${submission?.[column.submissionKey] || ""}`.trim();
        continue;
      }

      row[column.header] = "";
    }

    return row;
  });
}

function normalizeReasonToTemplateId(value) {
  const normalized = `${value || ""}`
    .trim()
    .toLowerCase()
    .replace(/[^a-z]+/g, " ")
    .replace(/\s+/g, " ");

  return REASON_TO_TEMPLATE_ID[normalized] || "";
}

function buildImportedProductSampleAnswers(row, template) {
  const answers = {};

  for (const item of template.productSample) {
    const matchingColumn = MANIFEST_EXPORT_COLUMNS.find((column) => column.code === item.code);
    const manifestHeader = matchingColumn?.header;
    answers[item.code] = manifestHeader ? `${row?.[manifestHeader] || ""}`.trim() : "";
  }

  return answers;
}

function getManifestRowValue(row, header) {
  return `${row?.[header] || ""}`.trim();
}

function buildImportedSubmissionPayload(row, template, trackingNumber, importedAt) {
  const productSampleAnswers = buildImportedProductSampleAnswers(row, template);

  return {
    trackingNumber,
    templateId: template.templateId,
    templateSnapshot: template.toObject(),
    applicantName:
      getManifestRowValue(row, "DISTRIBUTOR") ||
      getManifestRowValue(row, "SOURCE") ||
      deriveApplicantName(productSampleAnswers),
    applicantPhone: "",
    productName:
      getManifestRowValue(row, "BRAND NAME") ||
      getManifestRowValue(row, "GENERIC NAME") ||
      deriveProductName(productSampleAnswers),
    productSampleAnswers,
    documentsChecklist: buildDefaultDocumentChecklist(template),
    status: "RECEIVED",
    decisionRemark: "",
    napamsNumber: "",
    reviewedBy: "",
    officerName: getManifestRowValue(row, "NAME OF OFFICER"),
    officerDesignation: getManifestRowValue(row, "DESIGNATION"),
    officerPhone: getManifestRowValue(row, "PHONE NO"),
    officerEmail: getManifestRowValue(row, "EMAIL"),
    consignmentSize: getManifestRowValue(row, "CONSIGNMENT SIZE"),
    retestDate: getManifestRowValue(row, "RETEST DATE"),
    testRequestNo: getManifestRowValue(row, "TEST REQUEST NO"),
    testParameters: getManifestRowValue(row, "TEST PARAMETERS"),
    sampleReceivedDate: getManifestRowValue(row, "DATE SAMPLE RECEIVED"),
    takenToLabDate: getManifestRowValue(row, "DATE TAKEN TO LAB"),
    labReportReceivedDate: getManifestRowValue(row, "DATE LAB REPORT RECEIVED"),
    labComment: getManifestRowValue(row, "LAB COMMENT"),
    clientSubmittedAt: importedAt,
    adminReviewedAt:
      getManifestRowValue(row, "NAME OF OFFICER") ||
      getManifestRowValue(row, "DATE SAMPLE RECEIVED") ||
      getManifestRowValue(row, "DATE TAKEN TO LAB") ||
      getManifestRowValue(row, "DATE LAB REPORT RECEIVED") ||
      getManifestRowValue(row, "LAB COMMENT")
        ? importedAt
        : null,
  };
}

function deriveApplicantName(answers) {
  return (
    getAnswerValue(answers, DISTRIBUTOR_FIELD_CODE) ||
    getAnswerValue(answers, SOURCE_FIELD_CODE) ||
    getAnswerValue(answers, MANUFACTURER_FIELD_CODE) ||
    getAnswerValue(answers, BRAND_NAME_FIELD_CODE)
  );
}

function deriveProductName(answers) {
  return (
    getAnswerValue(answers, BRAND_NAME_FIELD_CODE) ||
    getAnswerValue(answers, GENERIC_NAME_FIELD_CODE) ||
    "Product"
  );
}

function applyOfficerDetails(submission, payload) {
  const officerName = `${payload.officerName || submission.officerName || ""}`.trim();
  const officerDesignation = `${payload.officerDesignation || submission.officerDesignation || ""}`.trim();
  const officerPhone = `${payload.officerPhone || submission.officerPhone || ""}`.trim();
  const officerEmail = `${payload.officerEmail || submission.officerEmail || ""}`.trim();

  if (officerPhone && !PHONE_PATTERN.test(officerPhone)) {
    const error = new Error("Officer phone number is invalid");
    error.statusCode = 400;
    throw error;
  }

  if (officerEmail && !EMAIL_PATTERN.test(officerEmail)) {
    const error = new Error("Officer email is invalid");
    error.statusCode = 400;
    throw error;
  }

  submission.officerName = officerName;
  submission.officerDesignation = officerDesignation;
  submission.officerPhone = officerPhone;
  submission.officerEmail = officerEmail;
}

function applyNapamsNumber(submission, payload) {
  submission.napamsNumber = `${payload.napamsNumber ?? submission.napamsNumber ?? ""}`.trim();
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

function parseOptionalDateField(value, fieldLabel) {
  const cleanValue = `${value || ""}`.trim();

  if (!cleanValue) {
    return "";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanValue)) {
    const error = new Error(`${fieldLabel} must be a valid date`);
    error.statusCode = 400;
    throw error;
  }

  return cleanValue;
}

function applyMovementTracking(submission, payload) {
  submission.sampleReceivedDate = parseOptionalDateField(
    payload.sampleReceivedDate ?? submission.sampleReceivedDate,
    "Date sample received"
  );
  submission.takenToLabDate = parseOptionalDateField(
    payload.takenToLabDate ?? submission.takenToLabDate,
    "Date taken to lab"
  );
  submission.labReportReceivedDate = parseOptionalDateField(
    payload.labReportReceivedDate ?? submission.labReportReceivedDate,
    "Date lab report received"
  );
  submission.labComment = `${payload.labComment ?? submission.labComment ?? ""}`.trim();
}

async function createSubmission(req, res, next) {
  try {
    const { templateId, applicantName, applicantPhone, productName, productSampleAnswers } = req.body;

    const template = await Template.findOne({ templateId });
    if (!template) {
      res.status(400).json({ error: "Invalid templateId" });
      return;
    }

    const normalizedAnswers = normalizeProductSampleAnswers(template, productSampleAnswers);
    const cleanApplicantName = `${applicantName || deriveApplicantName(normalizedAnswers)}`.trim();
    const cleanApplicantPhone = `${applicantPhone || ""}`.trim();
    const cleanProductName = `${productName || deriveProductName(normalizedAnswers)}`.trim();

    if (!cleanApplicantName) {
      res.status(400).json({ error: "A source, distributor, manufacturer, or brand name is required" });
      return;
    }

    if (!cleanProductName) {
      res.status(400).json({ error: "Name of product is required" });
      return;
    }

    if (cleanApplicantPhone && !PHONE_PATTERN.test(cleanApplicantPhone)) {
      res.status(400).json({ error: "Applicant phone number is invalid" });
      return;
    }

    validateProductDateRules(normalizedAnswers);

    const batchNumber = getAnswerValue(normalizedAnswers, BATCH_NUMBER_FIELD_CODE);
    if (!batchNumber) {
      res.status(400).json({ error: "Batch number is required" });
      return;
    }

    const reasonForAnalysis = getAnswerValue(normalizedAnswers, REASON_FOR_ANALYSIS_FIELD_CODE);
    if (!reasonForAnalysis) {
      res.status(400).json({ error: "Reason for analysis is required" });
      return;
    }

    const existing = await Submission.findOne({ [`productSampleAnswers.${BATCH_NUMBER_FIELD_CODE}`]: batchNumber }).lean();
    if (existing) {
      res.status(409).json({ error: `A submission with batch number "${batchNumber}" already exists (Tracking: ${existing.trackingNumber})` });
      return;
    }

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
      napamsNumber: getAnswerValue(normalizedAnswers, NAPAMS_NUMBER_FIELD_CODE),
      reviewedBy: "",
      officerName: "",
      officerDesignation: "",
      officerPhone: "",
      officerEmail: "",
      consignmentSize: "",
      retestDate: "",
      testRequestNo: "",
      testParameters: "",
      sampleReceivedDate: "",
      takenToLabDate: "",
      labReportReceivedDate: "",
      labComment: "",
      clientSubmittedAt: now,
      adminReviewedAt: null,
    });

    res.status(201).json({ submission: serializeSubmission(submission) });
  } catch (error) {
    next(error);
  }
}

async function importManifestRows(req, res, next) {
  try {
    const rows = Array.isArray(req.body.rows) ? req.body.rows : [];

    if (!rows.length) {
      res.status(400).json({ error: "Manifest rows are required for import" });
      return;
    }

    if (rows.length > 1000) {
      res.status(400).json({ error: "Manifest import is limited to 1000 rows per upload" });
      return;
    }

    for (const [index, row] of rows.entries()) {
      const unknownHeaders = Object.keys(row || {}).filter((header) => !MANIFEST_HEADER_SET.has(header));

      if (unknownHeaders.length) {
        res.status(400).json({
          error: `Manifest row ${index + 1} includes unsupported columns: ${unknownHeaders.join(", ")}`,
        });
        return;
      }
    }

    const templateIds = Array.from(
      new Set(
        rows
          .map((row) => normalizeReasonToTemplateId(row?.["REASON FOR ANALYSIS"]))
          .filter(Boolean)
      )
    );

    const templates = await Template.find({ templateId: { $in: templateIds } });
    const templateMap = new Map(templates.map((template) => [template.templateId, template]));
    const importedAt = new Date();
    const payloads = [];

    for (const [index, row] of rows.entries()) {
      const templateId = normalizeReasonToTemplateId(row?.["REASON FOR ANALYSIS"]);
      if (!templateId) {
        res.status(400).json({
          error: `Manifest row ${index + 1} has an unsupported reason for analysis`,
        });
        return;
      }

      const template = templateMap.get(templateId);
      if (!template) {
        res.status(400).json({
          error: `Manifest row ${index + 1} could not be matched to a saved template`,
        });
        return;
      }

      const brandName = getManifestRowValue(row, "BRAND NAME");
      const genericName = getManifestRowValue(row, "GENERIC NAME");
      if (!brandName && !genericName) {
        res.status(400).json({
          error: `Manifest row ${index + 1} must include a brand name or generic name`,
        });
        return;
      }

      if (!getManifestRowValue(row, "BATCH NO")) {
        res.status(400).json({ error: `Manifest row ${index + 1} is missing a batch number` });
        return;
      }

      if (!getManifestRowValue(row, "REASON FOR ANALYSIS")) {
        res.status(400).json({ error: `Manifest row ${index + 1} is missing a reason for analysis` });
        return;
      }

      const trackingNumber = await generateTrackingNumber(template.templateId, importedAt);
      payloads.push(buildImportedSubmissionPayload(row, template, trackingNumber, importedAt));
    }

    const incomingBatchNumbers = payloads
      .map((p) => getAnswerValue(p.productSampleAnswers, BATCH_NUMBER_FIELD_CODE));

    const existingDuplicates = await Submission.find({
      [`productSampleAnswers.${BATCH_NUMBER_FIELD_CODE}`]: { $in: incomingBatchNumbers },
    })
      .select(`productSampleAnswers.${BATCH_NUMBER_FIELD_CODE} trackingNumber`)
      .lean();

    const existingBatchNumbers = new Set(
      existingDuplicates.map((d) => normalizeMap(d.productSampleAnswers)[BATCH_NUMBER_FIELD_CODE])
    );

    const seenBatchNumbers = new Set();
    const filteredPayloads = payloads.filter((p) => {
      const batchNo = getAnswerValue(p.productSampleAnswers, BATCH_NUMBER_FIELD_CODE);
      if (existingBatchNumbers.has(batchNo) || seenBatchNumbers.has(batchNo)) {
        return false;
      }
      seenBatchNumbers.add(batchNo);
      return true;
    });

    if (!filteredPayloads.length) {
      res.status(409).json({ error: "All rows in this manifest already exist in the register (duplicate batch numbers)." });
      return;
    }

    const submissions = await Submission.insertMany(filteredPayloads, { ordered: true });

    res.status(201).json({
      importedCount: submissions.length,
      skippedCount: payloads.length - filteredPayloads.length,
      submissions: submissions.map((submission) => serializeSubmission(submission)),
    });
  } catch (error) {
    next(error);
  }
}

async function listSubmissions(req, res, next) {
  try {
    const { templateId = "", status = "", q = "" } = req.query;
    const clauses = [];

    if (templateId) {
      clauses.push({ templateId });
    }

    if (status) {
      const cleanStatus = `${status}`.toUpperCase();
      if (VALID_STATUSES.includes(cleanStatus)) {
        clauses.push({ status: cleanStatus });
      }
    }

    const searchFilter = buildSubmissionSearchFilter(q);
    if (searchFilter) {
      clauses.push(searchFilter);
    }

    const filters = clauses.length > 1 ? { $and: clauses } : clauses[0] || {};

    const submissions = await Submission.find(filters)
      .sort({ createdAt: -1 })
      .select(
        "trackingNumber templateId applicantName applicantPhone productName productSampleAnswers status createdAt updatedAt templateSnapshot.title napamsNumber reviewedBy labComment decisionRemark"
      )
      .lean();

    const mapped = submissions.map((item) => {
      const answers = normalizeMap(item.productSampleAnswers || {});

      return {
        id: item._id?.toString?.() || item._id,
        napamsNumber: `${item.napamsNumber || ""}`.trim(),
        trackingNumber: item.trackingNumber,
        templateId: item.templateId,
        templateTitle: item.templateSnapshot?.title || "",
        applicantName:
          getAnswerValue(answers, DISTRIBUTOR_FIELD_CODE) ||
          getAnswerValue(answers, SOURCE_FIELD_CODE) ||
          item.applicantName,
        applicantPhone: item.applicantPhone || "",
        productName: getAnswerValue(answers, BRAND_NAME_FIELD_CODE) || item.productName,
        genericName: getAnswerValue(answers, GENERIC_NAME_FIELD_CODE),
        dosageForm: getAnswerValue(answers, DOSAGE_FORM_FIELD_CODE),
        batchNumber: getAnswerValue(answers, BATCH_NUMBER_FIELD_CODE),
        status: item.status,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        manufacturer: getAnswerValue(answers, MANUFACTURER_FIELD_CODE),
        distributor:
          getAnswerValue(answers, DISTRIBUTOR_FIELD_CODE) ||
          getAnswerValue(answers, SOURCE_FIELD_CODE),
        reasonForAnalysis: getAnswerValue(answers, REASON_FOR_ANALYSIS_FIELD_CODE),
        matchScore: scoreSubmissionSearchMatch(item, q),
      };
    });

    if (`${q || ""}`.trim()) {
      mapped.sort((left, right) => {
        if (right.matchScore !== left.matchScore) {
          return right.matchScore - left.matchScore;
        }

        return new Date(right.updatedAt || 0).getTime() - new Date(left.updatedAt || 0).getTime();
      });
    }

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

    applyNapamsNumber(submission, req.body);
    submission.reviewedBy = `${req.body.reviewedBy || submission.reviewedBy || ""}`.trim();
    applyOfficerDetails(submission, req.body);
    applyMovementTracking(submission, req.body);
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
    applyNapamsNumber(submission, req.body);
    submission.reviewedBy = `${req.body.reviewedBy || submission.reviewedBy || ""}`.trim();
    applyOfficerDetails(submission, req.body);
    applyMovementTracking(submission, req.body);
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
      "NAPAMS Number": submission.napamsNumber || "",
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
      "Officer Name": submission.officerName || "",
      "Officer Designation": submission.officerDesignation || "",
      "Officer Phone": submission.officerPhone || "",
      "Officer Email": submission.officerEmail || "",
      "Consignment Size": submission.consignmentSize || "",
      "Retest Date": submission.retestDate || "",
      "Test Request No": submission.testRequestNo || "",
      "Test Parameters": submission.testParameters || "",
      "Date Sample Received": submission.sampleReceivedDate || "",
      "Date Taken To Lab": submission.takenToLabDate || "",
      "Date Lab Report Received": submission.labReportReceivedDate || "",
      "Lab Comment": submission.labComment || "",
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

    const workbook = XLSX.utils.book_new();
    const manifestRows = buildManifestExcelRows(submissions);
    const auditRows = buildAllSubmissionsExcelRows(submissions);

    const manifestWorksheet = XLSX.utils.json_to_sheet(
      manifestRows.length ? manifestRows : [Object.fromEntries(MANIFEST_EXPORT_COLUMNS.map((column) => [column.header, ""]))]
    );
    const auditWorksheet = XLSX.utils.json_to_sheet(
      auditRows.length ? auditRows : [{ Note: "No submissions available" }]
    );

    XLSX.utils.book_append_sheet(workbook, manifestWorksheet, "Manifest");
    XLSX.utils.book_append_sheet(workbook, auditWorksheet, "Admin Audit");

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
  importManifestRows,
  listSubmissions,
  getSubmissionById,
  updateDocumentsChecklist,
  updateSubmissionStatus,
  getExportPayload,
  exportAllSubmissionsToExcel,
};
