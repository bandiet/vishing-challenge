#!/usr/bin/env python3
"""Local server with caching switched off: python3 serve.py [port]"""
import http.server
import os
import sys


class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def handle(self):
        # the browser drops music downloads halfway on every reload; that is not an error
        try:
            super().handle()
        except (BrokenPipeError, ConnectionResetError):
            pass


class Server(http.server.ThreadingHTTPServer):
    # the page, its scripts and three music files all ask at once; the default queue of 5 drops some
    request_queue_size = 64
    daemon_threads = True


port = int(sys.argv[1]) if len(sys.argv) > 1 else 8814
os.chdir(os.path.dirname(os.path.abspath(__file__)))
print(f'Vishing Challenge läuft on http://127.0.0.1:{port}', flush=True)
Server(('127.0.0.1', port), NoCache).serve_forever()
