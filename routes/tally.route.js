const express = require("express");
const router = express.Router();
const TallyController = require("../controllers/tally.controller");

router.get("/ping",           TallyController.ping);
router.get("/companies",      TallyController.getCompanies);
router.get("/ledgers",        TallyController.getLedgers);
router.get("/invoices",       TallyController.getInvoices);
router.get("/invoices/:id",   TallyController.getInvoiceById);
router.post("/invoice",       TallyController.createInvoice);
router.delete("/invoices/:id",TallyController.deleteInvoice);

module.exports = router;