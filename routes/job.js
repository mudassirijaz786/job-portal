const auth = require("../middleware/auth");
const _ = require("lodash");
const { Job } = require("../models/job");
const { JobsApplied } = require("../models/jobs_applied");

const router = express.Router();

router.get("/:id", async (req, res) => {
  const job = await Job.findById(req.params.id);
  res.send(job);
});

router.get("/", auth, async (req, res) => {
  const job = await Job.find();
  res.send(job);
});

router.get("/appliedJobs/:id", async (req, res) => {
  const jobs = await JobsApplied.find({ employee_id: req.params.id })
    .populate("jobs_id")
    .exec();
  res.send(jobs);
});

// :TODO:city and area in the seach menu
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
// :TODO:city and area adding and removal of location

router.post("/postNewJob", auth, async (req, res) => {
  const company_id = req.body.company_id;
  const job = new Job(
    _.pick(req.body, [
      "title",
      "description",
      "noOfPositions",
      "location",
      "yearsOfExperience",
      "salaryRange",
      "company_id",
    ])
  );

  await job.save();
  res.json({ message: "Job has been posted successfully" });
});

router.put("/:id", auth, async (req, res) => {
  const job = req.body;

  const job = await Job.findByIdAndUpdate(
    req.params.id,
    { $set: { job } },
    { new: true }
  );
  res.json({ message: "Job has been updateed successfully" });
});
router.delete("/:id", auth, async (req, res) => {
  const job = await Job.findByIdAndRemove(req.params.id);
  res.json({ message: "Job has been deleted successfully" });
});
