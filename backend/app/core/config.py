from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    gemini_api_key: str = ""
    gemini_model: str = "gemini-1.5-flash"

    database_url: str = "postgresql+psycopg://uniguard:uniguard@postgres:5432/uniguard"

    chroma_host: str = "chromadb"
    chroma_port: int = 8000

    cors_origins: str = "http://localhost:5173"

    security_mode: str = "protected"
    enable_input_detection: bool = True
    enable_document_isolation: bool = True
    enable_tool_authorization: bool = True
    enable_output_filter: bool = True

    uniguard_internal_secret: str = "UNIGUARD-DEMO-SECRET-2026"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    model_config = {"env_file": ".env", "case_sensitive": False}


settings = Settings()
