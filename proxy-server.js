const express = require("express");
const cors = require("cors");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = 3001;

app.use(cors()); // Allow all origins
app.use(express.json()); // For JSON bodies
app.use(express.urlencoded({ extended: true })); // For form-encoded bodies

// Proxy handler for all HTTP methods
app.all("/proxy", async (req, res) => {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).json({ error: "Missing 'url' query parameter" });
  }

  try {
    const fetchOptions = {
      method: req.method,
      headers: { ...req.headers },
    };

    // Remove host header to avoid conflict
    delete fetchOptions.headers['host'];

    // For POST/PUT/PATCH methods, include the body
    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method.toUpperCase())) {
      if (req.body && Object.keys(req.body).length > 0) {
        fetchOptions.body = JSON.stringify(req.body);
        fetchOptions.headers["Content-Type"] = "application/json";
      }
    }

    const response = await fetch(targetUrl, fetchOptions);
    const contentType = response.headers.get("content-type") || "";

    // Forward the content type
    res.set("content-type", contentType);

    // Stream the response
    const data = await response.text();
    res.status(response.status).send(data);
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
