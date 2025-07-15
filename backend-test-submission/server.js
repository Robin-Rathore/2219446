import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { Log, setAuthToken } from "../logging-middleware/index.js";
import shortid from "shortid";
import dayjs from "dayjs";

const app = express();
app.use(cors());
app.use(express.json());

setAuthToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJyYXRob3Jlcm9iaW4wM0BnbWFpbC5jb20iLCJleHAiOjE3NTI1NjE4MjQsImlhdCI6MTc1MjU2MDkyNCwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6ImEyOGE1YWFiLTkzN2QtNGI4NS04ZjliLTVjZjZiMDJkMTAzZiIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6InJvYmluIHJhdGhvcmUiLCJzdWIiOiIyOTUwM2E5Yy03MWRhLTQxNjAtYTU2YS1hYjc4ZGY3MmJlNDUifSwiZW1haWwiOiJyYXRob3Jlcm9iaW4wM0BnbWFpbC5jb20iLCJuYW1lIjoicm9iaW4gcmF0aG9yZSIsInJvbGxObyI6IjIyMTk0NDYiLCJhY2Nlc3NDb2RlIjoiUUFoRFVyIiwiY2xpZW50SUQiOiIyOTUwM2E5Yy03MWRhLTQxNjAtYTU2YS1hYjc4ZGY3MmJlNDUiLCJjbGllbnRTZWNyZXQiOiJyU3JqbkVWQ3FrdXBxdUV5In0.vNwUV9tpW47IQIci_l684wDPXsIuX4f3ud7Rh2IoCJI");

// DB Setup
mongoose.connect("mongodb://localhost:27017/shortener", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const urlSchema = new mongoose.Schema({
  originalUrl: String,
  shortcode: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date,
  clicks: [
    {
      timestamp: Date,
      referrer: String,
      location: String,
    },
  ],
});

const ShortURL = mongoose.model("ShortURL", urlSchema);

app.post("/shorturls", async (req, res) => {
  const { url, validity = 30, shortcode } = req.body;
  const code = shortcode || shortid.generate();
  const expiry = dayjs().add(validity, "minute").toDate();

  try {
    const exists = await ShortURL.findOne({ shortcode: code });
    if (exists) return res.status(409).json({ error: "Shortcode already in use" });

    const newEntry = new ShortURL({ originalUrl: url, shortcode: code, expiresAt: expiry });
    await newEntry.save();

    await Log("backend", "info", "controller", `Created short URL for ${url}`);

    res.status(201).json({
      shortLink: `http://localhost:8080/${code}`,
      expiry: expiry.toISOString(),
    });
  } catch (err) {
    await Log("backend", "error", "db", err.message);
    res.status(500).json({ error: "Server Error" });
  }
});

app.get("/shorturls/:shortcode", async (req, res) => {
  try {
    const urlData = await ShortURL.findOne({ shortcode: req.params.shortcode });
    if (!urlData) return res.status(404).json({ error: "Short URL not found" });

    res.status(200).json({
      originalUrl: urlData.originalUrl,
      createdAt: urlData.createdAt,
      expiresAt: urlData.expiresAt,
      totalClicks: urlData.clicks.length,
      clicks: urlData.clicks,
    });
  } catch (err) {
    await Log("backend", "error", "db", err.message);
    res.status(500).json({ error: "Server Error" });
  }
});

app.get("/:shortcode", async (req, res) => {
  try {
    const entry = await ShortURL.findOne({ shortcode: req.params.shortcode });
    if (!entry || dayjs().isAfter(entry.expiresAt)) {
      return res.status(404).send("Expired or invalid link");
    }

    entry.clicks.push({
      timestamp: new Date(),
      referrer: req.get("Referrer") || "direct",
      location: req.ip,
    });
    await entry.save();

    res.redirect(entry.originalUrl);
  } catch (err) {
    await Log("backend", "fatal", "route", err.message);
    res.status(500).send("Server error");
  }
});

app.listen(8080, () => console.log("Backend running on http://localhost:8080"));
