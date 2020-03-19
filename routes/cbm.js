const express = require("express");
const concertModel = require("../persistence/cbm.js");
const router = express.Router();
const auth = require("../auth");

router.get("/", async (req, res) => {
  try {
    let concert = await concertModel.findLatestConcerts();

    res.status(200).json({ concerts: concert });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.post("/", async (req, res) => {
  try {
    let concert = req.body.concert;
    if (auth.verifybM(req.headers.token).data !== "Lucas")
      throw new Error("u ain't lucas bro :(");
    if (!concert.place || !concert.date || !concert.eventName)
      throw new Error("place, eventName or date are empty");
    await new concertModel({ ...concert, date: new Date(concert.date) }).save();
    res.status(201).json(concert);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
