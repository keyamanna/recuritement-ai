"""
accounts/emails.py
──────────────────
WHY THIS FILE IS NEEDED (NEW):
  Centralises every transactional email so views stay thin.
  Uses Django's send_mail / EmailMultiAlternatives for HTML bodies.
  All links are built from settings.FRONTEND_URL so you only change
  one env var when deploying.

  Three email types:
    1. send_verification_email  — called at signup
    2. send_otp_email           — called when phone OTP is simulated via email
    3. send_password_reset_email — called by ForgotPasswordView
"""

from django.conf import settings
from django.core.mail import EmailMultiAlternatives


# ── Shared chrome ─────────────────────────────────────────────────────────
_BASE_STYLE = """
  font-family: 'Segoe UI', Arial, sans-serif;
  background: #0a0f1e;
  color: #e2e8f0;
  max-width: 520px;
  margin: 0 auto;
  border-radius: 16px;
  overflow: hidden;
"""

def _wrap(title: str, body_html: str) -> str:
    """Wrap body in a dark-theme email shell matching the UI."""
    return f"""
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px;background:#060b18;">
  <div style="{_BASE_STYLE}">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0d9488,#0891b2);padding:32px 40px 24px;">
      <p style="margin:0;font-size:22px;font-weight:700;color:#fff;letter-spacing:-0.5px;">HirePortal</p>
      <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.75);">AI Recruitment Platform</p>
    </div>

    <!-- Body -->
    <div style="padding:32px 40px;background:#0f172a;">
      <h2 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#f1f5f9;">{title}</h2>
      {body_html}
    </div>

    <!-- Footer -->
    <div style="padding:20px 40px;background:#0a0f1e;border-top:1px solid rgba(255,255,255,0.06);">
      <p style="margin:0;font-size:12px;color:#475569;">
        If you didn't request this, you can safely ignore this email.<br>
        © 2025 HirePortal — Built with Django REST + React
      </p>
    </div>

  </div>
</body>
</html>
"""


def _send(to: str, subject: str, text_body: str, html_body: str):
    msg = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[to],
    )
    msg.attach_alternative(html_body, "text/html")
    msg.send(fail_silently=False)


# ── 1. Email verification ─────────────────────────────────────────────────
def send_verification_email(user, raw_token: str):
    link = f"{settings.FRONTEND_URL}/verify-email?token={raw_token}&email={user.email}"
    body_html = f"""
      <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 24px;">
        Welcome to HirePortal, <strong style="color:#e2e8f0;">{user.full_name}</strong>!<br>
        Click the button below to verify your email address.
        This link expires in <strong>24 hours</strong>.
      </p>
      <a href="{link}"
         style="display:inline-block;background:linear-gradient(135deg,#0d9488,#0891b2);
                color:#fff;text-decoration:none;padding:13px 28px;border-radius:10px;
                font-size:14px;font-weight:600;">
        Verify Email Address
      </a>
      <p style="color:#475569;font-size:12px;margin:24px 0 0;word-break:break-all;">
        Or copy this link:<br><span style="color:#22d3ee;">{link}</span>
      </p>
    """
    _send(
        to=user.email,
        subject="Verify your HirePortal email",
        text_body=f"Hi {user.full_name},\n\nVerify your email: {link}\n\nExpires in 24 hours.",
        html_body=_wrap("Verify your email address", body_html),
    )


# ── 2. Phone OTP (simulated via email) ───────────────────────────────────
def send_otp_email(user, otp: str):
    body_html = f"""
      <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 20px;">
        Hi <strong style="color:#e2e8f0;">{user.full_name}</strong>,<br>
        Use the code below to verify your phone number.
        It expires in <strong>10 minutes</strong>.
      </p>
      <div style="background:rgba(13,148,136,0.12);border:1px solid rgba(13,148,136,0.3);
                  border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
        <p style="margin:0;font-size:36px;font-weight:700;letter-spacing:10px;
                  color:#2dd4bf;font-family:monospace;">{otp}</p>
        <p style="margin:8px 0 0;font-size:12px;color:#64748b;">Expires in 10 minutes</p>
      </div>
      <p style="color:#475569;font-size:12px;margin:0;">
        Never share this code with anyone. HirePortal staff will never ask for it.
      </p>
    """
    _send(
        to=user.email,
        subject="Your HirePortal phone verification code",
        text_body=f"Hi {user.full_name},\n\nYour OTP: {otp}\n\nExpires in 10 minutes.",
        html_body=_wrap("Phone Verification Code", body_html),
    )


# ── 3. Password reset ─────────────────────────────────────────────────────
def send_password_reset_email(user, raw_token: str):
    link = f"{settings.FRONTEND_URL}/reset-password?token={raw_token}&email={user.email}"
    body_html = f"""
      <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 24px;">
        Hi <strong style="color:#e2e8f0;">{user.full_name}</strong>,<br>
        We received a request to reset your password.
        This link expires in <strong>1 hour</strong>.
        If you didn't request this, no action is needed.
      </p>
      <a href="{link}"
         style="display:inline-block;background:linear-gradient(135deg,#0d9488,#0891b2);
                color:#fff;text-decoration:none;padding:13px 28px;border-radius:10px;
                font-size:14px;font-weight:600;">
        Reset My Password
      </a>
      <p style="color:#475569;font-size:12px;margin:24px 0 0;word-break:break-all;">
        Or copy this link:<br><span style="color:#22d3ee;">{link}</span>
      </p>
    """
    _send(
        to=user.email,
        subject="Reset your HirePortal password",
        text_body=f"Hi {user.full_name},\n\nReset your password: {link}\n\nExpires in 1 hour.",
        html_body=_wrap("Reset your password", body_html),
    )