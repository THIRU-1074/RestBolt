# RestBolt

REST API Testing Site
https://reqres.in

### 🌐 CORS Handling: Proxy-Based Solutions

#### 🔁 1. Custom Backend Proxy (Node.js + Express)

Used a backend proxy pattern to bypass browser CORS restrictions and expose full response headers to the frontend.

```js
// Client → My Backend → External API
app.get("/proxy", async (req, res) => {
  const apiRes = await fetch("https://external-api.com/data");
  const body = await apiRes.text();

  // Forward specific headers to frontend
  res.set("X-Custom-Header", apiRes.headers.get("X-Custom-Header"));
  res.send(body);
});
```

#### 🧪 2. Temporary Testing with Public CORS Proxy

Utilized a public CORS proxy (`cors-anywhere`) to test access to third-party APIs with restricted headers.

```js
const proxyUrl = "https://cors-anywhere.herokuapp.com/";
const targetUrl = "https://example.com/api";

fetch(proxyUrl + targetUrl)
  .then((res) => res.text())
  .then(console.log);
```

Yet to Done:

1. Image encoder
2. cURL Preview
3. Auto Time Insertion
4. Support binary data (MIME)
5. Button to export request and response as a file
6. Timing info
7. Bulk URL edits
