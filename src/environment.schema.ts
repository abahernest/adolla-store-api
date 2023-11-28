import * as Joi from 'joi';

export default Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  MONGODB_URI: Joi.string().default('mongodb://localhost:27017/adolla-store'),
  MONGODB_TEST_URI: Joi.string().default(
    'mongodb://localhost:27017/adolla-store-test',
  ),
  PORT: Joi.number().default(60061),
  JWT_SECRET: Joi.string().default('my-super-secure-jwt-secret'),
});
