const express = require("express");
const { requireAdminAuth } = require("../middleware/requireAdminAuth");
const {
  createSubmission,
  listSubmissions,
  getSubmissionById,
  updateDocumentsChecklist,
  updateSubmissionStatus,
  getExportPayload,
  exportAllSubmissionsToExcel,
} = require("../controllers/submissionController");

const router = express.Router();

router.post("/", createSubmission);

router.use(requireAdminAuth);

router.get("/export/all.xlsx", exportAllSubmissionsToExcel);
router.get("/", listSubmissions);
router.get("/:id/export", getExportPayload);
router.get("/:id", getSubmissionById);
router.patch("/:id/documents", updateDocumentsChecklist);
router.patch("/:id/status", updateSubmissionStatus);

module.exports = router;
