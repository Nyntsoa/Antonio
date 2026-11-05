"""Screen content and navigation for the portfolio, independent of its templates."""
from django.urls import reverse

SCREEN_DEFINITIONS = [
    ('home', 'Accueil', 'home'),
    ('about', 'À propos', 'person'),
    ('skills', 'Compétences', 'code'),
    ('project_list', 'Projets', 'grid'),
    ('experience', 'Parcours', 'briefcase'),
    ('contact', 'Contact', 'mail'),
]

SKILL_GROUPS = [
    {'key': 'frontend', 'name': 'Frontend', 'icon': 'layout', 'title': 'L’interface prend vie.',
     'description': 'Des pages responsives, des interactions fluides et une attention portée à chaque détail.',
     'names': ['HTML', 'CSS', 'JavaScript', 'React']},
    {'key': 'backend', 'name': 'Backend', 'icon': 'server', 'title': 'Des bases solides.',
     'description': 'La logique, les données et les fonctionnalités qui font fonctionner une application web.',
     'names': ['Python', 'Django']},
    {'key': 'database', 'name': 'Bases de données', 'icon': 'database', 'title': 'Chaque donnée à sa place.',
     'description': 'Structurer les informations pour construire des applications utiles et cohérentes.',
     'names': ['PostgreSQL']},
    {'key': 'tools', 'name': 'Outils & technologies', 'icon': 'tools', 'title': 'Les outils de mes projets.',
     'description': 'Des technologies utilisées dans mes réalisations, du contenu aux animations.',
     'names': ['Supabase', 'GSAP', 'Bootstrap', 'Tailwind CSS']},
    {'key': 'design', 'name': 'UI / UX', 'icon': 'pen', 'title': 'Le sens du détail.',
     'description': 'Penser le parcours, soigner les interfaces et rendre la navigation naturelle sur tous les écrans.',
     'names': ['Responsive design', 'Intégration', 'Interfaces web']},
]

EXPERIENCES = [
    {'key': 'study', 'kind': 'Formation', 'title': 'ESTI Antanimena', 'role': 'Étudiant en L2',
     'period': 'En cours', 'icon': 'graduation',
     'description': 'J’approfondis mes connaissances et je développe mes compétences à travers mes études et mes projets web.',
     'focus': ['Apprendre', 'Expérimenter', 'Construire']},
    {'key': 'work', 'kind': 'Alternance', 'title': 'Befiana Platform', 'role': 'Développeur web en alternance',
     'period': 'En cours', 'icon': 'briefcase',
     'description': 'Je relie la formation à la pratique en entreprise, avec l’envie de progresser et de contribuer à des projets concrets.',
     'focus': ['Développement web', 'Travail en équipe', 'Progression']},
]


def navigation():
    return [{'key': key, 'label': label, 'icon': icon, 'url': reverse(key)}
            for key, label, icon in SCREEN_DEFINITIONS]


def skill_groups(skills):
    """Keep administrator-entered skills visible without inventing proficiency scores."""
    groups = [{**group, 'names': []} for group in SKILL_GROUPS]
    lookup = {name.casefold(): index for index, group in enumerate(SKILL_GROUPS)
              for name in group['names']}
    for skill in skills:
        index = lookup.get(skill.name.casefold(), 3)
        groups[index]['names'].append(skill.name)
    # These are evidenced by the existing project technologies and interface work.
    for index in (3, 4):
        groups[index]['names'] = list(dict.fromkeys(groups[index]['names'] + SKILL_GROUPS[index]['names']))
    return groups
