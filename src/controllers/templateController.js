const Template = require("../models/Template");
const { VALID_CHECK_VALUES, VALID_STATUSES } = require("../utils/constants");

function serializeTemplate(template) {
  if (!template) {
    return null;
  }

  return {
    ...template,
    id: template.templateId,
  };
}

async function getTemplates(req, res, next) {
  try {
    const templates = await Template.find({}).sort({ annexure: 1 }).lean();
    const serialized = templates.map(serializeTemplate);
    res.json({
      templates: serialized,
      validStatuses: VALID_STATUSES,
      validChecklistValues: VALID_CHECK_VALUES,
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
