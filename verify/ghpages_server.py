"""Minimal stand-in for GitHub Pages: static files, and on a miss inside a
project directory, serve that project's 404.html with a 404 status."""
import http.server, os, socketserver, sys

ROOT = os.environ.get("SERVE_ROOT", "/tmp/serve")

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def send_error(self, code, message=None, explain=None):
        if code == 404:
            parts = [p for p in self.path.split("?")[0].split("/") if p]
            if parts:
                custom = os.path.join(ROOT, parts[0], "404.html")
                if os.path.isfile(custom):
                    body = open(custom, "rb").read()
                    self.send_response(404)
                    self.send_header("Content-Type", "text/html; charset=utf-8")
                    self.send_header("Content-Length", str(len(body)))
                    self.end_headers()
                    self.wfile.write(body)
                    return
        super().send_error(code, message, explain)

    def log_message(self, *a):
        pass

socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("127.0.0.1", int(sys.argv[1])), Handler) as httpd:
    httpd.serve_forever()
