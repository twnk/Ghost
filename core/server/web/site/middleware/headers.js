const helmet = require('helmet');

/**
 * Test out using Helmet library for security headers
 * @TODO this does not vary with the headers.yaml at all 
 */
module.exports = [
   helmet({
       contentSecurityPolicy: false,
       strictTransportSecurity: false
   })
]