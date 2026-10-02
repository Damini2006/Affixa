import os

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=os.getenv("ENV") == "development",
        reload_dirs=["app"],
    )
