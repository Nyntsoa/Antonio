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


# Visual studies requested to complete the reference layout. These are presented
# as concepts, separately from the published projects managed in Django admin.
PORTFOLIO_CONCEPTS = [
    {'key': 'mora', 'title': 'Mora', 'category': 'Art de vivre', 'kind': 'editorial', 'headline': 'Le temps de vivre.', 'caption': 'Une maison, une histoire.', 'description': 'Concept de site éditorial pour une maison d’hôtes imaginaire. Une étude de typographie, de rythme et de composition.'},
    {'key': 'rivo', 'title': 'Rivo', 'category': 'Architecture', 'kind': 'architecture', 'headline': 'Habiter autrement.', 'caption': 'Architecture & espaces.', 'description': 'Concept de portfolio pour un atelier d’architecture fictif, avec une composition structurée autour de la lumière et des volumes.'},
    {'key': 'cadrage', 'title': 'Cadrage', 'category': 'Photographie', 'kind': 'photo', 'headline': 'Voir. Autrement.', 'caption': 'Un regard sur les détails.', 'description': 'Maquette exploratoire d’un portfolio de photographie. Ce concept illustre une direction graphique, sans commande client.'},
    {'key': 'nocturne', 'title': 'Nocturne', 'category': 'Musique', 'kind': 'music', 'headline': 'Le son prend forme.', 'caption': 'Une autre fréquence.', 'description': 'Concept visuel d’une plateforme musicale fictive, entre formes circulaires, contraste et typographie.'},
]

VISUAL_STUDIES = [
    {'key': 'orbite', 'title': 'Orbite', 'category': 'Volume & lumière', 'kind': 'orb'},
    {'key': 'ruban', 'title': 'Ruban', 'category': 'Matière', 'kind': 'ribbon'},
    {'key': 'echo', 'title': 'Écho', 'category': 'Ondes', 'kind': 'rings'},
    {'key': 'monolithe', 'title': 'Monolithe', 'category': 'Architecture', 'kind': 'monolith'},
    {'key': 'horizon', 'title': 'Horizon', 'category': 'Paysage abstrait', 'kind': 'horizon'},
    {'key': 'prisme', 'title': 'Prisme', 'category': 'Géométrie', 'kind': 'prism'},
    {'key': 'sillage', 'title': 'Sillage', 'category': 'Mouvement', 'kind': 'waves'},
    {'key': 'eclipse', 'title': 'Éclipse', 'category': 'Ombre & lumière', 'kind': 'eclipse'},
]

INTERFACE_STUDIES = [
    {'key': 'index', 'title': 'Index', 'category': 'Navigation', 'kind': 'menu'},
    {'key': 'focus', 'title': 'Focus', 'category': 'Galerie', 'kind': 'gallery'},
    {'key': 'signal', 'title': 'Signal', 'category': 'Tableau de bord', 'kind': 'dashboard'},
    {'key': 'folio', 'title': 'Folio', 'category': 'Éditorial', 'kind': 'editorial'},
    {'key': 'atelier', 'title': 'Atelier', 'category': 'Commerce', 'kind': 'commerce'},
    {'key': 'passage', 'title': 'Passage', 'category': 'Transition', 'kind': 'transition'},
    {'key': 'chapitre', 'title': 'Chapitre', 'category': 'Typographie', 'kind': 'type'},
    {'key': 'accord', 'title': 'Accord', 'category': 'Composants', 'kind': 'components'},
]

PORTFOLIO_FAQ = [
    {'question': 'Qui se cache derrière ce portfolio ?', 'answer': 'Je suis AMBININTSOA Antonio, développeur web de 20 ans, étudiant en L2 à l’ESTI Antanimena et en alternance chez Befiana Platform.'},
    {'question': 'Quels projets sont déjà en ligne ?', 'answer': 'Tsarakaly, MADA MARKET, Gilasy et Vakansy Mada sont accessibles depuis leurs fiches. Le bouton « Visiter le site » ouvre la réalisation correspondante.'},
    {'question': 'Que signifie la mention « Concept » ?', 'answer': 'Ce sont des propositions graphiques fictives et des expérimentations créées pour explorer une idée. Elles ne correspondent pas à des missions ou à des clients réels.'},
    {'question': 'Pourquoi certaines cases sont-elles vides ?', 'answer': 'Elles réservent une place aux prochains projets, aux futures séries photo et aux nouvelles explorations.'},
    {'question': 'Comment discuter d’un projet ?', 'answer': 'Vous pouvez utiliser le formulaire de contact ou m’écrire directement par e-mail. Présentez votre idée, vos besoins et le calendrier envisagé.'},
    {'question': 'Où trouver votre CV ?', 'answer': 'Le bouton de la section À propos permet de télécharger mon CV lorsqu’il est disponible, ou de me le demander par e-mail.'},
]
