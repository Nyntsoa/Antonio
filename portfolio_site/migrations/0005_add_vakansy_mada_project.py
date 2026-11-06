from django.db import migrations


def add_vakansy_mada(apps, schema_editor):
    Category = apps.get_model("portfolio_site", "Category")
    Project = apps.get_model("portfolio_site", "Project")
    database = schema_editor.connection.alias

    category, _ = Category.objects.using(database).get_or_create(
        slug="tourisme",
        defaults={"name": "Tourisme", "order": 4},
    )
    Project.objects.using(database).get_or_create(
        slug="vakansy-mada",
        defaults={
            "title": "Vakansy Mada",
            "category": category,
            "summary": "Site de voyage pour découvrir Madagascar à votre rythme.",
            "live_url": "https://vakansymada.vercel.app/",
            "context": "Site de présentation des voyages Vakansy à Madagascar.",
            "status": "published",
            "order": 4,
            "seo_title": "Vakansy Mada — Voyager à Madagascar",
            "seo_description": "Découvrez Vakansy, des voyages de Madagascar des Hautes Terres aux rives de l’océan Indien.",
        },
    )


def remove_vakansy_mada(apps, schema_editor):
    Project = apps.get_model("portfolio_site", "Project")
    Project.objects.using(schema_editor.connection.alias).filter(
        slug="vakansy-mada", live_url="https://vakansymada.vercel.app/"
    ).delete()


class Migration(migrations.Migration):
    dependencies = [("portfolio_site", "0004_add_gilasy_project")]

    operations = [migrations.RunPython(add_vakansy_mada, remove_vakansy_mada)]
