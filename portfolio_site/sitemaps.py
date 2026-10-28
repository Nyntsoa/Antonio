from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from .models import Project

class StaticViewSitemap(Sitemap):
    changefreq = "monthly"
    priority = 0.7
    def items(self):
        return ["home", "about", "project_list", "services", "contact"]
    def location(self, item):
        return reverse(item)

class ProjectSitemap(Sitemap):
    changefreq = "monthly"
    priority = 0.8
    def items(self):
        return Project.objects.filter(status=Project.Status.PUBLISHED)
