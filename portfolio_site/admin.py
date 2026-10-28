from django.contrib import admin
from .models import Category, ContactMessage, Project, ProjectImage, Service, Skill, SiteProfile

class ProjectImageInline(admin.TabularInline):
    model = ProjectImage
    extra = 1

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ["title", "category", "status", "featured", "order"]
    list_filter = ["status", "category", "featured"]
    list_editable = ["status", "featured", "order"]
    search_fields = ["title", "summary"]
    prepopulated_fields = {"slug": ("title",)}
    inlines = [ProjectImageInline]

@admin.register(SiteProfile)
class SiteProfileAdmin(admin.ModelAdmin):
    fieldsets = [(None, {"fields": ("name", "profession", "intro", "journey")}), ("Coordonnées", {"fields": ("email", "phone", "location", "github_url", "linkedin_url")}), ("Médias", {"fields": ("photo", "cv")}), ("SEO et informations légales", {"fields": ("seo_title", "seo_description", "legal_notice", "privacy_notice")})]
    def has_add_permission(self, request):
        return not SiteProfile.objects.exists()

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ["subject", "name", "email", "created_at", "is_read"]
    list_filter = ["is_read", "created_at"]
    list_editable = ["is_read"]
    readonly_fields = ["name", "email", "subject", "message", "created_at"]

admin.site.register(Category)
admin.site.register(Service)
admin.site.register(Skill)
