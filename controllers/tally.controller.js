"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");
const tallyService = require("../services/tally.services.js");

// ─── GET /api/v1/tally/ping ───────────────────────────────────────────
var ping = async (req, res) => {
  try {
    await tallyService.getCompanies();
    return ReS(res, {
      status: "connected",
      message: "TallyPrime is reachable ✅",
    }, 200);
  } catch (err) {
    return ReE(res, "Cannot reach TallyPrime. Make sure it is running on EC2 with port 9000 enabled.", 503);
  }
};
module.exports.ping = ping;

// ─── GET /api/v1/tally/companies ─────────────────────────────────────
var getCompanies = async (req, res) => {
  try {
    const result = await tallyService.getCompanies();
    return ReS(res, { success: true, data: result.parsed }, 200);
  } catch (err) {
    return ReE(res, err.message, 500);
  }
};
module.exports.getCompanies = getCompanies;

// ─── GET /api/v1/tally/ledgers ───────────────────────────────────────
var getLedgers = async (req, res) => {
  try {
    const result = await tallyService.getLedgers();
    return ReS(res, { success: true, data: result.parsed }, 200);
  } catch (err) {
    return ReE(res, err.message, 500);
  }
};
module.exports.getLedgers = getLedgers;

// ─── GET /api/v1/tally/invoices ──────────────────────────────────────
var getInvoices = async (req, res) => {
  try {
    const invoices = await model.Invoice.findAll({
      where: { isDeleted: false },
      order: [["createdAt", "DESC"]],
    });
    return ReS(res, { success: true, count: invoices.length, data: invoices }, 200);
  } catch (err) {
    return ReE(res, err.message, 500);
  }
};
module.exports.getInvoices = getInvoices;

// ─── GET /api/v1/tally/invoices/:id ─────────────────────────────────
var getInvoiceById = async (req, res) => {
  try {
    const invoice = await model.Invoice.findOne({
      where: { id: req.params.id, isDeleted: false },
    });
    if (!invoice) return ReE(res, "Invoice not found", 404);
    return ReS(res, { success: true, data: invoice }, 200);
  } catch (err) {
    return ReE(res, err.message, 500);
  }
};
module.exports.getInvoiceById = getInvoiceById;

// ─── POST /api/v1/tally/invoice ──────────────────────────────────────
var createInvoice = async (req, res) => {
  const { date, voucherNumber, partyLedger, salesLedger, totalAmount, narration } = req.body;

  if (!date || !voucherNumber || !partyLedger || !salesLedger || !totalAmount) {
    return ReE(res, {
      error: "Missing required fields",
      required: ["date", "voucherNumber", "partyLedger", "salesLedger", "totalAmount"],
      example: {
        date: "20250312",
        voucherNumber: "INV-001",
        partyLedger: "ABC Customer",
        salesLedger: "Sales Account",
        narration: "Test invoice",
        totalAmount: 5000,
      },
    }, 400);
  }

  // Save to DB first as pending
  let invoice;
  try {
    invoice = await model.Invoice.create({
      date, voucherNumber, partyLedger,
      salesLedger, narration, totalAmount,
      tallyStatus: "pending",
    });
  } catch (dbErr) {
    return ReE(res, `DB error: ${dbErr.message}`, 500);
  }

  // Send to Tally
  try {
    const result = await tallyService.createSalesInvoice(req.body);

    await invoice.update({
      tallyStatus: result.invoiceCreated ? "success" : "failed",
      tallyResponse: result.raw,
    });

    if (result.invoiceCreated) {
      return ReS(res, {
        success: true,
        message: `Invoice ${voucherNumber} created in TallyPrime ✅`,
        invoiceId: invoice.id,
        savedToDb: true,
      }, 201);
    } else {
      return ReE(res, {
        message: "Tally processed but invoice may not have been created. Check ledger names match exactly.",
        invoiceId: invoice.id,
        tallyResponse: result.raw,
      }, 422);
    }
  } catch (tallyErr) {
    await invoice.update({ tallyStatus: "failed", tallyResponse: tallyErr.message });
    return ReE(res, tallyErr.message, 500);
  }
};
module.exports.createInvoice = createInvoice;

// ─── DELETE /api/v1/tally/invoices/:id ──────────────────────────────
var deleteInvoice = async (req, res) => {
  try {
    const invoice = await model.Invoice.findByPk(req.params.id);
    if (!invoice) return ReE(res, "Invoice not found", 404);

    await invoice.update({ isDeleted: true });
    return ReS(res, { success: true, message: "Invoice deleted" }, 200);
  } catch (err) {
    return ReE(res, err.message, 500);
  }
};
module.exports.deleteInvoice = deleteInvoice;