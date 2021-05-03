module.exports = joi
  .object({
    username: joi.string().required(),
    email: joi.string().required().email(),
    age: joi.number().min(18).max(50).required(),
  })
  .unknown();
