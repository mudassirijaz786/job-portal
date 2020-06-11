const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
  },
  applied_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
  },
});

const JobsApplied = mongoose.model("JobApplied", schema);

exports.JobsApplied = JobsApplied;
