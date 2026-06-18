"""
accounts/views.py
─────────────────
WHY THIS FILE IS MODIFIED:
  Complete rewrite.  All views use the new serializers, model helpers,
  and email utilities.  Key security improvements:

  • Signup      — creates user, sends verification email, no token returned
                  until email is verified.
  • VerifyEmail — consumes hashed token from link; marks email verified;
                  optionally triggers OTP send.
  • SendOTP / VerifyOTP — simulated via email; 5-attempt lockout.
  • Login       — only issues token after email (+ optionally phone) verified.
  • ForgotPassword — sends reset link to email; NEVER returns token in response.
  • ResetPassword  — consumes token from URL; clears after use.
  • ResendVerification — lets user re-request the verify email.

  Rate-limiting: add django-ratelimit or nginx limits in production.
"""
import requests
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model

from .serializers import (
    SignupSerializer,
    LoginSerializer,
    VerifyEmailSerializer,
    ResendVerificationSerializer,
    SendOTPSerializer,
    VerifyOTPSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
)
from .emails import (
    send_verification_email,
    send_otp_email,
    send_password_reset_email,
)

User = get_user_model()


# ── Helpers ───────────────────────────────────────────────────────────────
def _user_by_email(email: str):
    try:
        return User.objects.get(email=email.lower())
    except User.DoesNotExist:
        return None


# ─────────────────────────────────────────────────────────────────────────
# SIGNUP
# ─────────────────────────────────────────────────────────────────────────
class SignupView(APIView):
    """
    POST /api/auth/signup/
    Body: { full_name, email, phone, organization, password }

    Creates the user and fires the verification email.
    Does NOT return an auth token — user must verify email first.
    """

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user      = serializer.save()
        raw_token = user.set_email_verify_token()
        user.save(update_fields=["email_verify_token", "email_verify_expiry"])

        send_verification_email(user, raw_token)

        return Response(
            {
                "message": "Account created! Please check your email to verify your address.",
                "email": user.email,
            },
            status=status.HTTP_201_CREATED,
        )


# ─────────────────────────────────────────────────────────────────────────
# EMAIL VERIFICATION
# ─────────────────────────────────────────────────────────────────────────
class VerifyEmailView(APIView):
    """
    POST /api/auth/verify-email/
    Body: { email, token }

    Called when user clicks the link in their inbox.
    On success marks is_email_verified=True and (optionally) sends OTP.
    """

    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        email = serializer.validated_data["email"].lower()
        token = serializer.validated_data["token"]

        user = _user_by_email(email)
        if not user:
            return Response({"error": "User not found."}, status=404)

        if user.is_email_verified:
            return Response({"message": "Email already verified. Please log in."})

        if not user.check_email_verify_token(token):
            return Response(
                {"error": "This link is invalid or has expired. Request a new one."},
                status=400,
            )

        user.is_email_verified   = True
        user.email_verify_token  = None
        user.email_verify_expiry = None
        user.save(update_fields=["is_email_verified", "email_verify_token", "email_verify_expiry"])

        # If phone OTP is required, send it now
        from django.conf import settings
        if getattr(settings, "REQUIRE_PHONE_OTP", False):
            otp = user.set_otp()
            user.save(update_fields=["otp", "otp_expiry", "otp_attempts"])
            send_otp_email(user, otp)
            return Response(
                {
                    "message": "Email verified! An OTP has been sent to verify your phone.",
                    "next": "phone_verification",
                    "email": user.email,
                }
            )

        return Response(
            {
                "message": "Email verified successfully! You can now log in.",
                "next": "login",
            }
        )


class ResendVerificationView(APIView):
    """
    POST /api/auth/resend-verification/
    Body: { email }

    Re-sends the email-verification link (throttle in production).
    """

    def post(self, request):
        serializer = ResendVerificationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        email = serializer.validated_data["email"].lower()
        user  = _user_by_email(email)

        # Always return 200 to avoid user-enumeration
        if not user or user.is_email_verified:
            return Response(
                {"message": "If that email is registered and unverified, a link has been sent."}
            )

        raw_token = user.set_email_verify_token()
        user.save(update_fields=["email_verify_token", "email_verify_expiry"])
        send_verification_email(user, raw_token)

        return Response(
            {"message": "Verification email resent. Please check your inbox."}
        )


# ─────────────────────────────────────────────────────────────────────────
# PHONE OTP
# ─────────────────────────────────────────────────────────────────────────
class SendOTPView(APIView):
    """
    POST /api/auth/send-otp/
    Body: { email }

    Generates a fresh 6-digit OTP and emails it (simulating SMS).
    """

    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        email = serializer.validated_data["email"].lower()
        user  = _user_by_email(email)

        if not user:
            return Response({"error": "User not found."}, status=404)

        if not user.is_email_verified:
            return Response({"error": "Please verify your email first."}, status=400)

        if user.is_phone_verified:
            return Response({"message": "Phone already verified."})

        otp = user.set_otp()
        user.save(update_fields=["otp", "otp_expiry", "otp_attempts"])
        send_otp_email(user, otp)

        return Response(
            {
                "message": "OTP sent to your registered email (simulating SMS). "
                           "Valid for 10 minutes.",
            }
        )


