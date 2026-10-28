from django.core.management.base import BaseCommand
from portfolio_site.models import Category, Project, Service, SiteProfile, Skill

class Command(BaseCommand):
    help = "Charge un profil et des projets de démonstration clairement identifiés."

    def handle(self, *args, **options):
        profile, _ = SiteProfile.objects.get_or_create(pk=1)
        profile.name = "AMBININTSOA Antonio"
        profile.profession = "Développeur web"
        profile.intro = "Passionné par le développement web et les nouvelles technologies, je conçois des sites web modernes, responsives et fonctionnels. J’aime transformer les idées en solutions numériques utiles, avec une attention particulière portée au design, à l’expérience utilisateur et à la qualité du code. Je cherche continuellement à développer mes compétences et à relever de nouveaux défis techniques."
        profile.email = "antonyntsoa@gmail.com"
        profile.phone = "034 07 515 55"
        profile.location = "Madagascar"
        profile.github_url = "https://github.com/Nyntsoa/"
        profile.linkedin_url = "https://www.linkedin.com/in/antonio-webdev/"
        profile.seo_title = "AMBININTSOA Antonio — Développeur web"
        profile.seo_description = "Développeur web à Madagascar. Je conçois des sites modernes, responsives et fonctionnels."
        profile.save()

        projects = [
            ("Site vitrine de café", "site-vitrine-cafe", "Site vitrine", "Un concept de site responsive pour un café indépendant.", "Démonstration de mise en page éditoriale, de présentation d’offre et de contact.", "Concevoir une présence en ligne simple, lisible et adaptée au mobile.", "Parcours de présentation, menu et formulaire de contact dans un brief fictif.", "HTML, CSS, JavaScript", "demo-cafe.svg"),
            ("Boutique artisanale", "boutique-artisanale", "Commerce", "Une exploration d’interface pour une boutique de produits artisanaux.", "Maquette de démonstration d’une boutique fictive, sans paiement ni activité commerciale.", "Présenter des produits et guider le visiteur vers une demande de renseignements.", "Conception d’une grille catalogue, de filtres et d’une fiche produit illustrative.", "Django, PostgreSQL, Tailwind CSS", "demo-boutique.svg"),
            ("Tableau de bord associatif", "tableau-de-bord-associatif", "Application web", "Une interface de suivi de projets pour une association fictive.", "Exercice de conception d’interface et de structuration des informations.", "Rendre lisibles des activités et des objectifs de démonstration.", "Organisation des contenus, des états d’interface et des vues adaptées aux écrans mobiles.", "Python, Django, JavaScript", "demo-dashboard.svg"),
        ]
        for order, (title, slug, category_name, summary, context, objective, work_done, tools, _asset) in enumerate(projects, start=1):
            category, _ = Category.objects.get_or_create(slug=category_name.lower().replace(" ", "-"), defaults={"name": category_name, "order": order})
            Project.objects.update_or_create(slug=slug, defaults={
                "title": title, "category": category, "summary": summary, "context": context,
                "objective": objective, "work_done": work_done, "tools": tools,
                "status": Project.Status.PUBLISHED, "featured": True, "order": order,
                "demo_label": "Projet de démonstration",
                "seo_title": f"{title} — Projet de démonstration",
                "seo_description": summary,
            })
        service_items = [
            ("Sites vitrines", "Un site clair et responsive pour présenter votre activité, vos services et vos coordonnées."),
            ("Applications web", "Des outils web adaptés à vos besoins, avec une logique serveur robuste."),
            ("Intégration front-end", "Intégration de maquettes en HTML, CSS et JavaScript, avec attention portée à l’accessibilité."),
            ("Maintenance et amélioration", "Corrections, évolutions et entretien de sites web existants."),
        ]
        for order, (title, description) in enumerate(service_items, 1):
            Service.objects.update_or_create(title=title, defaults={"description": description, "order": order, "active": True})
        for order, (name, group) in enumerate([
            ("Python", "Backend"), ("Django", "Backend"), ("HTML", "Front-end"), ("CSS", "Front-end"),
            ("JavaScript", "Front-end"), ("React", "Front-end"), ("PostgreSQL", "Données"),
        ], 1):
            Skill.objects.update_or_create(name=name, defaults={"group": group, "order": order, "active": True})
        self.stdout.write(self.style.SUCCESS("Contenu de démonstration chargé. Remplacez les exemples et retirez leurs mentions avant publication."))
