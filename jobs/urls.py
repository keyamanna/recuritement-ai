from django.urls import path
from .views import CreateJobView, MyJobsView, UpdateJobView, DeleteJobView

urlpatterns = [
    path('create/', CreateJobView.as_view()),
    path('my-jobs/', MyJobsView.as_view()),

    path('update/<int:job_id>/', UpdateJobView.as_view()),
    path('delete/<int:job_id>/', DeleteJobView.as_view()),
]