"""
accounts/managers.py
────────────────────
WHY THIS FILE IS NEEDED (NEW):
  AbstractBaseUser requires a custom manager.  Django's default
  UserManager assumes a `username` field; ours uses `email`.
"""

from django.contrib.auth.base_user import BaseUserManager


class AdminUserManager(BaseUserManager):
    """Manager for the email-based Admin user model."""

    def _create(self, email, password, **extra):
        if not email:
            raise ValueError("Email is required.")
        email = self.normalize_email(email)
        user  = self.model(email=email, **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra):
        extra.setdefault("is_staff", False)
        extra.setdefault("is_superuser", False)
        return self._create(email, password, **extra)

    def create_superuser(self, email, password, **extra):
        extra.setdefault("is_staff", True)
        extra.setdefault("is_superuser", True)
        extra.setdefault("is_email_verified", True)
        extra.setdefault("is_phone_verified", True)

        if extra.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        # Superusers don't belong to an org — create a default one
        from .models import Organization
        org, _ = Organization.objects.get_or_create(name="HirePortal HQ")
        extra.setdefault("organization", org)
        extra.setdefault("full_name", "Super Admin")
        extra.setdefault("phone", "0000000000")

        return self._create(email, password, **extra)