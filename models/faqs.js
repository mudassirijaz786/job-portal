const mongoose = require("mongoose");
const Joi = require("joi");

const schema = new mongoose.Schema({
  question: { type: String },
  answer: { type: String },
});

const FAQs = mongoose.model("FAQs", schema);

validateFAQ = (faq) => {
  const schema = {
    question: Joi.string().min(10).max(80).required(),
    answer: Joi.string().min(10).max(80).required(),
  };
  return Joi.validate(faq, schema);
};

exports.FAQs = FAQs;
exports.validate = validateFAQ;
