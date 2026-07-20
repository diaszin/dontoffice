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

    @action(detail=True, methods=["get"], url_path="file")
    def obter_bytes(self, request, *args, **kwargs):
        instancia = self.get_object()
        campo_arquivo = instancia.upload

        if not campo_arquivo:
            return Response({"error": "Sem arquivo."}, status=status.HTTP_404_NOT_FOUND)

        try:
            arquivo_aberto = campo_arquivo.open("rb")
            print(type(arquivo_aberto))
            nome_arquivo = os.path.basename(campo_arquivo.name)

            print(nome_arquivo)

            response = FileResponse(arquivo_aberto, content_type="application/octet-stream")
            return response

        except FileNotFoundError:
            return Response({"error": "Arquivo sumiu do disco."}, status=status.HTTP_404_NOT_FOUND)
