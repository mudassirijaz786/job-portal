const auth = require("../middleware/auth");
const _ = require("lodash");
const express = require("express");
const { CompanyProfile, validate } = require("../models/companyProfile");
const { Company } = require("../models/company");

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
 *      description: jwt token
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: Object ID of the admin to get.
 *    responses:
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: A successful response containg profile in JSON
 *      '404':
 *        description: message in json format indicating not found!
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.get("/me/:id", auth, async (req, res) => {
  try {
    const profile = await CompanyProfile.findOne({ company_id: req.params.id });
    if (profile) {
      res.json({ data: profile });
    } else {
      res.status(404).json({ message: "Not Found!" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
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
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: success mesage in json formet indicating profile has been forwarded...
 *      '404':
 *        description: message in json format indicating company not found
 *      '400':
 *        description: message in json format indicating company profile cannot be saved into database
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */

router.post("/", auth, async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const found = await Company.findOne({
      _id: req.body.company_id,
    });
    if (!found) {
      res.status(404).json({
        message: `Company not found with an id ${req.body.company_id}`,
      });
    } else {
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
        res.status(400).json({ message: "profile cannot be saved" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
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
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: success mesage in json formet indicating profile has been deleted
 *      '404':
 *        description: message in json format indicating company not found
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */
router.delete("/deleteProfile/:id", auth, async (req, res) => {
  try {
    const profile = await CompanyProfile.findByIdAndRemove(req.params.id);
    if (!profile) {
      res
        .status(404)
        .json({ message: `Company not found with an id ${req.params.id}` });
    }
    res.json({ message: "company profile has been deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//update company profile
/**
 * @swagger
 * /api/companyProfile/update/{id}:
 *  put:
 *    description: use to create a profile for company
 *    summary: use to create a profile for company
 *    tags: [Company Profile]
 *    parameters:
 *    - in: path
 *      name: id
 *      type: string
 *      required: true
 *      description: Object ID of the company to update
 *    - in: header
 *      name: x-auth-token
 *      type: string
 *      required: true
 *      description: jwt token containg JWT.
 *    - in: body
 *      name: company profile
 *      description: The profile of company to update
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
 *      '500':
 *        description: internal server error
 *      '200':
 *        description: success mesage in json formet indicating profile has been forwarded...
 *      '404':
 *        description: message in json format indicating profile not saved
 *      '401':
 *        description: message in json format indicating Access denied, no token provided. Please provide auth token.
 */

router.put("/update/:id", auth, async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const found = await CompanyProfile.findOne({
      company_id: req.params.id,
    });
    if (!found) {
      res
        .status(404)
        .json({ message: `Company not found with an id ${req.params.id}` });
    } else {
      await CompanyProfile.findOneAndUpdate(
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
      res.json({ message: "Company profile has been saved successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
