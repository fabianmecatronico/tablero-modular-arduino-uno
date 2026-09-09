"""Servidor local mínimo para presentar la PWA sin instalar dependencias."""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os
import webbrowser


ROOT = Path(__file__).resolve().parent
PORT = int(os.environ.get("TABLERO_PORT", "8080"))


class Handler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".webmanifest": "application/manifest+json",
        ".js": "text/javascript; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".svg": "image/svg+xml",
    }

    def end_headers(self):
        if self.path.endswith("/sw.js") or self.path == "/sw.js":
            self.send_header("Cache-Control", "no-cache")
            self.send_header("Service-Worker-Allowed", "/")
        super().end_headers()


if __name__ == "__main__":
    os.chdir(ROOT)
    address = f"http://127.0.0.1:{PORT}/"
    print(f"Tablero Modular Arduino disponible en {address}")
    print("Mantén esta ventana abierta. Usa Ctrl+C para detener el servidor.")
    webbrowser.open(address)
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
