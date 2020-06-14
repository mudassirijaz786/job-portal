const auth = require("../middleware/auth");
const _ = require("lodash");
const { Job, validate } = require("../models/job");
const { JobsApplied } = require("../models/jobs_applied");
const { Employee } = require("../models/employee");
const { Profile } = require("../models/profile");
const express = require("express");
const { log } = require("winston");
const router = express.Router();

// getting a job by id
/**
 * @swagger
 * tags:
 *   name: Job
 *   description: Job management
 */
/**
 * @swagger
 * /api/job/{id}:
 *  get:
 *    description+: Use to request the data about a Job
 *    summary: Gets a Job by ID.
 *    tags: [Job]
 *    parameters:
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: Object ID of the Job to get it.
 *    responses:
 *      '200':
 *        description: A successful response containg the info about that particular Job
 *      '404':
 *        description: message in json format indicating Job not found!
 */
router.get("/:id", async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404).json({ message: "no job found matching with given ID" });
  } else {
    res.json({ data: job });
  }
});

// getting all jobs
/**
 * @swagger
 * /api/job:
 *  get:
 *    description: Use to request all Jobs
 *    summary:  Use to request all Jobs
 *    tags: [Job]
 *    responses:
 *      '200':
 *        description: A successful response containg all Job in JSON
 *      '400':
 *        description: message in json format indicating  not found!
 */
router.get("/", async (req, res) => {
  const job = await Job.find();
  res.json({ data: job });
});

/**
 * @swagger
 * /api/job/applyForJob/:
 *  put:
 *    description: Use to request a apply for jobs
 *    summary:  Use to request a apply for jobs
 *    tags: [Job]
 *    parameters:
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token containg JWT.
 *    - in: body
 *      name: user
 *      description: The user to login.
 *      schema:
 *        type: object
 *        required:
 *        - job_id
 *        - applied_by
 *        properties:
 *          job_id:
 *            type: string
 *          applied_by:
 *            type: string
 *    responses:
 *      '200':
 *        description: A successful response containg apply for jobs in JSON
 *      '404':
 *        description: message in json format indicating  not found!
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.put("/applyForJob", async (req, res) => {
  const found = Job.findById(req.body.job_id);
  if (!found) {
    res.status(404).json({ message: "Job Not Found!" });
  } else {
    await Job.findByIdAndUpdate(
      req.body.job_id,
      {
        $push: {
          applied_by: { employee_id: req.body.applied_by },
        },
      },
      { new: true }
    );
    res.json({
      message: "You've applied the job to the organization successfully",
    });
  }
});

// appied jobs for a customer
/**
 * @swagger
 * /api/job/appliedJobs/{id}:
 *  get:
 *    description: Use to request a applied jobs
 *    summary:  Use to request a applied jobs
 *    tags: [Job]
 *    parameters:
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token containg JWT.
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: Object ID of the employee to get applied jobs
 *    responses:
 *      '200':
 *        description: A successful response containg applied jobs in JSON
 *      '400':
 *        description: message in json format indicating  not found!
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.get("/appliedJobs/:id", async (req, res) => {
  const job = await Job.find({
    applied_by: { $elemMatch: { employee_id: req.params.id } },
  }).select("-applied_by");
  res.json({ data: job });
});

/**
 * @swagger
 * /api/job/collectCV/{id}:
 *  get:
 *    description: Use to request a collect cv
 *    summary:  Use to request a collect cv
 *    tags: [Job]
 *    parameters:
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token containg JWT.
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: Object ID of the job to collect cv
 *    responses:
 *      '200':
 *        description: A successful response containg collect cv in JSON
 *      '404':
 *        description: message in json format indicating  not found!
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */

router.get("/collectCV/:jobId", auth, async (req, res) => {
  const jobId = req.params.jobId;
  const job = await Job.findById(jobId);
  if (!job) {
    res.status(404).json({ message: "There is no cv submitted for this job" });
  } else {
    const profiles = [];
    for (let i = 0; i < job.applied_by.length; i++) {
      const element = job.applied_by[i];
      const pr = await Profile.findOne({ employee_id: element.employee_id })
        .populate("employee_id")
        .exec();
      pr.employee_id["password"] = "";
      profiles.push(pr);
    }
    res.json({ data: profiles });
  }
});

// searching a job
/**
 * @swagger
 * /api/job/searchjob/{id}:
 *  get:
 *    description: use to search an job
 *    summary: use to search an job by name
 *    tags: [Job]
 *    parameters:
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: name which is use to search a job
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token containg JWT.
 *    responses:
 *      '200':
 *        description: message in json formet containing job matched with query
 *      '404':
 *        description: message in json format indicating not found as an empty array
 */

