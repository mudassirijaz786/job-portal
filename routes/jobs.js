const auth = require("../middleware/auth");
const _ = require("lodash");
const { Job, validate } = require("../models/job");
const { JobsApplied } = require("../models/jobs_applied");
const express = require("express");
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
 *      '400':
 *        description: message in json format indicating Job not found!
 */
router.get("/:id", async (req, res) => {
  const job = await Job.findById(req.params.id);
  res.json({ data: job });
});

// getting all jobs
/**
 * @swagger
 * tags:
 *   name: Job
 *   description: Job management
 */
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
 *      description: jwt token containg isAdmin field in JWT.
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
 *        properties:
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
// FIXME: problem in it, Cast to ObjectId failed for value "{id}" at path "_id" for model "Job"
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
 *      name: id of the faq
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

module.exports = router;
