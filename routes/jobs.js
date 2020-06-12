const auth = require("../middleware/auth");
const _ = require("lodash");
const { Job, validate } = require("../models/job");
const { JobsApplied } = require("../models/jobs_applied");
const express = require("express");
const router = express.Router();

// getting a job
router.get("/:id", async (req, res) => {
  const job = await Job.findById(req.params.id);
  res.json({ data: job });
});

// getting all jobs
router.get("/", auth, async (req, res) => {
  const job = await Job.find();
  res.json({ data: job });
});

// :FIXME: // job is not populating only array of object having job_id and employee_id is showing
// appied jobs for a customer
router.get("/appliedJobs/:id", async (req, res) => {
  const jobs = await JobsApplied.find({ applied_by: req.params.id })
    .populate("jobs_id")
    .exec();
  res.send(jobs);
});

// :TODO: searching on title, area etc
// searching a job
router.get("/searchjob/:id", async (req, res) => {
  const jobs = await Job.find();
  const query = req.params.id.toLowerCase();
  var foundedJobs = [];

  jobs.forEach((job) => {
    if (job.title.toLowerCase().includes(query)) {
      foundedJobs.push(job);
    } else if (job.location.toLowerCase().includes(query)) {
      foundedJobs.push(job);
    }
  });
  res.send(foundedJobs);
});

// post a new job
router.post("/postNewJob", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const job = new Job(
    _.pick(req.body, [
      "title",
      "description",
      "noOfPositions",
      "city",
      "area",
      "yearsOfExperience",
      "salaryRange",
      "company_id",
    ])
  );

  await job.save();
  res.json({ message: "Job has been posted successfully", data: job });
});

// FIXME: updation don't work
router.put("/:id", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // TODO: if id not found then say you cannot update this job else update it
  const job = req.body;

  const jobs = await Job.findByIdAndUpdate(
    req.params.id,
    { $set: { job } },
    { new: true }
  );

  res.json({ message: "Job has been updateed successfully", data: jobs });
});

// deletion of job
router.delete("/:id", auth, async (req, res) => {
  const job = await Job.findByIdAndRemove(req.params.id);
  if (!job) {
    return res.status(400).json({ error: "Job not found" });
  } else {
    res.json({ message: "Job has been deleted successfully" });
  }
});

module.exports = router;
