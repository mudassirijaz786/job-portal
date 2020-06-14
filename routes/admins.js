const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const _ = require("lodash");
const express = require("express");
const { Admin, validate } = require("../models/admin");
const router = express.Router();
const Joi = require("joi");

//fetching all the admins

/**
 * @swagger
 * tags:
 *   name: Admins
 *   description: admin management
 */
/**
 * @swagger
 * /api/admin:
 *  get:
 *    description: Use to request all admins
 *    summary:  Use to request all admins
 *    tags: [Admins]
 *    parameters:
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token containg isAdmin field in JWT.
 *    responses:
 *      '200':
 *        description: A successful response containg all admins in JSON
 *      '500':
 *        description: internal server error
 *      '404':
 *        description: message in json format indicating  not found!
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.get("/", admin, async (req, res) => {
  try {
    const admin = await Admin.find().select("-password");
    if (admin) {
      res.json({ data: admin });
    } else {
      res.status(404).json({ message: "Not Found!" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// getting current admin
/**
 * @swagger
 * /api/admin/me/{id}:
 *  get:
 *    description: Use to request a single admin
 *    summary:  Use to request a single admin
 *    tags: [Admins]
 *    parameters:
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token containg isAdmin field in JWT.
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: Object ID of the admin to get.
 *    responses:
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: A successful response containg all admins in JSON
 *      '404':
 *        description: message in json format indicating  not found!
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.get("/me/:id", admin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select("-password");
    if (admin) {
      res.json({ data: admin });
    } else {
      res.status(404).json({ message: "Not Found!" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// login
/**
 * @swagger
 * /api/admin/login:
 *  post:
 *    description: use to login admin into the system
 *    summary: login admin into the system using email and password.
 *    tags: [Admins]
 *    parameters:
 *    - in: body
 *      name: admin
 *      description: The admin to login.
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
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: jwt token for that particular admin loged in.
 *      '400':
 *        description: message in json format Invalid email or password.
 */
router.post("/login", async (req, res) => {
  try {
    const { error } = validateLogin(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let admin = await Admin.findOne({ email: req.body.email });
    if (!admin)
      return res.status(400).json({ error: "Invalid email or password." });
    const validPassword = await bcrypt.compare(
      req.body.password,
      admin.password
    );
    if (!validPassword)
      return res.status(400).json({ error: "Invalid email or password." });
    const token = admin.generateAuthToken();
    res.header("x-auth-token", token);
    res.send({ token });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// register
/**
 * @swagger
 * /api/admin/register:
 *  post:
 *    description: use to resister admin into the system
 *    summary: use to resister admin into the system.
 *    tags: [Admins]
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
 *        properties:
 *          name:
 *            type: string
 *          email:
 *            type: string
 *          password:
 *            type: string
 *    responses:
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: jwt token for that particular new admin.
 *      '400':
 *        description: message in json format indicating admin with email already exists.
 */
router.post("/register", async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let admin = await Admin.findOne({ email: req.body.email });
    if (admin)
      return res.status(409).json({
        message: `Admin with email ${req.body.email} is already registered`,
      });
    admin = new Admin(_.pick(req.body, ["name", "password", "email"]));
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(admin.password, salt);
    await admin.save();
    const token = admin.generateAuthToken();
    res.header("x-auth-token", token).json({ token });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
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
