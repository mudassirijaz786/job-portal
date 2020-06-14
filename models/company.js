const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");

// company schema
const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  blocked: {
    type: Boolean,
    required: true,
    default: false,
  },
  emailVerified: {
    type: Boolean,
    required: true,
    default: false,
  },
  accountVerified: {
    type: Boolean,
    default: false,
  },
});

// token generation
companySchema.methods.generateAuthToken = function () {
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
  const phoneReg = /^((\+\d{1,3}(-| )?\(?\d\)?(-| )?\d{1,5})|(\(?\d{2,6}\)?))(-| )?(\d{3,4})(-| )?(\d{4})(( x| ext)\d{1,5}){0,1}$/;
  const schema = {
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().alphanum().min(8).max(32).required(),
    phoneNumber: Joi.string()
      .regex(RegExp(phoneReg))
      .required()
      .options({
        language: {
          string: {
            regex: {
              base: "must be a valid phone number",
            },
          },
        },
      }),
  };

  return Joi.validate(company, schema);
};

exports.Company = Company;
exports.validate = validateCompany;
