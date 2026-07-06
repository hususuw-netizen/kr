const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY || "";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request too large"));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

async function handleTranslate(req, res) {
  if (!GOOGLE_TRANSLATE_API_KEY) {
    sendJson(res, 500, {
      error: "missing_api_key",
      message: "隢?閮剖? GOOGLE_TRANSLATE_API_KEY??,
    });
    return;
  }

  let payload;
  try {
    payload = JSON.parse(await readBody(req));
  } catch {
    sendJson(res, 400, {
      error: "invalid_json",
      message: "隢??澆??航炊??,
    });
    return;
  }

  const text = String(payload.text || "").trim();
  if (!text) {
    sendJson(res, 400, {
      error: "missing_text",
      message: "隢?頛詨???桀???,
    });
    return;
  }

  try {
    const url = new URL("https://translation.googleapis.com/language/translate/v2");
    url.searchParams.set("key", GOOGLE_TRANSLATE_API_KEY);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        q: text,
        source: "ko",
        target: "zh-TW",
        format: "text",
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      sendJson(res, response.status, {
        error: "translate_failed",
        message: result?.error?.message || "Google 蝧餉陌憭望???,
      });
      return;
    }

    sendJson(res, 200, {
      translatedText: result?.data?.translations?.[0]?.translatedText || "",
    });
  } catch {
    sendJson(res, 500, {
      error: "network_error",
      message: "?⊥??????Google 蝧餉陌????,
    });
  }
}

function serveFile(res, pathname) {
  const relativePath = pathname === "/" ? "/write.html" : pathname;
  const filePath = path.join(ROOT, relativePath);

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[extension] || "application/octet-stream",
    });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "POST" && url.pathname === "/api/translate") {
    await handleTranslate(req, res);
    return;
  }

  if (req.method === "GET") {
    serveFile(res, url.pathname);
    return;
  }

  res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Method not allowed");
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
