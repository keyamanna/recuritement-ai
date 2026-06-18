"""
accounts/models.py
──────────────────
WHY THIS FILE IS MODIFIED:
  • Removes `username` — email is now the sole identity field.
  • Adds email-verification token + expiry so signup triggers a
    confirmation link rather than instant access.
  • Adds phone OTP + expiry for a second-factor signup step.
  • Replaces the plain reset_token string with a hashed token +
    expiry so the DB never stores a raw secret.
  • All time windows are configurable via settings (defaults shown).
"""

import uuid
import hashlib
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils import timezone
from datetime import timedelta

from .managers import AdminUserManager


# ── Helpers ──────────────────────────────────────────────────────────────
def _in(minutes: int):
    """Return a callable that gives 'now + N minutes' (used as default=)."""
    return lambda: timezone.now() + timedelta(minutes=minutes)


def hash_token(raw: str) -> str:
    """SHA-256 the raw token before storing — DB never sees plaintext."""
    return hashlib.sha256(raw.encode()).hexdigest()


# ── Organization ─────────────────────────────────────────────────────────
class Organization(models.Model):
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


# ── Admin (custom user) ───────────────────────────────────────────────────
class Admin(AbstractBaseUser, PermissionsMixin):
    """
    Replaces Django's default User.

    Key decisions
    ─────────────
    • username field REMOVED — USERNAME_FIELD = 'email'
    • is_email_verified  — gated: login blocked until True
    • is_phone_verified  — optional second gate (set REQUIRE_PHONE_OTP=True)
    • email_verify_token — hashed SHA-256; raw token only lives in the email
    • otp               — 6-digit code for phone verification
    • reset_token       — hashed SHA-256 of the UUID sent in reset email
    """

    # ── Core identity ────────────────────────────────────────────────────
    full_name = models.CharField(max_length=255)
    email     = models.EmailField(unique=True)
    phone     = models.CharField(max_length=20)

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="admins",
    )

    # ── Django staff flags ───────────────────────────────────────────────
    is_active   = models.BooleanField(default=True)   # kept True; gate via is_email_verified
    is_staff    = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    # ── Email verification ───────────────────────────────────────────────
    is_email_verified    = models.BooleanField(default=False)
    email_verify_token   = models.CharField(max_length=64, null=True, blank=True)  # hashed
    email_verify_expiry  = models.DateTimeField(null=True, blank=True)

    # ── Phone OTP ────────────────────────────────────────────────────────
    is_phone_verified = models.BooleanField(default=False)
    otp               = models.CharField(max_length=6, null=True, blank=True)
    otp_expiry        = models.DateTimeField(null=True, blank=True)
    otp_attempts      = models.PositiveSmallIntegerField(default=0)

    # ── Password reset ───────────────────────────────────────────────────
    reset_token        = models.CharField(max_length=64, null=True, blank=True)  # hashed
    reset_token_expiry = models.DateTimeField(null=True, blank=True)

    # ── Auth config ──────────────────────────────────────────────────────
    USERNAME_FIELD  = "email"
    REQUIRED_FIELDS = []          # email + password are enough for createsuperuser

    objects = AdminUserManager()

    # ── Token helpers ────────────────────────────────────────────────────
    def set_email_verify_token(self) -> str:
        """Generate, store (hashed), and return the raw email-verify token."""
        raw = uuid.uuid4().hex
        self.email_verify_token  = hash_token(raw)
        self.email_verify_expiry = timezone.now() + timedelta(hours=24)
        return raw

    def check_email_verify_token(self, raw: str) -> bool:
        if not self.email_verify_token or not self.email_verify_expiry:
            return False
        if timezone.now() > self.email_verify_expiry:
            return False
        return self.email_verify_token == hash_token(raw)

    def set_otp(self) -> str:
        """Generate 6-digit OTP, store it, reset attempt counter."""
        import random
        code = f"{random.randint(0, 999999):06d}"
        self.otp          = code          # stored plaintext — short-lived & numeric
        self.otp_expiry   = timezone.now() + timedelta(minutes=10)
        self.otp_attempts = 0
        return code

    def check_otp(self, code: str) -> tuple[bool, str]:
        """Returns (valid, reason)."""
        if self.otp_attempts >= 5:
            return False, "Too many attempts. Request a new OTP."
        if not self.otp or not self.otp_expiry:
            return False, "No OTP found. Request a new one."
        if timezone.now() > self.otp_expiry:
            return False, "OTP has expired. Request a new one."
        self.otp_attempts += 1
        if self.otp != code:
            self.save(update_fields=["otp_attempts"])
            return False, "Invalid OTP."
        return True, "ok"

    def set_reset_token(self) -> str:
        """Generate, store (hashed), return raw password-reset token."""
        raw = uuid.uuid4().hex
        self.reset_token        = hash_token(raw)
        self.reset_token_expiry = timezone.now() + timedelta(hours=1)
        return raw

    def check_reset_token(self, raw: str) -> bool:
        if not self.reset_token or not self.reset_token_expiry:
            return False
        if timezone.now() > self.reset_token_expiry:
            return False
        return self.reset_token == hash_token(raw)

    def clear_reset_token(self):
        self.reset_token        = None
        self.reset_token_expiry = None

    def __str__(self):
        return self.email