from django.db import migrations


def update_vakansy_mada(apps, schema_editor):
    Category = apps.get_model("portfolio_site", "Category")
    Project = apps.get_model("portfolio_site", "Project")
    database = schema_editor.connection.alias

    category, _ = Category.objects.using(database).get_or_create(
        slug="tourisme",
        defaults={"name": "Tourisme", "order": 4},
    )
    Project.objects.using(database).filter(slug="vakansy-mada").update(
        category=category,
        summary="Site de voyage pour découvrir Madagascar à votre rythme.",
        context="Site de présentation des voyages Vakansy à Madagascar.",
        seo_title="Vakansy Mada — Voyager à Madagascar",
        seo_description="Découvrez Vakansy, des voyages de Madagascar des Hautes Terres aux rives de l’océan Indien.",
    )


class Migration(migrations.Migration):
    dependencies = [("portfolio_site", "0005_add_vakansy_mada_project")]

    operations = [migrations.RunPython(update_vakansy_mada, migrations.RunPython.noop)]
