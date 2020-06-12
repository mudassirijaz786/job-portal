const { JobsApplied } = require("../models/jobs_applied");
const _ = require("lodash");
const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  const apply = new JobsApplied(_.pick(req.body, ["job_id", "applied_by"]));
  await apply.save();
  res.json({
    message: "You've applied the job to the organization successfully",
  });
});

module.exports = router;
