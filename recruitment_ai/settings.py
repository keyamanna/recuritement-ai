"""
recruitment_ai/settings.py
──────────────────────────
WHY THIS FILE IS MODIFIED:
  • Reads secrets from environment variables via python-decouple
    (never hard-codes credentials).
  • Adds Gmail SMTP configuration block.
  • Adds FRONTEND_URL used in email links.
  • Adds REQUIRE_PHONE_OTP flag (default False — set True to enforce).
  • Removes insecure hard-coded SECRET_KEY.
  • DEBUG defaults to False in production.

  Install:  pip install python-decouple
  Create a .env file in the same directory as manage.py (see .env.example).
"""

from pathlib import Path
from decouple import config, Csv   # pip install python-decouple

BASE_DIR = Path(__file__).resolve().parent.parent

# ── Security ──────────────────────────────────────────────────────────────
SECRET_KEY = config("SECRET_KEY")
DEBUG       = config("DEBUG", default=False, cast=bool)
ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="127.0.0.1,localhost", cast=Csv())

# ── Application definition ────────────────────────────────────────────────
INSTALLED_APPS = [
    "corsheaders",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework.authtoken",
    "accounts",
    "jobs",
]

AUTH_USER_MODEL = "accounts.Admin"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
    ],
    # Optional: enable throttling in production
    # "DEFAULT_THROTTLE_CLASSES": [
    #     "rest_framework.throttling.AnonRateThrottle",
    #     "rest_framework.throttling.UserRateThrottle",
    # ],
    # "DEFAULT_THROTTLE_RATES": {
    #     "anon": "20/hour",
    #     "user": "100/hour",
    # },
}

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# CORS — restrict in production to your frontend domain
CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default="http://localhost:5173,http://127.0.0.1:5173",
    cast=Csv(),
)
# Set CORS_ALLOW_ALL_ORIGINS = True only for local dev if needed

ROOT_URLCONF = "recruitment_ai.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "recruitment_ai.wsgi.application"

# ── Database ──────────────────────────────────────────────────────────────
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# ── Password validation ───────────────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ── i18n ──────────────────────────────────────────────────────────────────
LANGUAGE_CODE = "en-us"
TIME_ZONE     = "UTC"
USE_I18N      = True
USE_TZ        = True

# ── Static ────────────────────────────────────────────────────────────────
STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ── Email (Gmail SMTP) ────────────────────────────────────────────────────
EMAIL_BACKEND       = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST          = "smtp.gmail.com"
EMAIL_PORT          = 587
EMAIL_USE_TLS       = True
EMAIL_HOST_USER     = config("EMAIL_HOST_USER")       # your Gmail address
EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD")   # Gmail App Password (16 chars)
DEFAULT_FROM_EMAIL  = config(
    "DEFAULT_FROM_EMAIL",
    default=f"HirePortal <{config('EMAIL_HOST_USER', default='noreply@hireportal.com')}>",
)

# ── Frontend URL (used in reset / verify links) ───────────────────────────
FRONTEND_URL = config("FRONTEND_URL", default="http://localhost:5173")

# ── Custom auth flags ─────────────────────────────────────────────────────
# Set REQUIRE_PHONE_OTP=True in .env to enforce phone OTP after email verify
REQUIRE_PHONE_OTP = config("REQUIRE_PHONE_OTP", default=False, cast=bool)

GROQ_API_KEY = config('GROQ_API_KEY')
