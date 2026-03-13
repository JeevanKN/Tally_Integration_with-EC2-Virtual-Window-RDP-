const express = require("express");
const router = express.Router();


const tallyRoutes = require("./tally.route");






// ✅ Server Health Check
router.get("/health", function (req, res, next) {
    res.status(200).send("Healthy Server!");
});

router.use("/tally", tallyRoutes);


module.exports = router;