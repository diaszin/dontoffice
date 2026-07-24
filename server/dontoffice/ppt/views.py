from rest_framework import status, viewsets
from rest_framework.response import Response

from dontoffice.ppt.models import PPTRoute
from dontoffice.ppt.permissions import IsAdminOrReadOnlyDelete
from dontoffice.ppt.serializers import RouteSerializer


class RouteViewSet(viewsets.ModelViewSet):
    queryset = PPTRoute.objects.all()
    serializer_class = RouteSerializer
    lookup_field = "slug"

    permission_classes = [IsAdminOrReadOnlyDelete]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        slug = serializer.initial_data.get("slug")

        created_route = PPTRoute.objects.filter(slug=slug).first()

        if created_route:
            serializer = self.get_serializer(created_route, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            status_response = status.HTTP_200_OK
        else:
            serializer.is_valid(raise_exception=True)
            status_response = status.HTTP_201_CREATED

        self.perform_create(serializer)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status_response, headers=headers)
