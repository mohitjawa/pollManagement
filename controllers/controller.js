const {
  User,
  pollManagement,
} = require("../model/index");
const codeAndMessage = require("../helper/error-code-message/error-code-message");
const Utility = require("../helper/utilities/common");
require("dotenv").config();
var jwt = require("jsonwebtoken");
exports.signup = async (req, res) => {
  try {
    const { name, email, userName, mobile,password } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { userName }] })
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({
          message: "Email already registered",
        });
      } else {
        return res.status(400).json({
          message: "Username already registered",
        });
      }
    }
    const hashPassword = await Utility.encryptPassword(password);
    User.create({name,email,userName,mobile,password:hashPassword})
    return res.status(codeAndMessage.successOk).json({
      code: codeAndMessage.successOk,
      httpCode: codeAndMessage.successOk,
      message: codeAndMessage.successOk,
    });
  }catch (error) {
    return res.status(codeAndMessage.badRequestCode).json({
      code: codeAndMessage.badRequestCode,
      httpCode: codeAndMessage.badRequestHttpCode,
      message: codeAndMessage.badRequestMessage,
    });
  }
};
exports.login = async (req, res) => {
  try {
    const { userName,password } = req.body;
    const UserExist = await User.findOne({ userName });
    if (UserExist == null) {
      return res.status(200).json({
        message: codeAndMessage.notFoundUserMessage,
      });
    }
    const hashPassword = await Utility.validatePassword(
      password,
      UserExist.password
    );
    if (!hashPassword) {
      return res.status(404).json({
        message: codeAndMessage.incorrectPass,
      });
    }
    const token = jwt.sign(
      {
        data: UserExist._id,
      },
      process.env.JWTPASS,
      {
        expiresIn: "23h",
      }
    );
    return res.status(codeAndMessage.successOk).json({
      message: codeAndMessage.successMessage,
      token: token,
      data: await User.findOne({ userName },{password:0,__v:0}),
    });
  } catch (error) {
    console.log(error)
    return res.status(codeAndMessage.badRequestCode).json({
      code: codeAndMessage.badRequestCode,
      httpCode: codeAndMessage.badRequestHttpCode,
      message: codeAndMessage.badRequestMessage,
    });
  }
};
exports.createPoll = async (req, res) => {
  try {
    pollManagement.create(req.body)
    return res.status(codeAndMessage.successOk).json({
      code: codeAndMessage.successOk,
      httpCode: codeAndMessage.successOk,
      message: codeAndMessage.successOk,
    });
  } catch (error) {
    return res.status(codeAndMessage.successOk).json({
      code: codeAndMessage.badRequestCode,
      httpCode: codeAndMessage.badRequestHttpCode,
      message: codeAndMessage.badRequestMessage,
    });
  }
};
exports.pollList = async (req, res) => {
  let query;
  if(req.query.history){
    query={usersVoted:{$in:[req.userId]}}
  }else{
    query={}
  }
  const userId = req.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  try {
    const totalDocuments = await pollManagement.countDocuments();
    const totalPages = Math.ceil(totalDocuments / limit);
    const polls = await pollManagement.aggregate([
      {
        $match: query
      },
      {
        $unwind: "$options",
      },
      {
        $addFields: {
          "options.percentage": {
            $cond: {
              if: { $eq: [{ $size: "$usersVoted" }, 0] },
              then: 0,
              else: {
                $multiply: [
                  { $divide: [{ $size: "$options.voters" }, { $size: "$usersVoted" }] },
                  100,
                ],
              },
            },
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          title: { $first: "$title" },
          description: { $first: "$description" },
          usersVoted: { $first: "$usersVoted" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          options: { $push: "$options" },
        },
      },
      {
        $addFields: {
          isVoted: {
            $in: [userId, "$usersVoted"],
          },
        },
      },
      {
        $project: {
          title: 1,
          description: 1,
          isVoted: 1,
          selectedOption: {
            $ifNull: [
              {
                $arrayElemAt: [
                  {
                    $map: {
                      input: {
                        $filter: {
                          input: "$options",
                          as: "option",
                          cond: { $eq: ["$$option.voters", [userId]] },
                        },
                      },
                      as: "option",
                      in: "$$option.optionTitle",
                    },
                  },
                  0,
                ],
              },
              null,
            ],
          },
          options: {
            _id: 1,
            optionTitle: 1,
            voters: 1,
            percentage: 1,
          },
          createdAt: 1,
          updatedAt: 1,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },

    ]);

    res.status(200).json({
      httpCode: 200,
      code: 200,
      data: polls,
      message: 'Success',
      currentPage: page,
      totalPage: totalPages,
    })
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred' });
  }
}

exports.giveVote = async (req, res) => {
  try {
    const { pollId,optionSelectedId} = req.params;
    await pollManagement.findOneAndUpdate(
      { _id: pollId},
      { $push:{'options.$[option].voters': req.userId,usersVoted:req.userId} }, {
        arrayFilters: [{ 'option._id': optionSelectedId }],
        new: true,
      }
    );
    return res.status(codeAndMessage.successOk).json({
      code: codeAndMessage.successOk,
      httpCode: codeAndMessage.successOk,
      message: codeAndMessage.successOk,
    });
  } catch (error) {
    console.log(error);
    return res.status(codeAndMessage.successOk).json({
      code: codeAndMessage.badRequestCode,
      httpCode: codeAndMessage.badRequestHttpCode,
      message: codeAndMessage.badRequestMessage,
    });
  }
};

