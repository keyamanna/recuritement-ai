"""
accounts/urls.py
────────────────
WHY THIS FILE IS MODIFIED:
  New endpoints for email verification, OTP, and the updated
  forgot/reset password flow.  Old reset token endpoint removed.
"""

from django.urls import path
from .views import (
    SignupView,
    LoginView,
    TestAuthView,
    VerifyEmailView,
    ResendVerificationView,
    SendOTPView,
    VerifyOTPView,
    ForgotPasswordView,
    ResetPasswordView,
    ChatbotProxyView  
)

urlpatterns = [
    # ── Auth ──────────────────────────────────────────────────────────────
    path("signup/",               SignupView.as_view(),              name="signup"),
    path("login/",                LoginView.as_view(),               name="login"),

    # ── Email verification ────────────────────────────────────────────────
    path("verify-email/",         VerifyEmailView.as_view(),         name="verify-email"),
    path("resend-verification/",  ResendVerificationView.as_view(),  name="resend-verification"),

    # ── Phone OTP ─────────────────────────────────────────────────────────
    path("send-otp/",             SendOTPView.as_view(),             name="send-otp"),
    path("verify-otp/",           VerifyOTPView.as_view(),           name="verify-otp"),

    # ── Password reset ────────────────────────────────────────────────────
    path("forgot-password/",      ForgotPasswordView.as_view(),      name="forgot-password"),
    path("reset-password/",       ResetPasswordView.as_view(),       name="reset-password"),

    # ── Utility ───────────────────────────────────────────────────────────
    path("test/",                 TestAuthView.as_view(),            name="test-auth"),
    path("chatbot/",              ChatbotProxyView.as_view(),        name="chatbot"),   # ← add this

]