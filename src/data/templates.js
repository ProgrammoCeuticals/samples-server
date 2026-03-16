const DRUG_FIXED_DEFAULTS = {
  source: "R&RD",
  pharmacopoeia: "Dossier",
  storage_condition: "AMBIENT(NOT MORE THAN 30°C)",
  required_test: "Monograph test",
  category: "Drugs",
  port_of_entry: "N/A",
};

const REASON_FOR_ANALYSIS_BY_TEMPLATE = {
  new_registration: "New Registration",
  renewal: "Renewal",
  variation: "Variation",
};

function buildProductSampleItems(templateId) {
  const reasonForAnalysis = REASON_FOR_ANALYSIS_BY_TEMPLATE[templateId] || "";

  return [
    {
      code: "brand_name",
      serialNumber: 1,
      label: "BRAND NAME",
      inputType: "text",
      required: true,
    },
    {
      code: "generic_name",
      serialNumber: 2,
      label: "GENERIC NAME",
      inputType: "text",
      required: true,
    },
    {
      code: "product_class",
      serialNumber: 3,
      label: "PRODUCT CLASS",
      inputType: "text",
      required: true,
    },
    {
      code: "napams_number",
      serialNumber: 4,
      label: "NAPAMS NUMBER",
      inputType: "text",
      required: true,
    },
    {
      code: "nafdac_no",
      serialNumber: 5,
      label: "NAFDAC NO",
      inputType: "text",
      required: false,
    },
    {
      code: "dosage_form",
      serialNumber: 6,
      label: "DOSAGE FORM",
      inputType: "text",
      required: true,
    },
    {
      code: "strength",
      serialNumber: 7,
      label: "STRENGTH",
      inputType: "text",
      required: true,
    },
    {
      code: "pack_size",
      serialNumber: 8,
      label: "PACK SIZE",
      inputType: "text",
      required: true,
    },
    {
      code: "manufacturing_date",
      serialNumber: 9,
      label: "MANUF. DATE",
      inputType: "date",
      required: true,
    },
    {
      code: "expiry_date",
      serialNumber: 10,
      label: "EXPIRY DATE",
      inputType: "date",
      required: true,
    },
    {
      code: "batch_no",
      serialNumber: 11,
      label: "BATCH NO",
      inputType: "text",
      required: true,
    },
    {
      code: "source",
      serialNumber: 12,
      label: "SOURCE",
      inputType: "text",
      required: true,
      defaultValue: DRUG_FIXED_DEFAULTS.source,
      readOnly: true,
    },
    {
      code: "distributor",
      serialNumber: 13,
      label: "DISTRIBUTOR",
      inputType: "text",
      required: true,
    },
    {
      code: "quantity",
      serialNumber: 14,
      label: "QUANTITY",
      inputType: "number",
      required: true,
    },
    {
      code: "manufacturer",
      serialNumber: 15,
      label: "MANUFACTURER",
      inputType: "text",
      required: true,
    },
    {
      code: "sampling_date",
      serialNumber: 16,
      label: "SAMPLING DATE",
      inputType: "date",
      required: true,
    },
    {
      code: "pharmacopoeia",
      serialNumber: 17,
      label: "PHARMACOPOEIA",
      inputType: "text",
      required: true,
      defaultValue: DRUG_FIXED_DEFAULTS.pharmacopoeia,
      readOnly: true,
    },
    {
      code: "storage_condition",
      serialNumber: 18,
      label: "STORAGE CONDITION",
      inputType: "text",
      required: true,
      defaultValue: DRUG_FIXED_DEFAULTS.storage_condition,
      readOnly: true,
    },
    {
      code: "reason_for_analysis",
      serialNumber: 19,
      label: "REASON FOR ANALYSIS",
      inputType: "text",
      required: true,
      defaultValue: reasonForAnalysis,
      readOnly: true,
    },
    {
      code: "required_test",
      serialNumber: 20,
      label: "REQUIRED TEST",
      inputType: "text",
      required: true,
      defaultValue: DRUG_FIXED_DEFAULTS.required_test,
      readOnly: true,
    },
    {
      code: "category",
      serialNumber: 21,
      label: "CATEGORY",
      inputType: "text",
      required: true,
      defaultValue: DRUG_FIXED_DEFAULTS.category,
      readOnly: true,
    },
    {
      code: "physical_description",
      serialNumber: 22,
      label: "PHYSICAL DESCRIPTION",
      inputType: "textarea",
      required: true,
    },
    {
      code: "country_of_origin",
      serialNumber: 23,
      label: "COUNTRY OF ORIGIN",
      inputType: "text",
      required: true,
    },
    {
      code: "port_of_entry",
      serialNumber: 24,
      label: "PORT OF ENTRY",
      inputType: "text",
      required: true,
      defaultValue: DRUG_FIXED_DEFAULTS.port_of_entry,
      readOnly: true,
    },
    {
      code: "risk_factor",
      serialNumber: 25,
      label: "RISK FACTOR",
      inputType: "text",
      required: true,
    },
  ];
}

