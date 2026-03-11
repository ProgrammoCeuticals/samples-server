const Template = require("../models/Template");
const { templates } = require("../data/templates");

async function seedTemplates() {
  for (const template of templates) {
    await Template.findOneAndUpdate(
      { templateId: template.templateId },
      { $set: template },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
}

module.exports = {
  seedTemplates,
};
