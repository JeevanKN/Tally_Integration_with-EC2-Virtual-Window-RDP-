"use strict";
module.exports = (sequelize, Sequelize) => {
  const Invoice = sequelize.define(
    "Invoice",
    {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      voucherNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      date: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      partyLedger: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      salesLedger: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      narration: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      totalAmount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      tallyStatus: {
        type: Sequelize.STRING,
        defaultValue: "pending", // pending | success | failed
      },
      tallyResponse: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    },
    {
      tableName: "invoices",
      timestamps: true,
    }
  );

  // Add associations here if needed later
  // Invoice.associate = function (models) { ... };

  return Invoice;
};