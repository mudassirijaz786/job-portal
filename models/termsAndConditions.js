const mongoose = require("mongoose");
const Joi = require("joi");

const schema = new mongoose.Schema({
  description: { type: String },
});

const TAC = mongoose.model("TAC", schema);

validateTAC = (tac) => {
  const schema = {
    description: Joi.string().required().max(300),
  };
  return Joi.validate(tac, schema);
};

exports.TAC = TAC;
exports.validate = validateTAC;
