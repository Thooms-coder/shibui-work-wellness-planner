from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Shibui API"
    debug: bool = True
    secret_key: str = "replace-me"
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/shibui"
    cors_origins: list[str] = ["http://localhost:3000"]

    model_config = SettingsConfigDict(
        env_prefix="BACKEND_",
        env_file=".env",
        extra="ignore",
    )


settings = Settings()
