const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");

// company schema
const companySchema = new mongoose.Schema({
  name: {
    type: String,
  },
  ceo: {
    type: String,
  },
  address: {
    type: String,
  },
  password: {
    type: String,
  },
  city: {
    type: String,
  },
  description: {
    type: String,
  },
  email: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  url: {
    type: String,
  },
  noOfEmployees: {
    type: String,
    unique: true,
  },
  verified: {
    type: Boolean,
    required: true,
    default: false,
  },
});

// token generation
companySchema.methods.generateAuthToken = () => {
  const token = jwt.sign(
    {
      _id: this._id,
      name: this.name,
      email: this.email,
    },
    config.get("jwtPrivateKey")
  );
  return token;
};

// company model
const Company = mongoose.model("Company", companySchema);

validateCompany = (company) => {
  const schema = {
    // all validations goes here
  };

  return Joi.validate(company, schema);
};

exports.Company = Company;
exports.validate = validateCompany;
