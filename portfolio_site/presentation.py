"""Screen content and navigation for the portfolio, independent of its templates."""
from django.urls import reverse

SCREEN_DEFINITIONS = [
    ('home', 'Accueil', 'home'),
    ('project_list', 'Projets', 'grid'),
    ('explorations', 'Explorations', 'pen'),
    ('materials', 'Matières', 'grid'),
    ('interfaces', 'Interfaces', 'layout'),
    ('photography', 'Photographie', 'camera'),
    ('skills', 'Compétences', 'code'),
    ('about', 'À propos', 'person'),
    ('contact', 'Contact', 'mail'),
]

PAGE_DESCRIPTIONS = {
    'home': 'Développement, créativité et nouvelles perspectives. Entrez dans l’univers d’AMBININTSOA Antonio.',
    'project_list': 'Les réalisations web d’Antonio : Tsarakaly, MADA MARKET, Gilasy et Vakansy Mada. Découvrez chaque projet en détail.',
    'explorations': 'Un laboratoire d’idées : concepts fictifs et expérimentations personnelles autour du web, des formes et de la lumière.',
    'materials': 'Des compositions monochromes pour explorer les contrastes, les reflets et la profondeur.',
    'interfaces': 'Des explorations UI/UX autour de la navigation, de la typographie et des interactions.',
    'photography': 'L’autre côté de mon regard. Portrait et place aux prochaines séries photographiques.',
    'skills': 'Les technologies, les outils et la démarche d’Antonio, de l’idée à la mise en ligne.',
    'about': 'Antonio, développeur web de 20 ans, étudiant en L2 à l’ESTI Antanimena et en alternance chez Befiana Platform.',
    'contact': 'Un projet web, une opportunité ou une idée à partager ? Échangeons par e-mail ou avec le formulaire de contact.',
}

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
    return [{'key': key, 'label': label, 'icon': icon, 'url': reverse(key),
             'number': f'{index:02}', 'description': PAGE_DESCRIPTIONS[key]}
            for index, (key, label, icon) in enumerate(SCREEN_DEFINITIONS, 1)]


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


def creative_items():
    """One registry powers collection cards, search and directly addressable studies."""
    items = []
    for concept in PORTFOLIO_CONCEPTS:
        items.append({**concept, 'family': 'explorations', 'type': 'concept',
                      'label': 'Concept fictif', 'art_template': 'concept_art.html',
                      'inspiration': concept['caption'],
                      'details': 'Typographie, rythme et composition forment une direction visuelle pour un univers imaginaire.',
                      'motion': 'Une légère mise en mouvement du volume permet de regarder la composition autrement.'})
    for study in VISUAL_STUDIES:
        items.append({**study, 'family': 'explorations', 'type': 'study',
                      'label': 'Expérimentation personnelle', 'art_template': 'study_art.html',
                      'description': 'Une étude graphique autour de la forme, de la lumière et de la matière. Exploration créée pour le laboratoire du portfolio.',
                      'inspiration': study['category'],
                      'details': 'Des volumes simples, des ombres graduelles et des contrastes monochromes donnent de la profondeur à la composition.',
                      'motion': 'Le mouvement fait varier la perception du volume, tout en gardant une lecture calme.'})
        items.append({**study, 'family': 'materials', 'type': 'material',
                      'label': 'Étude graphique', 'art_template': 'material_art.html',
                      'description': 'Une composition monochrome pour explorer les contrastes, les reflets et la profondeur.',
                      'inspiration': study['category'],
                      'details': 'Les dégradés et les répétitions dessinent une matière sans photographie ni texture bitmap. Toute la composition est réalisée en CSS.',
                      'motion': 'Une variation progressive de la lumière révèle les nuances entre le noir et le blanc.'})
    for study in INTERFACE_STUDIES:
        items.append({**study, 'family': 'interfaces', 'type': 'interface',
                      'label': 'Maquette conceptuelle', 'art_template': 'interface_art.html',
                      'description': f'Une proposition d’interface autour de {study["category"].lower()}. Cette maquette est une exploration graphique, sans projet client associé.',
                      'inspiration': study['category'],
                      'details': 'La hiérarchie du contenu, les proportions des composants et le contraste servent de terrain d’expérimentation.',
                      'motion': 'Une transition douce permet d’observer le rapport entre l’interface et son cadre.'})
    for item in items:
        item['url'] = reverse('creative_detail', kwargs={'space': {'explorations': 'explorations', 'materials': 'matieres', 'interfaces': 'interfaces'}[item['family']], 'slug': item['key']})
        item['art_template'] = 'portfolio_site/includes/' + item['art_template']
    return items
