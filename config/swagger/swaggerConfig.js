// swaggerConfig.js
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

// Load the YAML file
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));

/**
 * Function to setup Swagger in your Express app
 * @param {import('express').Express} app 
 */
function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

module.exports = setupSwagger;
