import { createReadStream, existsSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { createServer } from "node:http";

const root = resolve(".");
const port = Number(process.argv[2] || 8080);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png"
};

function resolvePath(url) {
  const cleanUrl = new URL(url, `http://localhost:${port}`);
  const pathname = decodeURIComponent(cleanUrl.pathname);
  const requested = normalize(join(root, pathname === "/" ? "index.html" : pathname));
  return requested.startsWith(root) ? requested : null;
}

createServer((request, response) => {
  const filePath = resolvePath(request.url || "/");

  if (!filePath || !existsSync(filePath)) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "content-type": types[extname(filePath)] || "application/octet-stream",
    "cache-control": "no-cache"
  });
  createReadStream(filePath).pipe(response);
}).listen(port, "0.0.0.0", () => {
  console.log(`Pocket Pet PWA running at http://localhost:${port}`);
});
