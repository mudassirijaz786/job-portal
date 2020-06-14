const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const _ = require("lodash");
const express = require("express");
const { Company, validate } = require("../models/company");

const sendEmailVerificationCode = require("../utils/emailService");
const sendNotification = require("../utils/emailService");
const router = express.Router();
const Joi = require("joi");
// :TODO: delete krna hai isy

router.get("/deleteALL", async (req, res) => {
  const company = await Company.find();
  res.send(company);
  company.forEach(async (c) => {
    await Company.findByIdAndRemove(c._id);
  });
  res.send("all deleted");
});
/**
 * @swagger
 * tags:
 *   name: Company
 *   description: Company management
 */
// getting current company
/**
 * @swagger
 * /api/company:
 *  get:
 *    description: Use to request all companys
 *    summary:  Use to request all companys
 *    tags: [Company]
 *    parameters:
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token (JWT).
 *    responses:
 *      '200':
 *        description: A successful response containg all companys in JSON
 *      '400':
 *        description: message in json format indicating  not found!
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.get("/", auth, async (req, res) => {
  const companies = await Company.find().select("-password");
  res.json({ data: companies });
});
/**
 * @swagger
 * /api/company/me/{id}:
 *  get:
 *    description: Use to request a single company
 *    summary:  Use to request a single company
 *    tags: [Company]
 *    parameters:
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token containg iscompany field in JWT.
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: Object ID of the company to get.
 *    responses:
 *      '200':
 *        description: A successful response containg all companys in JSON
 *      '400':
 *        description: message in json format indicating  not found!
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.get("/me/:id", auth, async (req, res) => {
  const company = await Company.findById(req.params.id).select("-password");
  if (company) {
    res.json({ data: company });
  } else {
    res.status(400).json({ message: "Not Found!" });
  }
});

// login
/**
 * @swagger
 * /api/company/login:
 *  post:
 *    description: use to login company into the system
 *    summary: login company into the system using email and password.
 *    tags: [Company]
 *    parameters:
 *    - in: body
 *      name: user
 *      description: The user to login.
 *      schema:
 *        type: object
 *        required:
 *        - email
 *        - password
 *        properties:
 *          email:
 *            type: string
 *          password:
 *            type: string
 *    responses:
 *      '200':
 *        description: jwt token for that particular user loged in.
 *      '400':
 *        description: message in json format Invalid email or password.
 */
router.post("/login", async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) return res.status(400).send(error.details[0].message);

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
/**
 * @swagger
 * /api/company/register:
 *  post:
 *    description: use to resister company into the system
 *    summary: use to resister company into the system.
 *    tags: [Company]
 *    parameters:
 *    - in: body
 *      name: user
 *      description: The user to login.
 *      schema:
 *        type: object
 *        required:
 *        - email
 *        - password
 *        - name
 *        - phoneNumber
 *        properties:
 *          name:
 *            type: string
 *          email:
 *            type: string
 *          password:
 *            type: string
 *          phoneNumber:
 *            type: string
 *    responses:
 *      '200':
 *        description: jwt token for that particular  new company.
 *      '400':
 *        description: message in json format indicating company with email already exists.
 */
router.post("/register", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let company = await Company.findOne({ email: req.body.email });
  if (company)
    return res.status(400).json({
      error: `Company with email ${req.body.email} is already registered`,
    });

  company = new Company(
    _.pick(req.body, ["name", "password", "email", "phoneNumber"])
  );

  const salt = await bcrypt.genSalt(10);
  company.password = await bcrypt.hash(company.password, salt);
  await company.save();

  const token = company.generateAuthToken();

  res.header("x-auth-token", token).json({ token });
});

// new password after resetting
/**
 * @swagger
 * /api/company/resetPassword/newPassword:
 *  post:
 *    description: use to reset the password after clicked on the link
 *    summary: use to reset the password after clicked on the link
 *    tags: [Company]
 *    parameters:
 *    - in: body
 *      name: user
 *      description: user details.
 *      schema:
 *        type: object
 *        required:
 *        - _id
 *        - newPassword
 *        properties:
 *          _id:
 *            type: string
 *          newPassword:
 *            type: string
 *    responses:
 *      '200':
 *        description: jwt token for that particular emoloyee.
 *      '400':
 *        description: message in json format indicating Invalid id.
 */
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
    res.json({
      message: "password has been updated successfully",
      data: token,
    });
  }
});

// sending email on password reset
/**
 * @swagger
 * /api/company/resetPassword/sendEmail:
 *  post:
 *    description: use to sending email on password reset
 *    summary: use to sending email on password reset
 *    tags: [Company]
 *    parameters:
 *    - in: body
 *      name: user
 *      description: To send link for reset password on the email.
 *      schema:
 *        type: object
 *        required:
 *        - email
 *        properties:
 *         email:
 *            type: string
 *    responses:
 *      '200':
 *        description: message in json formet indicating An email with the link has been forwarded to you.
 *      '400':
 *        description: message in json format indicating Invalid email.
 */
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

