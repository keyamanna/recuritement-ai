"""
accounts/admin.py
─────────────────
WHY THIS FILE IS NEEDED:
  Django's built-in UserAdmin assumes a `username` field.
  Without this custom registration the /admin panel crashes
  with "unknown field: username".

  This registers the Admin model with email-based display,
  search, filtering, and the correct fieldsets.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import Admin, Organization


@admin.register(Admin)
class AdminUserAdmin(BaseUserAdmin):
    # ── List view ────────────────────────────────────────────────────────
    list_display  = ("email", "full_name", "organization", "is_email_verified",
                     "is_phone_verified", "is_staff", "date_joined")
    list_filter   = ("is_staff", "is_superuser", "is_email_verified",
                     "is_phone_verified", "organization")
    search_fields = ("email", "full_name", "phone")
    ordering      = ("-date_joined",)

    # ── Detail view fieldsets ────────────────────────────────────────────
    fieldsets = (
        (None, {
            "fields": ("email", "password")
        }),
        (_("Personal info"), {
            "fields": ("full_name", "phone", "organization")
        }),
        (_("Verification"), {
            "fields": (
                "is_email_verified", "email_verify_token", "email_verify_expiry",
                "is_phone_verified", "otp", "otp_expiry", "otp_attempts",
            )
        }),
        (_("Password reset"), {
            "fields": ("reset_token", "reset_token_expiry")
        }),
        (_("Permissions"), {
            "fields": ("is_active", "is_staff", "is_superuser",
                       "groups", "user_permissions"),
        }),
        (_("Important dates"), {
            "fields": ("last_login", "date_joined")
        }),
    )

    # ── Add user form fieldsets ───────────────────────────────────────────
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": (
                "email", "full_name", "phone", "organization",
                "password1", "password2",
                "is_staff", "is_superuser",
            ),
        }),
    )

    # Remove username — it doesn't exist on our model
    readonly_fields = ("date_joined", "last_login",
                       "email_verify_token", "email_verify_expiry",
                       "reset_token", "reset_token_expiry")


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display  = ("name", "created_at")
    search_fields = ("name",)
    ordering      = ("name",)