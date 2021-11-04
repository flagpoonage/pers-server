import Joi from 'joi';

export function isValidSchema<T>(schema: Joi.ObjectSchema) {
  return function (input: unknown): input is T {
    const result = schema.validate(input);
    return !!result.error;
  };
}

export function validateWithJoi<BODY = unknown>(
  schema: Joi.Schema
): (body: BODY) => body is BODY {
  return (body: BODY): body is BODY => {
    const valid = schema.validate(body);
    if (valid.error) {
      console.error(JSON.stringify(valid.error, null, 2));
    }
    return !valid.error;
  };
}
