from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

# Load .env into os.environ so Pydantic AI can find ANTHROPIC_API_KEY
load_dotenv()


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    google_client_id: str
    google_client_secret: str
    google_refresh_token: str
    anthropic_api_key: str = ""
    database_url: str = ""
    classifier_model: str = "anthropic:claude-haiku-5-5"
    agent_model: str = "anthropic:claude-sonnet-5-5"
    poll_interval_seconds: int = 60
    enable_auto_poller: bool = False
    dashboard_username: str = "admin"
    dashboard_password: str = ""


settings = Settings()
