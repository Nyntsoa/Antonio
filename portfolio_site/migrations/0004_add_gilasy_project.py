from django.db import migrations


def add_gilasy_project(apps, schema_editor):
    Category = apps.get_model("portfolio_site", "Category")
    Project = apps.get_model("portfolio_site", "Project")
    database = schema_editor.connection.alias

    category, _ = Category.objects.using(database).get_or_create(
        slug="site-vitrine", defaults={"name": "Site vitrine", "order": 1}
    )
    Project.objects.using(database).get_or_create(
        slug="gilasy",
        defaults={
            "title": "Gilasy",
            "category": category,
            "summary": "Site de glaces aux saveurs malgaches, avec catalogue de parfums, formats et panier.",
            "live_url": "https://gilasy.vercel.app/",
            "context": "Site de présentation de Gilasy, autour des glaces et des saveurs de Madagascar.",
            "objective": "Faire découvrir les parfums, les formats et les terroirs malgaches, et faciliter le choix avant une commande au comptoir.",
            "work_done": "Présentation des quinze parfums, recherche dans le catalogue, sélection au panier, formats et tarifs, et sections consacrées à la maison et aux terroirs malgaches.",
            "status": "published",
            "featured": True,
            "order": 3,
            "seo_title": "Gilasy — Glaces aux saveurs malgaches",
            "seo_description": "Découvrez Gilasy : un site de glaces avec catalogue de parfums, panier et présentation des saveurs de Madagascar.",
        },
    )


class Migration(migrations.Migration):
    dependencies = [("portfolio_site", "0003_project_live_url_and_real_projects")]

    operations = [migrations.RunPython(add_gilasy_project, migrations.RunPython.noop)]
