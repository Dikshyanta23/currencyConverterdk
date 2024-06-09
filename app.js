const express = require("express");
const PORT = process.env.PORT || 3000;
const rateLimiter = require("express-rate-limit");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
const app = express();
require("dotenv").config();

const apiKey = process.env.EXCHANGE_API_KEY;
const apiURL = `https://v6.exchangerate-api.com/v6/`;

//api limiter
const apiLimiter = rateLimiter({
  windowMS: 15 * 60 * 1000,
  max: 100,
});

//MIDDLEWARE
app.use(express.json());
app.use(apiLimiter);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "/client/dist")));

//routes
app.post("/api/v1/convert", async (req, res) => {
  try {
    const { from, to, amount } = req.body;
    const url = `${apiURL}${apiKey}/pair/${from}/${to}/${amount}`;
    const response = await axios.get(url);
    if (response.data && response.data.result === "success") {
      res.json({
        base: from,
        target: to,
        conversionRate: response.data.conversion_rate,
        conversionAmount: response.data.conversion_result,
      });
    } else {
      res.json({
        message: "Error in currency conversion",
        details: response.data,
      });
    }
  } catch (error) {
    res.json({
      message: "Error in server side conversion",
      details: error.message,
    });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/client/dist", "index.html"));
});

//START THE SERVER

app.listen(PORT, console.log(`Server live on port ${PORT}`));
