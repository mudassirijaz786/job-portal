const mongoose = require("mongoose");
const Joi = require("joi");

const scehema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
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
  message: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  updated_at: { type: String },
});

scehema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});

const ContactUs = mongoose.model("ContactUsMessages", scehema);

validateContactUs = (contact) => {
  const phoneReg = /^((\+\d{1,3}(-| )?\(?\d\)?(-| )?\d{1,5})|(\(?\d{2,6}\)?))(-| )?(\d{3,4})(-| )?(\d{4})(( x| ext)\d{1,5}){0,1}$/;
  const schema = {
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    message: Joi.string().min(10).max(70).required(),
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
  return Joi.validate(contact, schema);
};

exports.ContactUs = ContactUs;
exports.validate = validateContactUs;
