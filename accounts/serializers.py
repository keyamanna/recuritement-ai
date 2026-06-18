"""
accounts/serializers.py
───────────────────────
WHY THIS FILE IS MODIFIED:
  • SignupSerializer — no more `username`; strong password validation;
    returns user without logging them in (email must be verified first).
  • LoginSerializer  — validates that email IS verified before allowing
    token issue; also checks phone-verified flag if REQUIRE_PHONE_OTP=True.
  • New serializers for every new flow:
    VerifyEmailSerializer, SendOTPSerializer, VerifyOTPSerializer,
    ForgotPasswordSerializer, ResetPasswordSerializer,
    ResendVerificationSerializer.
"""

import re
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Organization

User = get_user_model()


# ── Helpers ───────────────────────────────────────────────────────────────
def _validate_password_strength(pw: str) -> str:
    errors = []
    if len(pw) < 8:
        errors.append("at least 8 characters")
    if not re.search(r"[A-Z]", pw):
        errors.append("one uppercase letter")
    if not re.search(r"[a-z]", pw):
        errors.append("one lowercase letter")
    if not re.search(r"\d", pw):
        errors.append("one digit")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", pw):
        errors.append("one special character (!@#$%^&* …)")
    if errors:
        raise serializers.ValidationError(
            "Password must contain: " + ", ".join(errors) + "."
        )
    return pw


def _validate_phone(phone: str) -> str:
    cleaned = re.sub(r"[\s\-\(\)\+]", "", phone)
    if not cleaned.isdigit():
        raise serializers.ValidationError("Phone number must contain only digits.")
    if not (7 <= len(cleaned) <= 15):
        raise serializers.ValidationError("Phone number must be 7–15 digits.")
    return phone   # store as entered (with formatting) for display


# ── Signup ────────────────────────────────────────────────────────────────
class SignupSerializer(serializers.Serializer):
    full_name    = serializers.CharField(max_length=255)
    email        = serializers.EmailField()
    phone        = serializers.CharField(max_length=20)
    organization = serializers.CharField(max_length=255)
    password     = serializers.CharField(write_only=True)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()

    def validate_phone(self, value):
        return _validate_phone(value)

    def validate_password(self, value):
        return _validate_password_strength(value)

    def validate_full_name(self, value):
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Full name must be at least 2 characters.")
        return value.strip()

    def create(self, validated_data):
        org_name = validated_data.pop("organization").strip()
        org, _   = Organization.objects.get_or_create(name=org_name)

        user = User(
            full_name=validated_data["full_name"],
            email=validated_data["email"],
            phone=validated_data["phone"],
            organization=org,
            is_email_verified=False,
            is_phone_verified=False,
        )
        user.set_password(validated_data["password"])
        user.save()
        return user


# ── Login ─────────────────────────────────────────────────────────────────
class LoginSerializer(serializers.Serializer):
    email    = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email    = data.get("email", "").lower()
        password = data.get("password", "")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password.")

        if not user.check_password(password):
            raise serializers.ValidationError("Invalid email or password.")

        if not user.is_email_verified:
            raise serializers.ValidationError(
                "EMAIL_NOT_VERIFIED"   # frontend detects this code
            )

        require_phone = getattr(settings, "REQUIRE_PHONE_OTP", False)
        if require_phone and not user.is_phone_verified:
            raise serializers.ValidationError("PHONE_NOT_VERIFIED")

        data["user"] = user
        return data


# ── Email verification ────────────────────────────────────────────────────
class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    token = serializers.CharField()


class ResendVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()


# ── Phone OTP ─────────────────────────────────────────────────────────────
class SendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp   = serializers.CharField(min_length=6, max_length=6)

    def validate_otp(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("OTP must be 6 digits.")
        return value


# ── Forgot / Reset password ───────────────────────────────────────────────
class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    email        = serializers.EmailField()
    token        = serializers.CharField()
    new_password = serializers.CharField(write_only=True)

    def validate_new_password(self, value):
        return _validate_password_strength(value)