const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");

// company schema
const companyProfileSchema = new mongoose.Schema({
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
  },
  ceo: {
    type: String,
  },
  address: {
    type: String,
  },

  city: {
    type: String,
  },
  description: {
    type: String,
  },
  url: {
    type: String,
  },
  noOfEmployees: {
    type: String,
  },
  verified: {
    type: Boolean,
    // required: true,
    default: false,
  },
});

// CompanyProfile model
const CompanyProfile = mongoose.model("CompanyProfile", companyProfileSchema);

validateCompanyProfile = (companyProfile) => {
  const schema = {
    company_id: Joi.objectId(),
    ceo: Joi.string().min(5).max(50).required(),
    address: Joi.string().min(5).max(50).required(),
    city: Joi.string().min(5).max(10).required(),
    description: Joi.string().min(10).max(100).required(),
    url: Joi.string().required(),
    noOfEmployees: Joi.string(),
  };

  return Joi.validate(companyProfile, schema);
};

exports.CompanyProfile = CompanyProfile;
exports.validate = validateCompanyProfile;
