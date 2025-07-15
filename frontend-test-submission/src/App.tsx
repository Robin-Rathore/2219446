// File: frontend/src/App.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Log, setAuthToken } from "../../logging-middleware/index.js";
import {
  TextField,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
} from "@mui/material";

setAuthToken("your-access-token"); // <- Replace with real token

interface ClickData {
  timestamp: string;
  referrer: string;
  location: string;
}

interface ShortURLStats {
  originalUrl: string;
  createdAt: string;
  expiresAt: string;
  totalClicks: number;
  clicks: ClickData[];
}

function App() {
  const [urls, setUrls] = useState([
    { url: "", validity: "", shortcode: "" },
  ]);
  const [results, setResults] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<ShortURLStats[]>([]);

  const handleChange = (index: number, field: string, value: string) => {
    const updated = [...urls];
    updated[index][field] = value;
    setUrls(updated);
  };

  const handleShorten = async () => {
    const newResults: any[] = [];
    for (let entry of urls) {
      if (!entry.url) continue;
      try {
        const payload: any = { url: entry.url };
        if (entry.validity) payload.validity = parseInt(entry.validity);
        if (entry.shortcode) payload.shortcode = entry.shortcode;

        const res = await axios.post("http://localhost:8080/shorturls", payload);
        newResults.push({ ...res.data, originalUrl: entry.url });
        await Log("frontend", "info", "component", `Shortened URL for ${entry.url}`);
      } catch (err) {
        await Log("frontend", "error", "api", `Failed to shorten: ${entry.url}`);
      }
    }
    setResults(newResults);
  };

  const fetchStatistics = async () => {
    const stats: ShortURLStats[] = [];
    for (let r of results) {
      try {
        const res = await axios.get(`http://localhost:8080/shorturls/${r.shortLink.split("/").pop()}`);
        stats.push(res.data);
        await Log("frontend", "info", "api", `Fetched stats for ${r.shortLink}`);
      } catch (err) {
        await Log("frontend", "error", "api", `Failed to fetch stats for ${r.shortLink}`);
      }
    }
    setStatistics(stats);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        URL Shortener
      </Typography>
      <Grid container spacing={2}>
        {urls.map((entry, idx) => (
          <Grid item xs={12} key={idx}>
            <TextField
              label="Long URL"
              value={entry.url}
              onChange={(e) => handleChange(idx, "url", e.target.value)}
              fullWidth
              sx={{ mb: 1 }}
            />
            <TextField
              label="Validity (min)"
              value={entry.validity}
              onChange={(e) => handleChange(idx, "validity", e.target.value)}
              sx={{ mr: 1 }}
            />
            <TextField
              label="Custom Shortcode"
              value={entry.shortcode}
              onChange={(e) => handleChange(idx, "shortcode", e.target.value)}
            />
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 2 }}>
        <Button variant="contained" onClick={handleShorten}>
          Shorten URLs
        </Button>
        <Button variant="outlined" onClick={fetchStatistics} sx={{ ml: 2 }}>
          Load Statistics
        </Button>
      </Box>

      {results.map((r, idx) => (
        <Card key={idx} sx={{ mt: 2 }}>
          <CardContent>
            <Typography>Original URL: {r.originalUrl}</Typography>
            <Typography>Short Link: {r.shortLink}</Typography>
            <Typography>Expires At: {r.expiry}</Typography>
          </CardContent>
        </Card>
      ))}

      {statistics.map((stat, idx) => (
        <Card key={idx} sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6">Stats for: {stat.originalUrl}</Typography>
            <Typography>Total Clicks: {stat.totalClicks}</Typography>
            <Typography>Created At: {stat.createdAt}</Typography>
            <Typography>Expires At: {stat.expiresAt}</Typography>
            <Typography variant="subtitle1">Click Details:</Typography>
            {stat.clicks.map((click, i) => (
              <Box key={i} ml={2}>
                <Typography>- {click.timestamp} | {click.referrer} | {click.location}</Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      ))}
    </Container>
  );
}

export default App;
