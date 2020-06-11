const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const _ = require("lodash");
const express = require("express");
const { Company } = require("../models/company");
const router = express.Router();
const Joi = require("joi");

// getting current company
router.get("/:id", auth, async (req, res) => {
  const company = await Company.findById(req.params.id).select("-password");
  res.json({ currentCompany: company });
});

// login
router.post("/login", async (req, res) => {
  let company = await Company.findOne({ email: req.body.email });
  if (!company)
    return res.status(400).json({ error: "Invalid email or password." });

  const validPassword = await bcrypt.compare(
    req.body.password,
    company.password
  );
  if (!validPassword)
    return res.status(400).json({ error: "Invalid email or password." });

  const token = company.generateAuthToken();
  res.json({ token });
});

// register
router.post("/register", async (req, res) => {
  let company = await Company.findOne({ email: req.body.email });
  if (company)
    return res.status(400).json({
      error: `Company with email ${req.body.email} is already registered`,
    });

  company = new Company(
    _.pick(req.body, [
      "name",
      "ceo",
      "address",
      "password",
      "city",
      "description",
      "email",
      "phoneNumber",
      "url",
      "noOfEmployees",
    ])
  );

  const salt = await bcrypt.genSalt(10);
  company.password = await bcrypt.hash(company.password, salt);
  await company.save();

  const token = company.generateAuthToken();

  res.header("x-auth-token", token).json({ token });
});

// new password after resetting
router.post("/resetPassword/newPassword", async (req, res) => {
  const companyId = await Company.findById(req.body._id);
  if (!companyId) {
    res.status(400).json({ message: "Invalid id" });
  } else {
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.newPassword, salt);
    const company = await Company.findByIdAndUpdate(
      req.body._id,
      {
        $set: {
          password,
        },
      },
      { new: true }
    );
    const token = company.generateAuthToken();
    res.json({ token });
  }
});

// sending email on password reset
router.post("/resetPassword/sendEmail", async (req, res) => {
  const email = req.body.email;
  const company = await Company.findOne({ email });
  if (!company) {
    res.status(400).json({ message: "Invalid email" });
  } else {
    sendEmailForResetPassword(
      email,
      "Reset Your password",
      "follow the link to generate code ",
      company._id
    );
  }
  res.json({ message: "An email with the link has been forwarded to you.." });
});

module.exports = router;
