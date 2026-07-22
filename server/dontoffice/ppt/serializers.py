from django.contrib.auth.models import Group, User
from rest_framework import serializers

from dontoffice.ppt.models import PPTRoute


class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = PPTRoute
        fields = ["slug", "upload", "updated_at"]
