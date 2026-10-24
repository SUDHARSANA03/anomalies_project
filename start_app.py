"""
Startup script to run both backend and frontend services
Hypersense AI - Full Stack Launcher
"""
import subprocess
import sys
import time
import os

def start_backend():
    """Start the FastAPI backend server"""
    print(" Starting Backend Server on http://localhost:8000")
    backend_process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "src.backend.app:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
    )
    return backend_process

def start_frontend():
    """Start the Vite React frontend on http://localhost:5173"""
    print(" Starting React Vite Frontend Server on http://localhost:5173")
    frontend_process = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd="Frontend",
        shell=True
    )
    return frontend_process

def main():
    print("=" * 60)
    print(" HyperSense AI - Spectral Intelligence Full Stack Launcher")
    print("=" * 60)
    
    os.makedirs("data/user_uploads", exist_ok=True)
    os.makedirs("data/Pine_Dataset", exist_ok=True)
    
    try:
        backend = start_backend()
        time.sleep(2)
        
        frontend = start_frontend()
        time.sleep(2)
        
        print("\n" + "=" * 60)
        print(" Both services are running!")
        print("=" * 60)
        print(" Backend API:  http://localhost:8000")
        print(" Frontend UI:  http://localhost:5173")
        print(" Database:     data/hypersense.db (SQLite)")
        print("=" * 60)
        print("\nPress Ctrl+C to stop all services\n")
        
        while True:
            time.sleep(1)
            if backend.poll() is not None:
                print("  Backend stopped unexpectedly")
                break
            if frontend.poll() is not None:
                print("  Frontend stopped unexpectedly")
                break
                
    except KeyboardInterrupt:
        print("\n\n Shutting down services...")
        backend.terminate()
        frontend.terminate()
        print(" Services terminated successfully")

if __name__ == "__main__":
    main()
