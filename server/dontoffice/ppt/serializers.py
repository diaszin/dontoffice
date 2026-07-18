from django.contrib.auth.models import Group, User
from rest_framework import serializers

from dontoffice.ppt.models import PPTRoute


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ["url", "username", "email", "groups"]


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ["url", "name"]


class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = PPTRoute
        fields = ["slug", "upload"]
