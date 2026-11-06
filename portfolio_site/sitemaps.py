from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from .models import Project
from .presentation import creative_items

class StaticViewSitemap(Sitemap):
    changefreq = "monthly"
    priority = 0.7
    def items(self):
        return ["home", "about", "skills", "project_list", "explorations", "materials", "interfaces", "photography", "services", "contact"]
    def location(self, item):
        return reverse(item)

class ProjectSitemap(Sitemap):
    changefreq = "monthly"
    priority = 0.8
    def items(self):
        return Project.objects.filter(status=Project.Status.PUBLISHED)

class CreativeSitemap(Sitemap):
    changefreq = "monthly"
    priority = 0.5
    def items(self):
        return [item['url'] for item in creative_items()]
    def location(self, item):
        return item
