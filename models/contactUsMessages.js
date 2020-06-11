const mongoose = require("mongoose");

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

exports.ContactUs = ContactUs;
