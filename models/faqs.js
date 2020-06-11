const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  question: { type: String },
  answer: { type: String },
});

const FAQs = mongoose.model("FAQs", schema);

exports.FAQs = FAQs;
