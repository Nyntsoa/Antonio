from .models import Project, SiteProfile
from .presentation import creative_items, navigation

def site_settings(request):
    profile = SiteProfile.objects.first() or SiteProfile()
    return {
        "site_profile": profile, "navigation": navigation(),
        "active_label": "Portfolio", "page_description": profile.seo_description,
        "search_projects": getattr(request, 'portfolio_projects', None) or list(
            Project.objects.filter(status=Project.Status.PUBLISHED).select_related('category')
        ),
        "search_studies": creative_items(),
        "canonical_url": request.build_absolute_uri(request.path),
    }
