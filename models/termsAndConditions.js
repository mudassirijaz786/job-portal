const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  description: { type: String },
});

const TAC = mongoose.model("TAC", schema);

exports.TAC = TAC;
