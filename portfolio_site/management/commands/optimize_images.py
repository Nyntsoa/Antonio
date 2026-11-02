from django.core.management.base import BaseCommand

from portfolio_site.image_variants import create_image_variants
from portfolio_site.models import Project, ProjectImage, SiteProfile


class Command(BaseCommand):
    help = "Generate responsive WebP variants for the site's uploaded images."

    def handle(self, *args, **options):
        images = []
        images.extend(profile.photo for profile in SiteProfile.objects.exclude(photo=""))
        images.extend(project.cover for project in Project.objects.exclude(cover=""))
        images.extend(item.image for item in ProjectImage.objects.select_related("project"))

        processed = 0
        for image in images:
            create_image_variants(image)
            processed += 1

        self.stdout.write(self.style.SUCCESS(f"Variantes responsive gÃ©nÃ©rÃ©es pour {processed} image(s)."))
