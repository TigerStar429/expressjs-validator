const { isValidator } = require('../utils/filters');
const check = require('./check');
const validLocations = ['body', 'cookies', 'headers', 'params', 'query'];
const notValidators = ['errorMessage', 'in'];

module.exports = (
  schema,
  defaultLocations = validLocations,
  chainCreator = check
) => Object.keys(schema).map(field => {
  const config = schema[field];
  const chain = chainCreator(
    field,
    ensureLocations(config, defaultLocations),
    config.errorMessage
  );

  Object.keys(config)
    .filter(method => config[method] && !notValidators.includes(method))
    .forEach(method => {
      if (typeof chain[method] !== 'function') {
        console.warn(`express-validator: a validator with name ${method} does not exist`);
        return;
      }

      const methodCfg = config[method];

      let options = methodCfg.options || [];
      if (options != null && !Array.isArray(options)) {
        options = [options];
      }

      chain[method](...options);
      if (isValidator(method) || method === 'custom') {
        chain.withMessage(methodCfg.errorMessage);
      }
    });

  return chain;
});

function ensureLocations(config, defaults) {
  const locations = (Array.isArray(config.in) ? config.in : [config.in]).filter(Boolean);
  const actualLocations = locations.length ? locations : defaults;

  return actualLocations.filter(location => validLocations.includes(location));
}