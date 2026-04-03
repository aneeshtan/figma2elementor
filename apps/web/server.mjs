import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

import { convertFigmaSelectionToElementor } from "../../packages/converter/src/index.js";
import {
  createApiKey,
  getBootstrapData,
  getJobForToken,
  listJobsForToken,
  recordConversionJob
} from "../../packages/platform/src/store.js";

const currentDir = fileURLToPath(new URL(".", import.meta.url));
const rootDir = join(currentDir);
const workspaceDir = join(currentDir, "../..");
const examplePath = join(currentDir, "../../examples/landing-page.figjson");
const outputPath = join(currentDir, "../../examples/hero-elementor.json");
const seedPath = join(currentDir, "../../data/platform.seed.json");
const dataPath = process.env.DATA_PATH
  ? normalize(join(workspaceDir, process.env.DATA_PATH))
  : join(currentDir, "../../data/platform.local.json");
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "127.0.0.1";

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function jsonResponse(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Access-Control-Allow-Headers": "Content-Type, x-api-key, x-client-name, x-origin-app",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json; charset=utf-8"
  });
  res.end(JSON.stringify(payload, null, 2));
}

function extractApiKey(req, url, payload = null) {
  const headerToken = req.headers["x-api-key"];

  if (typeof headerToken === "string" && headerToken.trim()) {
    return headerToken.trim();
  }

  if (payload && typeof payload.apiKey === "string" && payload.apiKey.trim()) {
    return payload.apiKey.trim();
  }

  const queryToken = url.searchParams.get("apiKey");
  return queryToken && queryToken.trim() ? queryToken.trim() : null;
}

async function readRequestBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (!chunks.length) {
    return null;
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function serveStaticFile(res, pathname) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const safePath = normalize(requestedPath).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = join(rootDir, safePath);

  if (!filePath.startsWith(rootDir)) {
    res.writeHead(403, {
      "Content-Type": "text/plain; charset=utf-8"
    });
    res.end("Forbidden");
    return;
  }

  const extension = extname(filePath);
  let content;

  try {
    content = await readFile(filePath);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      jsonResponse(res, 404, {
        ok: false,
        error: `Route not found: ${pathname}`
      });
      return;
    }

    throw error;
  }

  res.writeHead(200, {
    "Content-Type": mimeTypes[extension] || "application/octet-stream"
  });
  res.end(content);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const jobDetailMatch = url.pathname.match(/^\/api\/jobs\/([^/]+)$/);
  const jobDownloadMatch = url.pathname.match(/^\/api\/jobs\/([^/]+)\/download$/);

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Headers": "Content-Type, x-api-key, x-client-name, x-origin-app",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Origin": "*"
    });
    res.end();
    return;
  }

  try {
    if (url.pathname === "/api/convert" && req.method !== "POST") {
      jsonResponse(res, 405, {
        ok: false,
        error: "Method not allowed. Use POST /api/convert with JSON body and x-api-key header."
      });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/health") {
      jsonResponse(res, 200, {
        ok: true,
        service: "figma2element-local-api",
        mode: "platform"
      });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/platform/bootstrap") {
      const payload = await getBootstrapData(dataPath, seedPath);
      jsonResponse(res, 200, payload);
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/example") {
      const example = JSON.parse(await readFile(examplePath, "utf8"));
      const output = convertFigmaSelectionToElementor(example);

      jsonResponse(res, 200, output);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/keys") {
      const payload = (await readRequestBody(req)) || {};
      const key = await createApiKey(dataPath, seedPath, payload.name || "Plugin Key");
      jsonResponse(res, 201, key);
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/jobs") {
      const token = extractApiKey(req, url);
      const jobs = await listJobsForToken(dataPath, seedPath, token);
      jsonResponse(res, 200, jobs);
      return;
    }

    if (req.method === "GET" && jobDetailMatch) {
      const token = extractApiKey(req, url);
      const payload = await getJobForToken(dataPath, seedPath, token, jobDetailMatch[1]);
      jsonResponse(res, 200, payload);
      return;
    }

    if (req.method === "GET" && jobDownloadMatch) {
      const token = extractApiKey(req, url);
      const payload = await getJobForToken(dataPath, seedPath, token, jobDownloadMatch[1]);

      res.writeHead(200, {
        "Content-Disposition": `attachment; filename="${payload.job.frameName.replace(/[^a-z0-9_-]+/gi, "-").toLowerCase() || "elementor-template"}.json"`,
        "Content-Type": "application/json; charset=utf-8"
      });
      res.end(JSON.stringify(payload.job.template, null, 2));
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/convert") {
      const payload = await readRequestBody(req);
      const token = extractApiKey(req, url, payload);
      const source = payload && payload.source ? payload.source : payload;
      const output = convertFigmaSelectionToElementor(source);
      const job = await recordConversionJob({
        dataPath,
        seedPath,
        rootDir: workspaceDir,
        token,
        source: output.source,
        result: output,
        clientName: req.headers["x-client-name"] || payload?.clientName || "web-playground",
        origin: req.headers["x-origin-app"] || payload?.origin || "web"
      });

      await writeFile(outputPath, `${JSON.stringify(output.template, null, 2)}\n`, "utf8");

      jsonResponse(res, 200, {
        ...output,
        job: job.job,
        account: job.account,
        plan: job.plan
      });
      return;
    }

    await serveStaticFile(res, url.pathname);
  } catch (error) {
    const statusCode = error instanceof Error && "statusCode" in error ? error.statusCode : 500;
    jsonResponse(res, statusCode, {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

server.listen(port, host, () => {
  console.log(`Figma2Element running at http://${host}:${port}`);
});