class VerifyOTPView(APIView):
    """
    POST /api/auth/verify-otp/
    Body: { email, otp }
    """

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        email = serializer.validated_data["email"].lower()
        code  = serializer.validated_data["otp"]

        user = _user_by_email(email)
        if not user:
            return Response({"error": "User not found."}, status=404)

        valid, reason = user.check_otp(code)
        if not valid:
            return Response({"error": reason}, status=400)

        user.is_phone_verified = True
        user.otp               = None
        user.otp_expiry        = None
        user.otp_attempts      = 0
        user.save(update_fields=["is_phone_verified", "otp", "otp_expiry", "otp_attempts"])

        return Response({"message": "Phone verified successfully! You can now log in."})


# ─────────────────────────────────────────────────────────────────────────
# LOGIN
# ─────────────────────────────────────────────────────────────────────────
class LoginView(APIView):
    """
    POST /api/auth/login/
    Body: { email, password }

    Returns auth token only if email (and optionally phone) is verified.
    Serializer raises 'EMAIL_NOT_VERIFIED' / 'PHONE_NOT_VERIFIED' codes
    that the frontend can detect and route accordingly.
    """

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            errors = serializer.errors.get("non_field_errors", [])
            first  = str(errors[0]) if errors else "Invalid credentials."

            # Machine-readable codes for the frontend
            if first == "EMAIL_NOT_VERIFIED":
                return Response(
                    {
                        "error": "Please verify your email before logging in.",
                        "code": "EMAIL_NOT_VERIFIED",
                        "email": request.data.get("email", ""),
                    },
                    status=403,
                )
            if first == "PHONE_NOT_VERIFIED":
                return Response(
                    {
                        "error": "Please verify your phone number.",
                        "code": "PHONE_NOT_VERIFIED",
                        "email": request.data.get("email", ""),
                    },
                    status=403,
                )
            return Response({"error": first}, status=400)

        user        = serializer.validated_data["user"]
        token, _    = Token.objects.get_or_create(user=user)

        return Response(
            {
                "token": token.key,
                "admin": {
                    "id":           user.id,
                    "full_name":    user.full_name,
                    "email":        user.email,
                    "phone":        user.phone,
                    "organization": user.organization.name,
                },
            }
        )


# ─────────────────────────────────────────────────────────────────────────
# FORGOT PASSWORD
# ─────────────────────────────────────────────────────────────────────────
class ForgotPasswordView(APIView):
    """
    POST /api/auth/forgot-password/
    Body: { email }

    Sends a password-reset link to the user's verified email.
    Always returns 200 to prevent user enumeration.
    Token is NEVER returned in the response.
    """

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        email = serializer.validated_data["email"].lower()
        user  = _user_by_email(email)

        if user and user.is_email_verified:
            raw_token = user.set_reset_token()
            user.save(update_fields=["reset_token", "reset_token_expiry"])
            send_password_reset_email(user, raw_token)

        # Always the same response
        return Response(
            {
                "message": (
                    "If an account with that email exists and is verified, "
                    "a password reset link has been sent."
                )
            }
        )


# ─────────────────────────────────────────────────────────────────────────
# RESET PASSWORD
# ─────────────────────────────────────────────────────────────────────────
class ResetPasswordView(APIView):
    """
    POST /api/auth/reset-password/
    Body: { email, token, new_password }

    Token comes from the URL query param the user clicked in their email.
    """

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        email    = serializer.validated_data["email"].lower()
        token    = serializer.validated_data["token"]
        new_pass = serializer.validated_data["new_password"]

        user = _user_by_email(email)
        if not user or not user.check_reset_token(token):
            return Response(
                {"error": "This link is invalid or has expired. Please request a new one."},
                status=400,
            )

        user.set_password(new_pass)
        user.clear_reset_token()

        # Invalidate existing auth token so all sessions are logged out
        Token.objects.filter(user=user).delete()

        user.save()

        return Response({"message": "Password reset successfully. Please log in."})


# ─────────────────────────────────────────────────────────────────────────
# TEST AUTH
# ─────────────────────────────────────────────────────────────────────────
class TestAuthView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            {
                "message": "Authenticated",
                "admin": {
                    "email":     request.user.email,
                    "full_name": request.user.full_name,
                },
            }
        )

class ChatbotProxyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        messages = request.data.get("messages", [])

        if not messages:
            return Response({"error": "Messages are required"}, status=400)

        # Build messages with system prompt
        groq_messages = [
            {
                "role": "system",
                "content": "You are HireBot, a friendly AI assistant for HirePortal — a recruitment admin platform. Help admins with posting jobs, managing listings, resetting passwords, and navigating the platform. Keep responses short, clear and helpful. Use bullet points for steps."
            }
        ]

        for msg in messages:
            groq_messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })

        try:
            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "llama-3.1-8b-instant",
                    "messages": groq_messages,
                    "max_tokens": 1000,
                    "temperature": 0.7,
                },
                timeout=30,
            )

            data = response.json()
            print("Groq response:", data)

            if "error" in data:
                return Response({"error": data["error"].get("message", "Groq API error")}, status=500)

            reply = data["choices"][0]["message"]["content"]
            return Response({"reply": reply})

        except requests.exceptions.Timeout:
            return Response({"error": "Request timed out."}, status=504)
        except Exception as e:
            print("Chatbot error:", str(e))
            return Response({"error": str(e)}, status=500)