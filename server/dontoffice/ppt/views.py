from django.contrib.auth.models import Group, User
from rest_framework import permissions, views, viewsets
from rest_framework.response import Response

from dontoffice.ppt.models import PPTRoute
from dontoffice.ppt.serializers import GroupSerializer, RouteSerializer, UserSerializer


class RouteViewSet(viewsets.ModelViewSet):
    queryset = PPTRoute.objects.all()
    serializer_class = RouteSerializer
