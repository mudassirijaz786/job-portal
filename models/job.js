const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  noOfPositions: { type: String },
  city: { type: String },
  area: { type: String },
  yearsOfExperience: { type: String },
  salaryRange: { type: String },
  company_id: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
});

const Job = mongoose.model("Job", jobSchema);

exports.Job = Job;
