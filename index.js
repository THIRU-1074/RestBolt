document.getElementById('sendBtn').addEventListener('click', async () => {
  const method = document.getElementById('method').value;
  const url = document.getElementById('url').value.trim();
  const contentType = document.getElementById('contentType').value;
  const bodyText = document.getElementById('body').value.trim();

  const headersInputs = document.querySelectorAll('#headersContainer .flex');
  const headers = {};

  // Collect headers
  headersInputs.forEach(pair => {
    const key = pair.children[0].value.trim();
    const value = pair.children[1].value.trim();
    if (key) headers[key] = value;
  });

  // Set Content-Type header (override if user hasn't already)
  if (!headers['Content-Type'] && (method !== 'GET' && method !== 'DELETE')) {
    headers['Content-Type'] = contentType;
  }

  // Prepare fetch options
  const options = {
    method,
    headers
  };

  // Include body if necessary
  if (method !== 'GET' && method !== 'DELETE' && bodyText) {
    if (headers['Content-Type'] === 'application/json') {
      try {
        options.body = JSON.stringify(JSON.parse(bodyText));
      } catch (err) {
        alert('Invalid JSON in request body!');
        return;
      }
    } else {
      options.body = bodyText;
    }
  }

  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';

    // Show status
    document.getElementById('responseStatus').textContent = `Status: ${res.status} ${res.statusText}`;

    // Try to parse response as JSON, fallback to text
    let body;
    if (contentType.includes('application/json')) {
      const json = await res.json();
      body = JSON.stringify(json, null, 2);
    } else {
      body = await res.text();
    }

    document.getElementById('responseBody').textContent = body;
  } catch (err) {
    document.getElementById('responseStatus').textContent = 'Error';
    document.getElementById('responseBody').textContent = err.toString();
  }
});
