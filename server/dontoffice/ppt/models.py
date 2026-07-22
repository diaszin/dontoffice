from django.db import models


class PPTRoute(models.Model):
    class Meta:
        db_table = "ppt_routes"

    slug = models.CharField(unique=True, blank=False, verbose_name="url do ppt", max_length=255)
    upload = models.FileField(upload_to="ppt", blank=False, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
