const mongoose = require("mongoose");

// :TODO: city and area adding and removal of location
const jobSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  noOfPositions: { type: String },
  location: { type: String },
  yearsOfExperience: { type: String },
  salaryRange: { type: String },
  company_id: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
});

const Job = mongoose.model("Job", jobSchema);

exports.Job = Job;