function createTemplate({
  templateId,
  annexure,
  sopRef,
  title,
  documentsRequired,
}) {
  return {
    templateId,
    annexure,
    sopRef,
    title,
    directorate: "Drug Registration and Regulatory Affairs Directorate",
    documentsRequired,
    productSample: buildProductSampleItems(templateId),
  };
}

const templates = [
  createTemplate({
    templateId: "new_registration",
    annexure: "ANNEXURE -1",
    sopRef: "DR&RA-160-06",
    title: "CHECKLIST FOR RECEIVING OF LABORATORY SAMPLES FOR NEW REGISTRATION",
    documentsRequired: [
      {
        code: "application_letter",
        serialNumber: 1,
        label: "APPLICATION LETTER TO NAFDAC",
      },
      {
        code: "dossier_copy_cd",
        serialNumber: 2,
        label: "A COPY OF DOSSIER OF THE PRODUCT IN CD FORMAT.",
      },
      {
        code: "payment_receipt",
        serialNumber: 3,
        label: "A COPY OF PAYMENT RECEIPT FOR PROCESSING AND NOTIFICATION OF PRODUCT.",
      },
      {
        code: "import_permit",
        serialNumber: 4,
        label: "A COPY OF IMPORT PERMIT ISSUED BY NAFDAC.",
      },
      {
        code: "certificate_of_analysis",
        serialNumber: 5,
        label: "A COPY OF PRODUCT CERTIFICATE OF ANALYSIS",
      },
    ],
  }),
  createTemplate({
    templateId: "renewal",
    annexure: "ANNEXURE -2",
    sopRef: "DR&RA-163-05",
    title: "CHECKLIST FOR RECEIVING OF LABORATORY SAMPLES FOR RENEWAL PROCESSING",
    documentsRequired: [
      {
        code: "application_letter",
        serialNumber: 1,
        label: "APPLICATION LETTER TO NAFDAC",
      },
      {
        code: "dossier_copy_cd",
        serialNumber: 2,
        label: "A COPY OF DOSSIER OF THE PRODUCT IN CD FORMAT.",
      },
      {
        code: "payment_receipt",
        serialNumber: 3,
        label: "A COPY OF PAYMENT RECEIPT FOR RENEWAL OF PRODUCT.",
      },
      {
        code: "notice_of_renewal",
        serialNumber: 4,
        label: "A COPY OF NOTICE OF RENEWAL (NOR) ISSUED BY NAFDAC.",
      },
      {
        code: "certificate_of_analysis",
        serialNumber: 5,
        label: "A COPY OF PRODUCT CERTIFICATE OF ANALYSIS",
      },
    ],
  }),
  createTemplate({
    templateId: "variation",
    annexure: "ANNEXURE -3",
    sopRef: "DR&RA-162-03",
    title: "CHECKLIST FOR RECEIVING OF LABORATORY SAMPLES FOR VARIATION REGISTRATION",
    documentsRequired: [
      {
        code: "application_letter",
        serialNumber: 1,
        label: "APPLICATION LETTER TO NAFDAC",
      },
      {
        code: "dossier_copy_cd",
        serialNumber: 2,
        label: "A COPY OF DOSSIER OF THE PRODUCT IN CD FORMAT",
      },
      {
        code: "payment_receipt",
        serialNumber: 3,
        label: "A COPY OF PAYMENT RECEIPT FOR PROCESSING OF PRODUCT",
      },
      {
        code: "import_permit",
        serialNumber: 4,
        label: "A COPY OF IMPORT PERMIT ISSUED BY NAFDAC",
      },
      {
        code: "certificate_of_analysis",
        serialNumber: 5,
        label: "A COPY OF PRODUCT CERTIFICATE OF ANALYSIS",
      },
    ],
  }),
];

module.exports = {
  templates,
};
