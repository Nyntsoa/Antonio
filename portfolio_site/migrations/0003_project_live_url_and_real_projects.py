from django.db import migrations, models


def add_portfolio_projects(apps, schema_editor):
    Category = apps.get_model("portfolio_site", "Category")
    Project = apps.get_model("portfolio_site", "Project")

    site_category, _ = Category.objects.using(schema_editor.connection.alias).get_or_create(
        slug="site-vitrine", defaults={"name": "Site vitrine", "order": 1}
    )
    commerce_category, _ = Category.objects.using(schema_editor.connection.alias).get_or_create(
        slug="commerce", defaults={"name": "Commerce", "order": 2}
    )

    Project.objects.using(schema_editor.connection.alias).filter(
        demo_label="Projet de démonstration", status="published"
    ).update(status="draft", featured=False)

    Project.objects.using(schema_editor.connection.alias).get_or_create(
        slug="tsarakaly",
        defaults={
            "title": "Tsarakaly",
            "category": site_category,
            "summary": "Site de restaurant de saison avec menu, galerie et réservation à Antananarivo.",
            "live_url": "https://tsarakaly.vercel.app/",
            "context": "Site vitrine pour Tsarakaly, un restaurant de saison situé à Antananarivo.",
            "objective": "Présenter l’établissement et sa cuisine guidée par les produits de saison, et faciliter les réservations.",
            "role": "Conception et développement du site.",
            "work_done": "Création des pages d’accueil, d’histoire, de menu et de galerie, avec réservation de table et interface d’administration pour gérer le menu et les demandes.",
            "tools": "JavaScript, Supabase, GSAP",
            "status": "published",
            "featured": True,
            "order": 1,
            "seo_title": "Tsarakaly — Restaurant de saison",
            "seo_description": "Site du restaurant Tsarakaly à Antananarivo : cuisine de saison, menu, galerie et réservation.",
        },
    )
    Project.objects.using(schema_editor.connection.alias).get_or_create(
        slug="mada-market",
        defaults={
            "title": "MADA MARKET",
            "category": commerce_category,
            "summary": "Marketplace malgache pour découvrir des produits locaux, acheter et vendre en ligne.",
            "live_url": "https://bazary-5hpx.onrender.com/",
            "context": "Marketplace dédiée au commerce local à Madagascar, avec une présence affichant Antananarivo comme point de repère.",
            "objective": "Réunir acheteurs et vendeurs locaux et leur permettre de gérer leurs produits et commandes depuis leur compte.",
            "role": "Conception et développement de la marketplace.",
            "work_done": "Réalisation de la page d’accueil, de l’accès à la boutique, de la création de compte et de parcours distincts pour les acheteurs, vendeurs et profils professionnels.",
            "tools": "Django, Bootstrap 5, Bootstrap Icons",
            "status": "published",
            "featured": True,
            "order": 2,
            "seo_title": "MADA MARKET — Le marché malgache en ligne",
            "seo_description": "Marketplace malgache pour acheter auprès des vendeurs locaux et présenter son activité.",
        },
    )


def restore_demo_projects(apps, schema_editor):
    Project = apps.get_model("portfolio_site", "Project")
    Project.objects.using(schema_editor.connection.alias).filter(
        demo_label="Projet de démonstration"
    ).update(status="published", featured=True)
    Project.objects.using(schema_editor.connection.alias).filter(
        slug__in=["tsarakaly", "mada-market"]
    ).delete()


class Migration(migrations.Migration):
    dependencies = [("portfolio_site", "0002_alter_siteprofile_cv")]

    operations = [
        migrations.AddField(
            model_name="project",
            name="live_url",
            field=models.URLField(blank=True, help_text="Adresse publique du projet, si disponible.", verbose_name="lien du site"),
        ),
        migrations.RunPython(add_portfolio_projects, restore_demo_projects),
    ]
