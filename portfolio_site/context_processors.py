from .models import SiteProfile
from .presentation import navigation

def site_settings(request):
    return {"site_profile": SiteProfile.objects.first(), "navigation": navigation()}
