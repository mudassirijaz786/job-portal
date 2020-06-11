const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const _ = require("lodash");
const express = require("express");
const { Admin } = require("../models/admin");
const router = express.Router();

// getting current admin
router.get("/me", auth, async (req, res) => {
  const token = req.header("x-auth-token");
  const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
  const admin = await Admin.findById(decoded._id).select("-password ");
  res.json({ currentAdmin: admin });
});

// login
router.post("/login", async (req, res) => {
  let admin = await Admin.findOne({ email: req.body.email });
  if (!admin)
    return res.status(400).json({ error: "Invalid email or password." });

  const validPassword = await bcrypt.compare(req.body.password, admin.password);
  if (!validPassword)
    return res.status(400).json({ error: "Invalid email or password." });

  const token = admin.generateAuthToken();
  res.json({ token });
});

// register
router.post("/register", async (req, res) => {
  let admin = await Admin.findOne({ email: req.body.email });
  if (admin)
    return res.status(400).json({
      error: `Admin with email ${req.body.email} is already registered`,
    });

  admin = new Admin(_.pick(req.body, ["name", "password", "email"]));

  const salt = await bcrypt.genSalt(10);
  admin.password = await bcrypt.hash(admin.password, salt);

  await admin.save();

  const token = admin.generateAuthToken();

  res.header("x-auth-token", token).json({ token });
});

module.exports = router;