// TODO: testing. put nae chal ra tha idr depresion error ara tha ma post lga dia ha .
// FIXME: subject is not defined ReferenceError: subject is not defined in sendNotification waly main
/**
 * @swagger
 * /api/company/sendEmailVerificationCode/:
 *  post:
 *    description: use to send Email Verification Code
 *    summary: use to send Email Verification Code
 *    tags: [Company]
 *    parameters:
 *    - in: body
 *      name: company
 *      description: To send Email Verification Code
 *      schema:
 *        type: object
 *        required:
 *        - email
 *        - code
 *        properties:
 *         email:
 *            type: string
 *         code:
 *            type: string
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      requiaccountVerifiedred: true
 *      description: jwt token containg JWT.
 *    responses:
 *      '200':
 *        description: message in json formet A code has been sent to your mail
 *      '400':
 *        description: message in json format indicating Invalid email
 */
router.post("/sendEmailVerificationCode", auth, async (req, res) => {
  const { code } = req.body;
  const { email } = req.body;
  try {
    sendEmailVerificationCode(email, code);
    res.json({ message: "A code has been sent to your mail ." });
  } catch (error) {
    res.status(401).json({ message: "Invalid email" });
  }
});

/**
 * @swagger
 * /api/company/verifyEmail/{id}:
 *  post:
 *    description: use to verify company account
 *    summary: use to verify a company account, admin can do it
 *    tags: [Company]
 *    parameters:
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: company_id which is use to delete an employee
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      requiaccountVerifiedred: true
 *      description: jwt token containg JWT.
 *    responses:
 *      '200':
 *        description: message in json formet containing company account is verified
 *      '400':
 *        description: message in json format indicating not found as an empty array
 */

router.post("/verifyEmail/:id", auth, async (req, res) => {
  const company = await Company.findById({ _id: req.params.id });
  await Company.updateOne(
    { _id: req.params.id },
    {
      $set: {
        emailVerified: true,
      },
    },
    { new: true }
  );
  res.json({
    message: `${company.name}'s Email has been verified successfully`,
  });
});

// TODO: testing. put nae chal ra tha idr depresion error ara tha ma post lga dia ha ...
// FIXME: subject is not defined ReferenceError: subject is not defined in sendNotification waly main
/**
 * @swagger
 * /api/company/verifyAccount/{id}:
 *  post:
 *    description: use to verify company account
 *    summary: use to verify a company account, admin can do it
 *    tags: [Company]
 *    parameters:
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: company_id which is use to verify a company account
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token containg JWT.
 *    responses:
 *      '200':
 *        description: message in json formet containing company account is verified
 *      '400':
 *        description: message in json format indicating not found as an empty array
 */

router.post("/verifyAccount/:id", admin, async (req, res) => {
  const company = await Company.findById({ _id: req.params.id });
  await Company.updateOne(
    { _id: req.params.id },
    {
      $set: {
        accountVerified: true,
      },
    },
    { new: true }
  );
  sendNotification(
    company.email,
    "Your account has been successfully  verified",
    "Your account has been successfully  verified"
  );
  res.json({
    message: `${company.name}'s The acount has been successfully verified`,
  });
});

/**
 * @swagger
 * /api/company/companyBlocking/{id}:
 *  post:
 *    description: use to block an company
 *    summary: use to block a company, admin can do it
 *    tags: [Company]
 *    parameters:
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: company_id which is use to delete an employee
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token containg JWT.
 *    responses:
 *      '200':
 *        description: message in json formet containing company is blocked
 *      '400':
 *        description: message in json format indicating not found as an empty array
 */
router.post("/companyBlocking/:id", auth, async (req, res) => {
  const company = await Company.findById({ _id: req.params.id });
  await Company.updateOne(
    { _id: req.params.id },
    { $set: { blocked: true } },
    { new: true }
  );

  res.json({ message: `${company.name} is blocked` });
});

/**
 * @swagger
 * /api/company/companyRemove/{id}:
 *  delete:
 *    description: use to delete a company
 *    summary: use to delete an company
 *    tags: [Company]
 *    parameters:
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: Object ID of the company to delete
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token containg JWT.
 *    responses:
 *      '200':
 *        description: message in json formet indicating the company has been deleted.
 *      '400':
 *        description: message in json format indicating company not found
 */

router.delete("/companyRemove/:id", auth, async (req, res) => {
  const company = await Company.findByIdAndRemove(req.params.id);
  if (!company) {
    return res.status(400).json({ error: "company not found" });
  } else {
    res.json({ message: "company has been deleted successfully" });
  }
});

// searching a company
/**
 * @swagger
 * /api/company/searchCompany/{id}:
 *  get:
 *    description: use to search an company
 *    summary: use to search an company by name
 *    tags: [Company]
 *    parameters:
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: name which is use to search a company
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token containg JWT.
 *    responses:
 *      '200':
 *        description: message in json formet containing company matched with query
 *      '400':
 *        description: message in json format indicating not found as an empty array
 */

router.get("/searchCompany/:id", async (req, res) => {
  const companies = await Company.find();
  const query = req.params.id.toLowerCase();
  var foundedCompanies = [];
  companies.forEach((company) => {
    if (company.name.toLowerCase().includes(query)) {
      foundedCompanies.push(company);
    }
  });
  res.json({ data: foundedCompanies });
});

// function to validate login params
validateLogin = (req) => {
  const schema = {
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().alphanum().min(8).max(32).required(),
  };

  return Joi.validate(req, schema);
};

module.exports = router;
