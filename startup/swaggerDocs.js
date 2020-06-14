const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
// const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("../apis/swagger.yaml");

module.exports = (app) => {
  // Extended: https://swagger.io/specification/#infoObject
  const swaggerOptions = {
    swaggerDefinition: {
      info: {
        version: "1.0.0",
        title: "ELYS API",
        description: "ELYS API Information",
        contact: {
          name: "Sabir and co developers",
        },
        servers: ["http://localhost:3900"],
      },
    },
    apis: ["./routes/*.js", "./apis-docs/*.yaml"],
  };
  const swaggerDocs = swaggerJsDoc(swaggerOptions);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};
