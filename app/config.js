/*
create and export configuration variables

*/
// container for all environments
var environments = {};

// staging (default) environment
environments.staging = {
'httpPort':3000,
'httpsPort':3001,
'envName':'staging',
'hashingSecret':'thisIsASecret'
}

// production environment
environments.production = {
  'httpPort':5000,
  'httpsPort':5001,
  'envName':'production',
  'hashingSecret':'thisIsASecret'
}

// Determine which environmentwas passd as a command-line argument

var currentEnvironment =  typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase(): '';

// check that the current environment is one of the environments above, if not default to staging
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ?  environments[currentEnvironment] : environments.staging;

// export the module
module.exports = environmentToExport;
