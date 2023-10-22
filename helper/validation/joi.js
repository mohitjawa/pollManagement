const Joi = require("joi");
const CodeAndMessage = require("../error-code-message/error-code-message");

exports.signUpVal = (req, res, cb) => {
  const Schema = Joi.object({
    name: Joi.string().required(),
    mobile: Joi.number().required().min(10),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    userName: Joi.string().required(),
  });

  const result = Schema.validate(req.body);
  if (result.error) {
    return res.status(CodeAndMessage.successOk).json({
      code: CodeAndMessage.validationErrCode,
      httpCode: CodeAndMessage.successOk,
      message: result.error.message,
    });
  } else {
    cb(null, true);
  }
};
exports.loginVal = (req, res, cb) => {
  const Schema = Joi.object({
    userName: Joi.string().required(),
    password: Joi.string().required(),
  });

  const result = Schema.validate(req.body);
  if (result.error) {
    return res.status(CodeAndMessage.successOk).json({
      code: CodeAndMessage.validationErrCode,
      httpCode: CodeAndMessage.successOk,
      message: result.error.message,
    });
  } else {
    cb(null, true);
  }
};
