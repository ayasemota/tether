from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    Attributes:
        DATABASE_URL: MongoDB connection string
        FIREBASE_API_KEY: Firebase Web API key for REST API calls
        FIREBASE_CREDENTIALS_PATH: Path to Firebase service account JSON file
    """
    DATABASE_URL: str
    FIREBASE_API_KEY: str
    FIREBASE_CREDENTIALS_PATH: str
    DB_NAME: str

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

settings = Settings()
