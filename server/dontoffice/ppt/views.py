import mimetypes
import os

from django.contrib.auth.models import Group, User
from django.db.models.fields.files import FieldFile
from django.http import FileResponse
from rest_framework import permissions, status, views, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

import dontoffice.ppt.models
from dontoffice.ppt.permissions import IsAdminOrReadOnlyDelete
from dontoffice.ppt.serializers import RouteSerializer


class RouteViewSet(viewsets.ModelViewSet):
    queryset = dontoffice.ppt.models.PPTRoute.objects.all()
    serializer_class = RouteSerializer
    lookup_field = 'slug'

    permission_classes = [IsAdminOrReadOnlyDelete]
