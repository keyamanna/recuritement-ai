from django.contrib import admin
from .models import Job

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ['title', 'organization', 'job_type', 'location','required_skills', 'salary', 'experience_required', 'created_at']
    list_filter = ['job_type', 'created_at']
    search_fields = ['title', 'location', 'required_skills']
    ordering = ['-created_at']
    readonly_fields = ['created_at']