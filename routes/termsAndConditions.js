const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const _ = require("lodash");
const { TAC, validate } = require("../models/termsAndConditions");
const express = require("express");
const router = express.Router();

// getting all tac
/**
 * @swagger
 * tags:
 *   name: Terms and Conditions
 *   description: Terms and Conditions management
 */
/**
 * @swagger
 * /api/termsAndCondition:
 *  get:
 *    description: Use to request all terms and conditions
 *    summary:  Use to request all terms and conditions
 *    tags: [Terms and Conditions]
 *    responses:
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: A successful response containg all terms and conditions in JSON
 *      '404':
 *        description: message in json format indicating  not found!
 */
router.get("/", async (req, res) => {
  try {
    const tac = await TAC.find();
    if (!tac) {
      res.status(404).json({ notFound: "Not found" });
    } else {
      res.json({ data: tac });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// getting tac by id
/**
 * @swagger
 * /api/termsAndCondition/{id}:
 *  get:
 *    description+: Use to request the data about a faq
 *    summary: Gets a faq by ID.
 *    tags: [Terms and Conditions]
 *    parameters:
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: Object ID of the terms and conditions  to get it.
 *    responses:
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: A successful response containg the info about that particular  terms and conditions
 *      '400':
 *        description: message in json format indicating terms and conditions not found!
 */
router.get("/:id", async (req, res) => {
  try {
    const tac = await TAC.findById(req.params.id);
    if (!tac) {
      res.status(400).json({ notFound: "not found in system" });
    } else {
      res.json({ data: tac });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// posting a tac
/**
 * @swagger
 * /api/termsAndCondition/:
 *  post:
 *    description: use to post a Terms and Conditions
 *    summary: use to post a Terms and Conditions into system
 *    tags: [Terms and Conditions]
 *    parameters:
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token containg isAdmin field in JWT.
 *    - in: body
 *      name: Terms and Conditions
 *      description: The Terms and Conditions to add.
 *      schema:
 *        type: object
 *        required:
 *        - description
 *        properties:
 *          description:
 *            type: string
 *    responses:
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: a successful message saying Terms and Conditions has been posted
 *      '400':
 *        description: message contains error indications
 */
router.post("/", admin, async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const tac = new TAC(_.pick(req.body, ["description"]));
    await tac.save();
    res.json({
      message: "termsAndCondition has been saved successfully",
      data: tac,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// updation in tac
/**
 * @swagger
 * /api/termsAndCondition/{id}:
 *  put:
 *    description: Use to set the terms And Condition updated
 *    summary:  Use to update the terms And Condition
 *    tags: [Terms and Conditions]
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
 *      description: id of the terms And Condition which is going to be updated
 *    - in: body
 *      name: faq
 *      description: The  terms And Condition to update.
 *      schema:
 *        type: object
 *        required:
 *        - description
 *        properties:
 *          description:
 *            type: string
 *    responses:
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: A successful response message in json indicating  terms And Condition  has been updated successfully
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.put("/:id", admin, async (req, res) => {
  try {
    const tac = await TAC.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json({
      message: "termsAndCondition has been updated and successfully",
      data: tac,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// deleting a tac
/**
 * @swagger
 * /api/termsAndCondition/{id}:
 *  delete:
 *    description: Use to Terms and Conditions the faq
 *    summary:  Use to Terms and Conditions the faq
 *    tags: [Terms and Conditions]
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
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: A successful response message in json indicating Terms and Conditions Deleted successfully
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.delete("/:id", admin, async (req, res) => {
  try {
    const tac = await TAC.findByIdAndRemove(req.params.id);
    if (!tac) {
      res.status(400).json({ notFound: "termsAndCondition not found" });
    } else {
      res.json({ message: "termsAndCondition has been deleted successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
