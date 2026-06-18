from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Job
from .serializers import JobSerializer


# ✅ CREATE JOB
class CreateJobView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = JobSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(
                admin=request.user,
                organization=request.user.organization
            )
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)


# ✅ GET MY JOBS
class MyJobsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        jobs = Job.objects.filter(admin=request.user)
        serializer = JobSerializer(jobs, many=True)
        return Response(serializer.data)
    
class UpdateJobView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, job_id):
        try:
            job = Job.objects.get(id=job_id, admin=request.user)
        except Job.DoesNotExist:
            return Response({"error": "Job not found"}, status=404)

        serializer = JobSerializer(job, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)
    
class DeleteJobView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, job_id):
        try:
            job = Job.objects.get(id=job_id, admin=request.user)
        except Job.DoesNotExist:
            return Response({"error": "Job not found"}, status=404)

        job.delete()
        return Response({"message": "Job deleted successfully"})