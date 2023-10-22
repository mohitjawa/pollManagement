const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/controller");
const middleware = require("../helper/validation/joi");
const auth = require("../helper/auth/auth");

router.post("/signup", middleware.signUpVal, userCtrl.signup);
router.post("/login", middleware.loginVal, userCtrl.login);
router.post("/create-poll", userCtrl.createPoll);
router.get("/poll-list", auth.checkToken, userCtrl.pollList);
router.put("/give-vote/:pollId/:optionSelectedId",auth.checkToken, userCtrl.giveVote);

module.exports = router;
