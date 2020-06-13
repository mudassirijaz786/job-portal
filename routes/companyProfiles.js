const auth = require("../middleware/auth");
const _ = require("lodash");
const express = require("express");
const { CompanyProfile, validate } = require("../models/companyProfile");

const router = express.Router();

// company profile
/**
 * @swagger
 * tags:
 *   name: Company Profile
 *   description: Company Profile management
 */
/**
 * @swagger
 * /api/companyProfile/me/{id}:
 *  get:
 *    description: Use to request a company profile
 *    summary:  Use to request a company profile
 *    tags: [Company Profile]
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
 *      '200':
 *        description: A successful response containg profile in JSON
 *      '400':
 *        description: message in json format indicating  not found!
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.get("/me/:id", auth, async (req, res) => {
  const profile = await CompanyProfile.findOne({ company_id: req.params.id });
  if (profile) {
    res.json({ data: profile });
  } else {
    res.status(400).json({ message: "Not Found!" });
  }
});

// company profile creation
/**
 * @swagger
 * /api/companyProfile/:
 *  post:
 *    description: use to create a profile for company
 *    summary: use to create a profile for company
 *    tags: [Company Profile]
 *    parameters:
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token containg JWT.
 *    - in: body
 *      name: company profile
 *      description: The profile of companu to create.
 *      schema:
 *        type: object
 *        required:
 *        - ceo
 *        - address
 *        - city
 *        - description
 *        - url
 *        - noOfEmployees
 *        - company_id
 *        properties:
 *          ceo:
 *            type: string
 *          address:
 *            type: string
 *          city:
 *            type: string
 *          description:
 *            type: string
 *          url:
 *            type: string
 *          noOfEmployees:
 *            type: string
 *          company_id:
 *            type: string
 *    responses:
 *      '200':
 *        description: success mesage in json formet indicating profile has been forwarded...
 *      '400':
 *        description: message in json format indicating profile not saved
 */

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const profile = new CompanyProfile(
      _.pick(req.body, [
        "company_id",
        "ceo",
        "address",
        "city",
        "description",
        "url",
        "noOfEmployees",
      ])
    );

    await profile.save();
    res.json({
      message: "Company Profile has been saved successfully",
      data: profile,
    });
  } catch (error) {
    res.status(400).json({ error: "profile cannot be saved" });
  }
});

// deleting a profile
/**
 * @swagger
 * /api/companyProfile/deleteProfile/{id}:
 *  delete:
 *    description: use to create a profile for company
 *    summary: use to create a profile for company
 *    tags: [Company Profile]
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
 *      description: Object ID of the employee to get.
 *    responses:
 *      '200':
 *        description: success mesage in json formet indicating profile has been deleted
 */
router.delete("/deleteProfile/:id", auth, async (req, res) => {
  const profile = await CompanyProfile.findByIdAndRemove(req.params.id);
  res.json({ message: "company profile has been deleted successfully" });
});

/**
 * @swagger
 * /api/companyProfile/{id}:
 *  put:
 *    description: use to create a profile for company
 *    summary: use to create a profile for company
 *    tags: [Company Profile]
 *    parameters:
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: Object ID of the company to get.
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token containg JWT.
 *    - in: body
 *      name: company profile
 *      description: The profile of companu to create.
 *      schema:
 *        type: object
 *        required:
 *        - ceo
 *        - address
 *        - city
 *        - description
 *        - url
 *        - noOfEmployees
 *        properties:
 *          ceo:
 *            type: string
 *          address:
 *            type: string
 *          city:
 *            type: string
 *          description:
 *            type: string
 *          url:
 *            type: string
 *          noOfEmployees:
 *            type: string
 *    responses:
 *      '200':
 *        description: success mesage in json formet indicating profile has been forwarded...
 *      '400':
 *        description: message in json format indicating profile not saved
 */

router.put("/:id", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const profile = await CompanyProfile.findOneAndUpdate(
    { company_id: req.params.id },
    {
      $set: {
        ceo: req.body.ceo,
        address: req.body.address,
        city: req.body.city,
        description: req.body.description,
        url: req.body.url,
        noOfEmployees: req.body.noOfEmployees,
      },
    },
    { new: true }
  );
  res.json({ message: "Profile has been saved successfully" });
});

module.exports = router;
