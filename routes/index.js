const express = require("express");

const router = express.Router();

router.use("/user", require("./userRoutes/userRoutes"));
router.use("/wardrobe", require("./Wardrobe/wardrobeRoutes"));
router.use("/savedsuits", require("./savedSuit/savedSuitRoutes"));
router.use("/user/task", require("./taskRoutes/taskRoutes"));
router.use("/user/feedback", require("./feedbackRoute/feedbackRoute"));
router.use("/shoppingcart", require("./shoppingCartRoutes/shoppingCartRoutes"));

module.exports = router;
