from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.sitemaps.views import sitemap
from django.urls import include, path
from portfolio_site.sitemaps import StaticViewSitemap, ProjectSitemap

sitemaps = {"pages": StaticViewSitemap, "projects": ProjectSitemap}
urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("portfolio_site.urls")),
    path("sitemap.xml", sitemap, {"sitemaps": sitemaps}, name="django.contrib.sitemaps.views.sitemap"),
]
handler404 = "portfolio_site.views.custom_404"

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
