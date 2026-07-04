"""Environment-driven application configuration."""
import logging
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger("medisum.config")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # --- LLM ---
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    # --- Database ---
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB: str = "medisum"

    # --- Security ---
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://localhost:8080"
    RATE_LIMIT_PER_MINUTE: int = 15
    MAX_INPUT_CHARS: int = 20000

    # --- Auth ---
    JWT_SECRET: str = "dev-secret-change-me-in-production-use-64-chars"
    ACCESS_TOKEN_MINUTES: int = 60 * 24  # 1 day
    ADMIN_EMAIL: str = "admin@medisum.ai"
    ADMIN_PASSWORD: str = "admin12345"  # seeded on first run; override via env

    # --- App ---
    LOG_LEVEL: str = "INFO"
    APP_NAME: str = "MediSum AI"

    @property
    def origins_list(self) -> List[str]:
        origins = [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]
        # Always allow wildcard if explicitly set
        if "*" in origins:
            return ["*"]
        return origins


@lru_cache
def get_settings() -> Settings:
    return Settings()
