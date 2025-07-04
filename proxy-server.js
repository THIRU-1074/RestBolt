const express = require("express");
const cors = require("cors");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = 3001;

app.use(cors()); // Allow all origins
app.use(express.json());

app.get("/proxy", async (req, res) => {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).json({ error: "Missing url query parameter" });
  }

  try {
    const response = await fetch(targetUrl);
    const data = await response.text(); // or .json() for JSON responses
    res.send(data);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch from target URL", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Proxy server running at http://localhost:${PORT}`);
});