router.get("/searchjob/:id", async (req, res) => {
  const jobs = await Job.find();
  const query = req.params.id.toLowerCase();
  var foundedJobs = [];
  jobs.forEach((job) => {
    if (job.title.toLowerCase().includes(query)) {
      foundedJobs.push(job);
    } else if (job.city.toLowerCase().includes(query)) {
      foundedJobs.push(job);
    } else if (job.area.toLowerCase().includes(query)) {
      foundedJobs.push(job);
    } else if (job.description.toLowerCase().includes(query)) {
      foundedJobs.push(job);
    }
  });
  if (foundedJobs.length === 0) {
    res.status(404).json({ message: `No job found with named as ${query}` });
  } else {
    res.json({ data: foundedJobs });
  }
});

// post a new job
/**
 * @swagger
 * tags:
 *   name: Job
 *   description: ContactUs management
 */
/**
 * @swagger
 * /api/job/postNewJob:
 *  post:
 *    description: use to post a Job
 *    summary: use to post a Job into system
 *    tags: [Job]
 *    parameters:
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token containg JWT.
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: company_id associated with that job
 *    - in: body
 *      name: Job
 *      description: The Job to add.
 *      schema:
 *        type: object
 *        required:
 *        - title
 *        - description
 *        - noOfPositions
 *        - city
 *        - area
 *        - yearsOfExperience
 *        - salaryRange
 *        - company_id
 *        properties:
 *          company_id:
 *            type: string
 *          title:
 *            type: string
 *          description:
 *            type: string
 *          noOfPositions:
 *            type: string
 *          city:
 *            type: string
 *          area:
 *            type: string
 *          yearsOfExperience:
 *            type: string
 *          salaryRange:
 *            type: string
 *    responses:
 *      '200':
 *        description: a successful message saying faq has been posted
 *      '400':
 *        description: message contains error indications
 */
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

/**
 * @swagger
 * /api/job/{id}:
 *  put:
 *    description: use to update a Job
 *    summary: use to update a Job into system
 *    tags: [Job]
 *    parameters:
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token containg JWT.
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: job_id to update it
 *    - in: body
 *      name: Job
 *      description: The Job to update.
 *      schema:
 *        type: object
 *        required:
 *        - title
 *        - company_id
 *        - description
 *        - noOfPositions
 *        - city
 *        - area
 *        - yearsOfExperience
 *        - salaryRange
 *        properties:
 *          company_id:
 *            type: string
 *          title:
 *            type: string
 *          description:
 *            type: string
 *          noOfPositions:
 *            type: string
 *          city:
 *            type: string
 *          area:
 *            type: string
 *          yearsOfExperience:
 *            type: string
 *          salaryRange:
 *            type: string
 *    responses:
 *      '200':
 *        description: a successful message saying job has been updated
 *      '400':
 *        description: message contains error indications
 *      '404':
 *        description: message contains not found error
 */

router.put("/:id", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const found = Job.findById(req.params.id);
  if (!found) {
    res.status(404).json({ message: "Invalid id. Job not found" });
  } else {
    const jobs = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json({ message: "Job has been updateed successfully", data: jobs });
  }
});

// deletion of job
/**
 * @swagger
 * /api/job/{id}:
 *  delete:
 *    description: Use to delete the job
 *    summary:  Use to delete the job
 *    tags: [Job]
 *    parameters:
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token(JWT).
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description:  Object ID of the faq to delete
 *    responses:
 *      '200':
 *        description: A successful response message in json indicating job Deleted successfully
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */

router.delete("/:id", auth, async (req, res) => {
  const job = await Job.findByIdAndRemove(req.params.id);
  if (!job) {
    return res.status(400).json({ error: "Job not found" });
  } else {
    res.json({ message: "Job has been deleted successfully" });
  }
});

/**
 * @swagger
 * /api/job/postedJobs/{id}:
 *  get:
 *    description: Use to view the posted jobs the job
 *    summary:   Use to view the posted jobs the job
 *    tags: [Job]
 *    parameters:
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token(JWT).
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description:  Object ID of company to view posted jobs
 *    responses:
 *      '200':
 *        description: A successful response message in json indicating posted jobs
 *      '400':
 *        description: error message which shows that job not found
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.get("/postedJobs/:id", auth, async (req, res) => {
  const job = await Job.find({ company_id: req.params.id });
  if (!job) {
    return res.status(400).json({ error: "Job not found" });
  } else {
    res.json({ data: job });
  }
});

module.exports = router;
