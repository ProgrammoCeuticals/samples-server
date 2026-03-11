const fs = require("fs");
const path = require("path");
const Template = require("../models/Template");
const { VALID_CHECK_VALUES, VALID_STATUSES } = require("../utils/constants");

const SAMPLING_GUIDE_PATH = path.resolve(__dirname, "../../../client/samplingguide.json");

function serializeTemplate(template) {
  if (!template) {
    return null;
  }

  return {
    ...template,
    id: template.templateId,
  };
}

function loadSamplingGuide() {
  try {
    const raw = fs.readFileSync(SAMPLING_GUIDE_PATH, "utf8");
    const parsed = JSON.parse(raw);

    if (!parsed || !Array.isArray(parsed.products)) {
      return { products: [] };
    }

    return parsed;
  } catch (error) {
    return { products: [] };
  }
}

async function getTemplates(req, res, next) {
  try {
    const templates = await Template.find({}).sort({ annexure: 1 }).lean();
    const serialized = templates.map(serializeTemplate);
    res.json({
      templates: serialized,
      validStatuses: VALID_STATUSES,
      validChecklistValues: VALID_CHECK_VALUES,
      samplingGuide: loadSamplingGuide(),
    });
  } catch (error) {
    next(error);
  }
}

async function getTemplateById(req, res, next) {
  try {
    const template = await Template.findOne({ templateId: req.params.templateId }).lean();

    if (!template) {
      res.status(404).json({ error: "Template not found" });
      return;
    }

    res.json(serializeTemplate(template));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTemplates,
  getTemplateById,
};
