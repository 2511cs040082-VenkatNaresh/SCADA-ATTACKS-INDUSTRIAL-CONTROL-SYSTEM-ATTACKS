#!/usr/bin/env python3
import urllib.request
import sys
import os

port = os.environ.get("PORT", "8080")
url = f"http://127.0.0.1:{port}/health"

try:
    with urllib.request.urlopen(url, timeout=3) as response:
        if response.status == 200:
            sys.exit(0)
        else:
            print(f"Health check failed with status {response.status}")
            sys.exit(1)
except Exception as e:
    print(f"Health check exception: {e}")
    sys.exit(1)
