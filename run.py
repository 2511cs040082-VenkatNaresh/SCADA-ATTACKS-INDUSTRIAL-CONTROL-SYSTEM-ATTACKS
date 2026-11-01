#!/usr/bin/env python3
"""
==============================================================================
ICS-SHIELD — ONE-CLICK APPLICATION LAUNCHER (Python)
Real-Time SCADA & Industrial Control System Attack Detection & Defense Platform
==============================================================================
This script automatically:
  1. Validates Node.js and NPM environment
  2. Ensures dependencies are installed in backend and frontend
  3. Clears any stale background processes on ports 5050 & 3000
  4. Launches Backend Server (Port 5050) & Frontend UI
  5. Automatically opens the live application in your default web browser
  6. Handles graceful shutdown (Ctrl+C) without leaving orphan processes
==============================================================================
"""

import os
import sys
import time
import socket
import signal
import shutil
import subprocess
import webbrowser
from threading import Thread

# Configuration & Ports
BACKEND_PORT = 5050
FRONTEND_PORT = 3050
FRONTEND_URL = f"http://localhost:{FRONTEND_PORT}"
BACKEND_URL = f"http://localhost:{BACKEND_PORT}"

# Directory Paths
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")
WEBSITE_DIR = os.path.join(ROOT_DIR, "website")
WEBSITE_PORT = 4000
WEBSITE_URL = f"http://localhost:{WEBSITE_PORT}"

processes = []


def print_banner(is_website=False):
    print("==============================================================================")
    if is_website:
        print(" 🌐  ICS-SHIELD — Public Software Distribution Platform Website")
        print("==============================================================================")
        print(f" Root Directory : {ROOT_DIR}")
        print(f" Website URL    : {WEBSITE_URL}")
    else:
        print(" 🛡️  ICS-SHIELD — Real-Time SCADA Attack Detection & Defense Platform")
        print("==============================================================================")
        print(f" Root Directory : {ROOT_DIR}")
        print(f" Backend API    : {BACKEND_URL}")
        print(f" Frontend UI    : {FRONTEND_URL}")
    print("==============================================================================\n")


def is_port_open(host, port):
    """Check if a TCP port is open and accepting connections."""
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(1.0)
    try:
        s.connect((host, port))
        s.close()
        return True
    except (socket.error, socket.timeout):
        return False


def free_port_if_occupied(port):
    """Ensure a port is free by terminating any process occupying it."""
    if not is_port_open("127.0.0.1", port):
        return

    print(f"🔄 Port {port} is currently occupied by a background process. Clearing port {port}...")
    try:
        if sys.platform == "win32":
            res = subprocess.run(f"netstat -ano | findstr :{port}", shell=True, capture_output=True, text=True)
            for line in res.stdout.strip().splitlines():
                parts = line.split()
                if len(parts) >= 5 and "LISTENING" in parts:
                    pid = parts[-1]
                    subprocess.run(f"taskkill /F /PID {pid}", shell=True, capture_output=True)
        else:
            # macOS / Linux
            subprocess.run(f"kill -9 $(lsof -t -i:{port}) 2>/dev/null", shell=True, capture_output=True)
            subprocess.run(["fuser", "-k", f"{port}/tcp"], capture_output=True)
    except Exception as e:
        print(f"⚠️ Warning clearing port {port}: {e}")

    time.sleep(1)


def wait_for_port(host, port, timeout=30):
    """Wait until a port is open."""
    start = time.time()
    while time.time() - start < timeout:
        if is_port_open(host, port):
            return True
        time.sleep(0.5)
    return False


def stream_output(process, prefix):
    """Stream stdout/stderr from subprocess to terminal with prefix."""
    try:
        for line in iter(process.stdout.readline, ''):
            if line:
                print(f"[{prefix}] {line.strip()}")
    except (ValueError, Exception):
        pass


def check_prerequisites():
    """Verify Node.js and npm are available."""
    if not shutil.which("node"):
        print("❌ Error: Node.js is not installed or not in PATH.")
        sys.exit(1)
    if not shutil.which("npm"):
        print("❌ Error: npm is not installed or not in PATH.")
        sys.exit(1)

    print("✅ Prerequisites verified (Node.js & npm available).")


def check_and_install_dependencies():
    """Ensure node_modules exist in backend and frontend."""
    backend_modules = os.path.join(BACKEND_DIR, "node_modules")
    frontend_modules = os.path.join(FRONTEND_DIR, "node_modules")

    if not os.path.exists(backend_modules):
        print("📦 Installing backend dependencies (npm install)...")
        subprocess.run(["npm", "install"], cwd=BACKEND_DIR, check=True)

    if not os.path.exists(frontend_modules):
        print("📦 Installing frontend dependencies (npm install)...")
        subprocess.run(["npm", "install"], cwd=FRONTEND_DIR, check=True)


