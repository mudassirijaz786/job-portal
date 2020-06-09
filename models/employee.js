const mongoose = require("mongoose");
const Joi = require("joi");

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: !true,
    default: "EMPLOYEE"
  }
});

function validateEmployee(emp) {
  const schema = {
    name: Joi.string()
      .min(2)
      .max(50)
      .required()
  };
  return Joi.validate(emp, schema);
}
const Employee = mongoose.model("employee", schema);

exports.Employee = Employee;
exports.validateEmployee = validateEmployee;
