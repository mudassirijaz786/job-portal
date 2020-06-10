const auth = require("../middleware/auth");
const _ = require("lodash");
const express = require("express");
const { Profile } = require("../models/profile");
const router = express.Router();

// profile creation route
router.post("", auth, async (req, res) => {});

module.exports = router;
