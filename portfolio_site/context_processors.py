from .models import SiteProfile

def site_settings(request):
    return {"site_profile": SiteProfile.objects.first()}
