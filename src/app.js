const express = require("express");
const app = express();

app.use(express.json());

app.use("/tokens", require("./routes/tokenRoutes"));

app.use("/simulate", require("./routes/simulationRoutes"));
app.use("/doctors", require("./routes/doctorRoutes"));
app.use("/slots", require("./routes/slotRoutes"));



app.get("/", (req, res) => {
  res.send("OPD Token Allocation Engine Running");
});

module.exports = app;
