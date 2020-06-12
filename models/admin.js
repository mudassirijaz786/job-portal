const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");

// admin schema
const adminSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  password: {
    type: String,
  },
  email: {
    type: String,
  },
});

// token generation
adminSchema.methods.generateAuthToken = () => {
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

// admin model
const Admin = mongoose.model("Admin", adminSchema);

validateAdmin = (admin) => {
  const passwordReg = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  const schema = {
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string()
      .regex(RegExp(passwordReg))
      .required()
      .options({
        language: {
          string: {
            regex: {
              base:
                "must contains 8 digits, one lower case, one upper case and one special character",
            },
          },
        },
      }),
  };
  return Joi.validate(admin, schema);
};

exports.Admin = Admin;
exports.validate = validateAdmin;
