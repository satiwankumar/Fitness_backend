const express = require("express");
const _ = require("lodash");
const router = express.Router();
const { check, validationResult } = require("express-validator");

//middleware
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

//servcies
const { url } = require("../utils");
const checkObjectId = require("../middleware/checkobjectId");

//Controller

const WeekExcersizeController = require("../controllers/weekExcersizeController");






router.post("/planupdate",[auth], WeekExcersizeController.UPDATE_PLAN);








// update excersize status
// @access   Private
router.post("/status",
  [
    auth,
    check("excersize_id", "excersize_id is required").not().isEmpty(),
    check("status", "status is required").not().isEmpty(),
  ],
  WeekExcersizeController.UPDATE_USER_EXCERSIZE_STATUS
);
// update mark week_excersize status
// @access   Private
router.post("/complete",
  [
    auth,
    check("week_excersize_id", "week_excersize_id is required").not().isEmpty(),
    check("status", "status is required").not().isEmpty(),
  ],
  WeekExcersizeController.MARK_WEEK_EXCERSIZE_COMPLETE
);





//get basic plan
router.get(
  "/plan",
  [auth,admin],
  WeekExcersizeController.GET_BASIC_PLAN
);

//updateBasicPlan



// @route Post api/weekexcersizes/me
// @desc to get user bid
// access private

// @access   Private
router.get(
  "/me",
  [auth],
  WeekExcersizeController.GET_TODAY_WEEK_EXCERCISES_BY_CURRENT_USER
);

// @access   Private
router.get(
  "/leftover/me",
  [auth],
  WeekExcersizeController.GET_ALL_LEFT_OVER_EXCERSIZES
);

// @route Post api/weekexcersizes/all/me
// @desc to get user bid
// access private

router.get(
  "/all/me",
  [auth],
  WeekExcersizeController.GET_ALL_WEEK_EXCERCISES_OF_CURRENT_USER
);

// @route Get api/weekexcersizes (localhost:5000/api/users)
// @desc to getallweekexcersizes
// access Private

router.get("/", auth, WeekExcersizeController.GET_WEEK_EXCERSIZES);

// @route Post api/weekexcersizes:excersize_id
// @desc to get user bid
// access private

// @access   Private
router.get(
  "/:excersize_id",
  [auth, admin, checkObjectId("excersize_id")],
  WeekExcersizeController.GET_WEEK_EXCERISZE_DETAIL_BY_ID
);

// @route Post api/user/Signup
// @desc to Add/Register user
// access public

router.post(
  "/",
  [
    check("week", "week is required").not().isEmpty(),
    check("day", "day is required").not().isEmpty(),
    check("excersize", "excersize is required").isArray(),
  ],
  WeekExcersizeController.ADD_WEEK_EXCERSIZE
);









module.exports = router;
