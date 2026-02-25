// api/nrl-proxy.js
// Vercel serverless function (Sydney region) that proxies NRL.com draw page requests.
// Heroku backend calls this instead of NRL.com directly, so the request originates
// from an Australian IP — required for Sportsbet odds to be included in the response.

const https = require('https');

module.exports = async function handler(req, res) {
  const { competition = '111', round, season } = req.query;

  if (!round || !season) {
    return res.status(400).json({ error: 'Missing required query params: round, season' });
  }

  const url = `https://www.nrl.com/draw/?competition=${competition}&round=${round}&season=${season}`;

  try {
    const html = await fetchHtml(url);

    // The NRL.com page is server-side rendered Vue. Fixture data (including odds) is
    // embedded as a JSON string in the q-data attribute of <div id="vue-draw">.
    // In HTML, double quotes inside attribute values are encoded as &quot;, so we
    // can safely slice from q-data=" to the next literal " to get the full value.
    const qDataStart = html.indexOf('q-data="');
    if (qDataStart === -1) {
      return res.status(502).json({ error: 'Could not find q-data on NRL.com page — page structure may have changed' });
    }

    const valueStart = qDataStart + 8; // length of 'q-data="'
    const valueEnd = html.indexOf('"', valueStart);
    const encodedJson = html.slice(valueStart, valueEnd);

    // Decode HTML entities back to plain JSON characters
    const decoded = encodedJson
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');

    const data = JSON.parse(decoded);
    const fixtures = data.fixtures || [];

    // Cache for 60s at the CDN edge to avoid hammering NRL.com
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
    return res.status(200).json({ fixtures });

  } catch (err) {
    return res.status(502).json({ error: `Proxy fetch failed: ${err.message}` });
  }
};

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-AU,en;q=0.9',
      },
    };

    https.get(url, options, (resp) => {
      // Follow redirects
      if (resp.statusCode >= 300 && resp.statusCode < 400 && resp.headers.location) {
        fetchHtml(resp.headers.location).then(resolve).catch(reject);
        return;
      }
      if (resp.statusCode !== 200) {
        reject(new Error(`NRL.com returned HTTP ${resp.statusCode}`));
        return;
      }
      let body = '';
      resp.on('data', (chunk) => { body += chunk; });
      resp.on('end', () => resolve(body));
      resp.on('error', reject);
    }).on('error', reject);
  });
}
