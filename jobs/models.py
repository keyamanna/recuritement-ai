from django.db import models
from django.conf import settings
from accounts.models import Organization

class Job(models.Model):
    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='jobs'
    )

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='jobs'
    )

    title = models.CharField(max_length=255)
    description = models.TextField()

    required_skills = models.TextField(
        help_text="Comma-separated skills (e.g. Python, Django, AI)"
    )

    experience_required = models.CharField(
        max_length=100,
        help_text="e.g. 0-2 years, 3+ years"
    )

    location = models.CharField(max_length=255)
    salary = models.CharField(max_length=100)

    job_type = models.CharField(
        max_length=50,
        choices=[
            ('Full-Time', 'Full-Time'),
            ('Part-Time', 'Part-Time'),
            ('Internship', 'Internship'),
        ],
        default='Full-Time'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title