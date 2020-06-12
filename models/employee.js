const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");

// employee schema
const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024,
  },
});

// token generation
employeeSchema.methods.generateAuthToken = () => {
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

// employee model
const Employee = mongoose.model("Employee", employeeSchema);

validateEmployee = (employee) => {
  const phoneReg = /^((\+\d{1,3}(-| )?\(?\d\)?(-| )?\d{1,5})|(\(?\d{2,6}\)?))(-| )?(\d{3,4})(-| )?(\d{4})(( x| ext)\d{1,5}){0,1}$/;
  const schema = {
    name: Joi.string().min(2).max(50).required(),
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

  return Joi.validate(employee, schema);
};

exports.Employee = Employee;
exports.validate = validateEmployee;
