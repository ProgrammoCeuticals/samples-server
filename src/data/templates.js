const productSampleItems = [
  {
    code: "product_expiration_date",
    serialNumber: 1,
    label: "PRODUCT EXPIRATION DATE NOT LESS THAN 6 MONTHS FROM DATE OF SUBMISSION",
    inputType: "date",
    required: true,
  },
  {
    code: "number_of_products",
    serialNumber: 2,
    label: "NUMBER OF PRODUCTS IN ACCORDANCE WITH LABORATORY SAMPLING GUIDE",
    inputType: "number",
    required: true,
  },
  {
    code: "product_batch_lot_number",
    serialNumber: 3,
    label: "PRODUCT BATCH/LOT NUMBER",
    inputType: "text",
    required: true,
  },
  {
    code: "product_name",
    serialNumber: 4,
    label: "PRODUCT NAME",
    inputType: "text",
    required: true,
  },
  {
    code: "manufacturer_name_address",
    serialNumber: 5,
    label: "NAME AND ADDRESS OF THE MANUFACTURER",
    inputType: "textarea",
    required: true,
  },
  {
    code: "nafdac_reg_no_provision",
    serialNumber: 6,
    label: "PROVISION FOR NAFDAC REG. NO",
    inputType: "text",
    required: true,
  },
];

const templates = [
  {
    templateId: "new_registration",
    annexure: "ANNEXURE -1",
    sopRef: "DR&RA-160-06",
    title: "CHECKLIST FOR RECEIVING OF LABORATORY SAMPLES FOR NEW REGISTRATION",
    directorate: "Drug Registration and Regulatory Affairs Directorate",
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
    productSample: productSampleItems,
  },
  {
    templateId: "renewal",
    annexure: "ANNEXURE -2",
    sopRef: "DR&RA-163-05",
    title: "CHECKLIST FOR RECEIVING OF LABORATORY SAMPLES FOR RENEWAL PROCESSING",
    directorate: "Drug Registration and Regulatory Affairs Directorate",
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
    productSample: productSampleItems,
  },
  {
    templateId: "variation",
    annexure: "ANNEXURE -3",
    sopRef: "DR&RA-162-03",
    title: "CHECKLIST FOR RECEIVING OF LABORATORY SAMPLES FOR VARIATION REGISTRATION",
    directorate: "Drug Registration and Regulatory Affairs Directorate",
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
    productSample: productSampleItems,
  },
];

module.exports = {
  templates,
};
