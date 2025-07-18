const express = require("express");
const cors = require("cors");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const getRawBody = require("raw-body");

const app = express();
const PORT = 3001;

app.use(cors());

// Custom raw body parser middleware
app.use(async (req, res, next) => {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method.toUpperCase())) {
    try {
      const length = req.headers["content-length"];
      const encoding = "utf-8"; // fallback
      req.rawBody = await getRawBody(req, {
        length,
        limit: "100mb",
        encoding: null,
      }); // no encoding = buffer
    } catch (err) {
      return res.status(400).json({
        error: "Invalid body",
        details: err.message,
      });
    }
  }
  next();
});

// Proxy endpoint
app.all("/proxy", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).json({ error: "Missing 'url' query parameter" });
  }

  try {
    const fetchOptions = {
      method: req.method,
      headers: { ...req.headers },
      body: undefined,
    };

    // Clean problematic headers
    delete fetchOptions.headers["host"];
    delete fetchOptions.headers["content-length"]; // Let node-fetch calculate it

    // Include raw body if available
    console.log("Body:", req.rawBody.toString());
    if (req.rawBody) {
      fetchOptions.body = req.rawBody.toString();
    }

    const response = await fetch(targetUrl, fetchOptions);

    // Forward status and content type
    const contentType = response.headers.get("content-type") || "text/plain";
    res.set("content-type", contentType);
    res.status(response.status);

    // Pipe response body
    const body = await response.buffer();
    res.send(body);
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch from target URL",
      details: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Proxy server running at http://localhost:${PORT}`);
});
