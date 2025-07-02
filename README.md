# RestBolt
REST API Testing Site
https://reqres.in

### 🌐 CORS Handling: Proxy-Based Solutions

#### 🔁 1. Custom Backend Proxy (Node.js + Express)
Used a backend proxy pattern to bypass browser CORS restrictions and expose full response headers to the frontend.

```js
// Client → My Backend → External API
app.get('/proxy', async (req, res) => {
  const apiRes = await fetch('https://external-api.com/data');
  const body = await apiRes.text();

  // Forward specific headers to frontend
  res.set('X-Custom-Header', apiRes.headers.get('X-Custom-Header'));
  res.send(body);
});
```

#### 🧪 2. Temporary Testing with Public CORS Proxy
Utilized a public CORS proxy (`cors-anywhere`) to test access to third-party APIs with restricted headers.

```js
const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
const targetUrl = 'https://example.com/api';

fetch(proxyUrl + targetUrl)
  .then(res => res.text())
  .then(console.log);
```

Yet to Done:

1. Bulk URL edits
2. Save requests in local storage
3. Button to copy response and export as a file
4. Auth helpers
5. Timing info
6. Support binary data (MIME) 
