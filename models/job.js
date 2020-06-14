const mongoose = require("mongoose");
const Joi = require("joi");

const jobSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  noOfPositions: { type: String },
  city: { type: String },
  area: { type: String },
  yearsOfExperience: { type: String },
  salaryRange: { type: String },
  company_id: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  applied_by: [
    { employee_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" } },
  ],
});

const Job = mongoose.model("Job", jobSchema);

validateJob = (company) => {
  const schema = {
    title: Joi.string().min(5).max(50).required(),
    city: Joi.string().min(5).max(50).required(),
    area: Joi.string().min(5).max(50).required(),
    description: Joi.string().min(10).max(100).required(),
    noOfPositions: Joi.string().required(),
    yearsOfExperience: Joi.string().required(),
    salaryRange: Joi.string().required(),
    company_id: Joi.objectId(),
  };

  return Joi.validate(company, schema);
};

exports.Job = Job;
exports.validate = validateJob;
