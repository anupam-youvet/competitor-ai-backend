const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    companyUrl: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    reportType: {
      type: String,
      enum: ["snapshot", "deep"],
    },
    snapshotSent: {
      type: Boolean,
      default: false,
    },
    pdfGenerated: {
      type: Boolean,
      default: false,
    },
    whatsappSent: {
      type: Boolean,
      default: false,
    },
    pdfUrl: {
      type: String,
    },
    messages: Array,
    snapshotData: Object,
  },
  {
    timestamps: true,
  }
);

leadSchema.index({ email: 1, companyUrl: 1 });
leadSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Lead", leadSchema);
