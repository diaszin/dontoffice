from rest_framework import permissions


class IsAdminOrReadOnlyDelete(permissions.BasePermission):
    """
    Permissão que bloqueia a ação de exclusão (DELETE/destroy)
    para usuários que não são administradores (staff ou superuser).
    """

    def has_permission(self, request, view):
        # Intercepta se a requisição for de exclusão
        if view.action == "destroy":
            return request.user and (request.user.is_staff or request.user.is_superuser)

        # Deixa passar livremente para list, retrieve, create e update
        return True
