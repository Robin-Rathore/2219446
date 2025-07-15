import React, { useState } from "react";
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
  CardActions,
  Box,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LaunchIcon from "@mui/icons-material/Launch";

setAuthToken("your-access-token"); // Replace with real token

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
  const [urls, setUrls] = useState([{ url: "", validity: "", shortcode: "" }]);
  const [results, setResults] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<ShortURLStats[]>([]);

  const handleChange = (index: number, field: string, value: string) => {
    const updated = [...urls];
    updated[index][field] = value;
    setUrls(updated);
  };

  const handleAddInput = () => {
    setUrls([...urls, { url: "", validity: "", shortcode: "" }]);
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
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        🚀 URL Shortener Dashboard
      </Typography>

      <Card variant="outlined" sx={{ p: 2, mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🔗 Enter URLs to Shorten
          </Typography>
          <Grid container spacing={2}>
            {urls.map((entry, idx) => (
              <React.Fragment key={idx}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Long URL"
                    value={entry.url}
                    onChange={(e) => handleChange(idx, "url", e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6} sm={2}>
                  <TextField
                    label="Validity (min)"
                    value={entry.validity}
                    onChange={(e) => handleChange(idx, "validity", e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <TextField
                    label="Custom Shortcode"
                    value={entry.shortcode}
                    onChange={(e) => handleChange(idx, "shortcode", e.target.value)}
                    fullWidth
                  />
                </Grid>
              </React.Fragment>
            ))}
          </Grid>
        </CardContent>
        <CardActions>
          <Button onClick={handleShorten} variant="contained" color="primary">
            Shorten URLs
          </Button>
          <Button onClick={fetchStatistics} variant="outlined">
            Load Statistics
          </Button>
          <Tooltip title="Add another URL">
            <IconButton onClick={handleAddInput}>
              <AddIcon />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>

      {results.length > 0 && (
        <>
          <Typography variant="h5" gutterBottom>
            🎉 Shortened Links
          </Typography>
          {results.map((r, idx) => (
            <Card key={idx} sx={{ mb: 2, backgroundColor: "#f1f8e9" }}>
              <CardContent>
                <Typography><strong>Original URL:</strong> {r.originalUrl}</Typography>
                <Typography>
                  <strong>Short Link:</strong>{" "}
                  <a href={r.shortLink} target="_blank" rel="noopener noreferrer">
                    {r.shortLink} <LaunchIcon fontSize="small" />
                  </a>
                </Typography>
                <Typography><strong>Expires At:</strong> {r.expiry}</Typography>
              </CardContent>
            </Card>
          ))}
        </>
      )}

      {statistics.length > 0 && (
        <>
          <Divider sx={{ my: 4 }} />
          <Typography variant="h5" gutterBottom>
            📊 Click Statistics
          </Typography>
          {statistics.map((stat, idx) => (
            <Card key={idx} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {stat.originalUrl}
                </Typography>
                <Typography>Total Clicks: {stat.totalClicks}</Typography>
                <Typography>Created At: {new Date(stat.createdAt).toLocaleString()}</Typography>
                <Typography>Expires At: {new Date(stat.expiresAt).toLocaleString()}</Typography>

                <Typography variant="subtitle1" sx={{ mt: 2 }}>
                  Click Details:
                </Typography>
                {stat.clicks.length > 0 ? (
                  stat.clicks.map((click, i) => (
                    <Box key={i} ml={2}>
                      <Typography variant="body2">
                        • {new Date(click.timestamp).toLocaleString()} | {click.referrer} | {click.location}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" ml={2} color="text.secondary">
                    No click data yet.
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </Container>
  );
}

export default App;
