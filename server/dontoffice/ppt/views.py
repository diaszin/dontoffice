from django.contrib.auth.models import Group, User
from rest_framework import permissions, views, viewsets
from rest_framework.response import Response

import dontoffice.ppt.models
from dontoffice.ppt.serializers import RouteSerializer


class RouteViewSet(viewsets.ModelViewSet):
    queryset = dontoffice.ppt.models.PPTRoute.objects.all()
    serializer_class = RouteSerializer
