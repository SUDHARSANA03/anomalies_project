import os
import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(
        "src.backend.app:app",
        host="0.0.0.0",
        port=port,
        reload=False,
        workers=1
    )