def cleanup_processes(signum=None, frame=None):
    """Gracefully terminate spawned backend and frontend processes."""
    print("\n\n==============================================================================")
    print(" 🛑 Shutting down ICS-SHIELD application servers...")
    print("==============================================================================")

    for p in processes:
        if p.poll() is None:
            try:
                if sys.platform == "win32":
                    subprocess.run(["taskkill", "/F", "/T", "/PID", str(p.pid)], capture_output=True)
                else:
                    p.terminate()
                    p.wait(timeout=3)
            except Exception:
                try:
                    p.kill()
                except Exception:
                    pass

    print("✅ All processes stopped cleanly. Goodbye!")
    sys.exit(0)


def main():
    is_website_mode = "--website" in sys.argv or "-w" in sys.argv or "website" in sys.argv
    print_banner(is_website=is_website_mode)

    # Register signal handlers for clean exit
    signal.signal(signal.SIGINT, cleanup_processes)
    signal.signal(signal.SIGTERM, cleanup_processes)

    # 1. Preflight Checks
    check_prerequisites()

    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    npx_cmd = "npx.cmd" if sys.platform == "win32" else "npx"

    if is_website_mode:
        free_port_if_occupied(WEBSITE_PORT)
        print(f"\n🚀 Launching ICS-SHIELD Website Platform (Port {WEBSITE_PORT})...")
        website_proc = subprocess.Popen(
            [npx_cmd, "vite", "--port", str(WEBSITE_PORT), "--host", "0.0.0.0"],
            cwd=WEBSITE_DIR,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1
        )
        processes.append(website_proc)
        Thread(target=stream_output, args=(website_proc, "WEBSITE"), daemon=True).start()

        print(f"\n⏳ Waiting for website server on {WEBSITE_URL}...")
        if wait_for_port("127.0.0.1", WEBSITE_PORT, timeout=20):
            print(f"  └─ ✅ Website Platform ready on {WEBSITE_URL}")
        else:
            print("  └─ ⚠️ Website port check timed out.")

        print(f"\n🌐 Opening Website in your browser ({WEBSITE_URL})...")
        time.sleep(1)
        try:
            webbrowser.open(WEBSITE_URL)
        except Exception as e:
            print(f"⚠️ Could not open browser automatically: {e}")

        print("\n==============================================================================")
        print(f" 🟢 WEBSITE PLATFORM IS LIVE AT: {WEBSITE_URL}")
        print(" Press Ctrl+C to stop the website server.")
        print("==============================================================================\n")

        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            cleanup_processes()
        return

    check_and_install_dependencies()

    # 2. Port Cleanup
    free_port_if_occupied(3000)
    free_port_if_occupied(BACKEND_PORT)
    free_port_if_occupied(FRONTEND_PORT)

    # 3. Start Backend Process
    print("\n🚀 Starting Backend REST API & WebSocket Server (Port 5050)...")
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    npx_cmd = "npx.cmd" if sys.platform == "win32" else "npx"

    backend_proc = subprocess.Popen(
        [npm_cmd, "start"],
        cwd=BACKEND_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    processes.append(backend_proc)

    # Thread to log backend output
    Thread(target=stream_output, args=(backend_proc, "BACKEND"), daemon=True).start()

    # 4. Start Frontend Process
    print("🚀 Starting Frontend Vite Dev Server (Port 3000)...")
    frontend_proc = subprocess.Popen(
        [npx_cmd, "vite", "--port", str(FRONTEND_PORT), "--host", "0.0.0.0"],
        cwd=FRONTEND_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    processes.append(frontend_proc)

    # Thread to log frontend output
    Thread(target=stream_output, args=(frontend_proc, "FRONTEND"), daemon=True).start()

    # 5. Wait for Readiness
    print("\n⏳ Waiting for backend and frontend servers to be ready...")

    backend_ready = wait_for_port("127.0.0.1", BACKEND_PORT, timeout=20)
    if backend_ready:
        print("  └─ ✅ Backend Server ready on http://localhost:5050")
    else:
        print("  └─ ⚠️ Backend port check timed out.")

    frontend_ready = wait_for_port("127.0.0.1", FRONTEND_PORT, timeout=20)
    if frontend_ready:
        target_launch_url = FRONTEND_URL
        print(f"  └─ ✅ Frontend UI ready on {FRONTEND_URL}")
    else:
        target_launch_url = BACKEND_URL
        print(f"  └─ ℹ️ Using Backend Unified UI on {BACKEND_URL}")

    # 6. Open Browser
    print(f"\n🌐 Opening ICS-SHIELD in your browser ({target_launch_url})...")
    time.sleep(1)
    try:
        webbrowser.open(target_launch_url)
    except Exception as e:
        print(f"⚠️ Could not open browser automatically: {e}")

    print("\n==============================================================================")
    print(f" 🟢 ICS-SHIELD IS LIVE AT: {target_launch_url}")
    print(" (Alternative Backend & API Endpoint: http://localhost:5050)")
    print(" Press Ctrl+C to stop all servers.")
    print("==============================================================================\n")

    # Keep main thread alive
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        cleanup_processes()


if __name__ == "__main__":
    main()
