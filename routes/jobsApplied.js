const router = express.Router();
const { JobsApplied } = require("../models/jobs_applied");
const _ = require("lodash");

router.post("/", async (req, res) => {
  const apply = new JobsApplied(_.pick(req.body, ["job_id", "employee_id"]));
  await apply.save();
  res.json({
    message: "You've applied the job to the organization successfully",
  });
});
