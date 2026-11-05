from django.db import migrations


def add_vakansy_mada(apps, schema_editor):
    Category = apps.get_model("portfolio_site", "Category")
    Project = apps.get_model("portfolio_site", "Project")
    database = schema_editor.connection.alias

    category, _ = Category.objects.using(database).get_or_create(
        slug="application-web",
        defaults={"name": "Application web", "order": 3},
    )
    Project.objects.using(database).get_or_create(
        slug="vakansy-mada",
        defaults={
            "title": "Vakansy Mada",
            "category": category,
            "summary": "Plateforme dédiée aux offres d’emploi à Madagascar.",
            "live_url": "https://vakansymada.vercel.app/",
            "context": "Une plateforme web autour de la recherche d’emploi à Madagascar.",
            "status": "published",
            "order": 4,
            "seo_title": "Vakansy Mada — Offres d’emploi à Madagascar",
            "seo_description": "Découvrez Vakansy Mada, une plateforme malgache dédiée à la recherche d’offres d’emploi.",
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
