"""
Secure Configuration Management
Handles all application settings with validation and security controls
"""
from pydantic_settings import BaseSettings
from pydantic import Field, validator, SecretStr
from typing import List, Optional
from functools import lru_cache
import os


class Settings(BaseSettings):
    """Application settings with validation and security controls"""
    
    # Application Settings
    APP_NAME: str = Field(default="SecureBackendAPI", description="Application name")
    APP_VERSION: str = Field(default="1.0.0", description="Application version")
    DEBUG: bool = Field(default=False, description="Debug mode (NEVER enable in production)")
    ENVIRONMENT: str = Field(default="production", description="Environment: development, staging, production")
    
    # Security Settings
    SECRET_KEY: SecretStr = Field(..., min_length=32, description="Secret key for app security")
    JWT_SECRET_KEY: SecretStr = Field(..., min_length=32, description="JWT signing key")
    JWT_ALGORITHM: str = Field(default="HS256", description="JWT algorithm")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, ge=5, le=120)
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7, ge=1, le=30)
    
    # Encryption Keys (Base64 encoded Fernet keys)
    ENCRYPTION_KEY: SecretStr = Field(..., description="Fernet encryption key for data at rest")
    FIELD_ENCRYPTION_KEY: SecretStr = Field(..., description="Field-level encryption key")
    
    # Database Configuration
    DATABASE_URL: str = Field(..., description="PostgreSQL connection URL")
    DATABASE_POOL_SIZE: int = Field(default=20, ge=5, le=100)
    DATABASE_MAX_OVERFLOW: int = Field(default=10, ge=0, le=200)
    DATABASE_POOL_TIMEOUT: int = Field(default=10, ge=1, le=60)
    DATABASE_POOL_RECYCLE: int = Field(default=3600, ge=300, le=86400)
    
    # Redis Configuration
    REDIS_URL: str = Field(..., description="Redis connection URL")
    REDIS_PASSWORD: Optional[SecretStr] = Field(default=None, description="Redis password")
    REDIS_SSL: bool = Field(default=False, description="Enable SSL for Redis")
    REDIS_MAX_CONNECTIONS: int = Field(default=50, ge=10, le=200)
    
    # Kafka Configuration
    KAFKA_BOOTSTRAP_SERVERS: str = Field(default="localhost:9092", description="Kafka brokers")
    KAFKA_SECURITY_PROTOCOL: str = Field(default="PLAINTEXT", description="Security protocol: PLAINTEXT, SSL, SASL_SSL")
    KAFKA_SASL_MECHANISM: Optional[str] = Field(default=None, description="SASL mechanism: PLAIN, SCRAM-SHA-256, SCRAM-SHA-512")
    KAFKA_SASL_USERNAME: Optional[SecretStr] = Field(default=None, description="Kafka SASL username")
    KAFKA_SASL_PASSWORD: Optional[SecretStr] = Field(default=None, description="Kafka SASL password")
    KAFKA_SSL_CA_LOCATION: Optional[str] = Field(default=None, description="Path to CA certificate")
    KAFKA_SSL_CERT_LOCATION: Optional[str] = Field(default=None, description="Path to client certificate")
    KAFKA_SSL_KEY_LOCATION: Optional[str] = Field(default=None, description="Path to client key")
    KAFKA_CONSUMER_GROUP: str = Field(default="secure-backend-group", description="Consumer group ID")
    KAFKA_TOPIC_PREFIX: str = Field(default="secure-app", description="Topic prefix")
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = Field(default=True, description="Enable rate limiting")
    RATE_LIMIT_PER_MINUTE: int = Field(default=60, ge=1, le=10000)
    RATE_LIMIT_PER_HOUR: int = Field(default=1000, ge=10, le=100000)
    RATE_LIMIT_PER_DAY: int = Field(default=10000, ge=100, le=1000000)
    
    # CORS Settings
    CORS_ORIGINS: List[str] = Field(default=["http://localhost:3000"], description="Allowed CORS origins")
    CORS_ALLOW_CREDENTIALS: bool = Field(default=True, description="Allow credentials in CORS")
    
    # Security Headers
    ENABLE_HSTS: bool = Field(default=True, description="Enable HTTP Strict Transport Security")
    ENABLE_CSP: bool = Field(default=True, description="Enable Content Security Policy")
    ENABLE_X_FRAME_OPTIONS: bool = Field(default=True, description="Enable X-Frame-Options")
    ENABLE_X_CONTENT_TYPE_OPTIONS: bool = Field(default=True, description="Enable X-Content-Type-Options")
    
    # Logging
    LOG_LEVEL: str = Field(default="INFO", description="Logging level: DEBUG, INFO, WARNING, ERROR, CRITICAL")
    LOG_FORMAT: str = Field(default="json", description="Log format: json or text")
    ENABLE_AUDIT_LOG: bool = Field(default=True, description="Enable audit logging")
    
    # MFA Settings
    MFA_ENABLED: bool = Field(default=True, description="Enable Multi-Factor Authentication")
    MFA_ISSUER_NAME: str = Field(default="SecureBackendAPI", description="MFA issuer name")
    
    # Session Settings
    SESSION_TIMEOUT_MINUTES: int = Field(default=30, ge=5, le=480)
    MAX_LOGIN_ATTEMPTS: int = Field(default=5, ge=3, le=10)
    LOCKOUT_DURATION_MINUTES: int = Field(default=15, ge=5, le=120)
    
    # Monitoring
    PROMETHEUS_ENABLED: bool = Field(default=True, description="Enable Prometheus metrics")
    METRICS_PORT: int = Field(default=9090, ge=1024, le=65535)
    
    @validator("ENVIRONMENT")
    def validate_environment(cls, v):
        """Validate environment setting"""
        allowed = ["development", "staging", "production"]
        if v not in allowed:
            raise ValueError(f"ENVIRONMENT must be one of {allowed}")
        return v
    
    @validator("DEBUG")
    def validate_debug(cls, v, values):
        """Ensure DEBUG is never enabled in production"""
        if v and values.get("ENVIRONMENT") == "production":
            raise ValueError("DEBUG cannot be True in production environment")
        return v
    
    @validator("LOG_LEVEL")
    def validate_log_level(cls, v):
        """Validate log level"""
        allowed = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
        if v.upper() not in allowed:
            raise ValueError(f"LOG_LEVEL must be one of {allowed}")
        return v.upper()
    
    @validator("KAFKA_SECURITY_PROTOCOL")
    def validate_kafka_security(cls, v):
        """Validate Kafka security protocol"""
        allowed = ["PLAINTEXT", "SSL", "SASL_PLAINTEXT", "SASL_SSL"]
        if v not in allowed:
            raise ValueError(f"KAFKA_SECURITY_PROTOCOL must be one of {allowed}")
        return v
    
    @validator("CORS_ORIGINS")
    def validate_cors_origins(cls, v, values):
        """Validate CORS origins - be strict in production"""
        if values.get("ENVIRONMENT") == "production":
            # Ensure no wildcard origins in production
            if "*" in v or "http://" in str(v):
                raise ValueError("CORS origins must use HTTPS in production, no wildcards allowed")
        return v
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        # Prevent exposing sensitive data in error messages
        validate_assignment = True


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance
    Uses lru_cache to ensure settings are loaded only once
    """
    return Settings()


# Security utilities
def is_production() -> bool:
    """Check if running in production environment"""
    return get_settings().ENVIRONMENT == "production"


def get_kafka_config() -> dict:
    """Get Kafka configuration dictionary"""
    settings = get_settings()
    config = {
        "bootstrap.servers": settings.KAFKA_BOOTSTRAP_SERVERS,
        "security.protocol": settings.KAFKA_SECURITY_PROTOCOL,
        "group.id": settings.KAFKA_CONSUMER_GROUP,
    }
    
    # Add SASL configuration if needed
    if settings.KAFKA_SECURITY_PROTOCOL in ["SASL_PLAINTEXT", "SASL_SSL"]:
        if settings.KAFKA_SASL_MECHANISM:
            config["sasl.mechanism"] = settings.KAFKA_SASL_MECHANISM
        if settings.KAFKA_SASL_USERNAME:
            config["sasl.username"] = settings.KAFKA_SASL_USERNAME.get_secret_value()
        if settings.KAFKA_SASL_PASSWORD:
            config["sasl.password"] = settings.KAFKA_SASL_PASSWORD.get_secret_value()
    
    # Add SSL configuration if needed
    if settings.KAFKA_SECURITY_PROTOCOL in ["SSL", "SASL_SSL"]:
        if settings.KAFKA_SSL_CA_LOCATION:
            config["ssl.ca.location"] = settings.KAFKA_SSL_CA_LOCATION
        if settings.KAFKA_SSL_CERT_LOCATION:
            config["ssl.certificate.location"] = settings.KAFKA_SSL_CERT_LOCATION
        if settings.KAFKA_SSL_KEY_LOCATION:
            config["ssl.key.location"] = settings.KAFKA_SSL_KEY_LOCATION
    
    return config


def get_redis_config() -> dict:
    """Get Redis configuration dictionary"""
    settings = get_settings()
    config = {
        "url": settings.REDIS_URL,
        "max_connections": settings.REDIS_MAX_CONNECTIONS,
        "decode_responses": True,
        "socket_keepalive": True,
        "socket_timeout": 5,
        "retry_on_timeout": True,
    }
    
    if settings.REDIS_PASSWORD:
        config["password"] = settings.REDIS_PASSWORD.get_secret_value()
    
    if settings.REDIS_SSL:
        config["ssl"] = True
        config["ssl_cert_reqs"] = "required"
    
    return config
