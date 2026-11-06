"""Presentation notes supplement existing project copy without overwriting it.

Historical difficulties and results are supplied through Django admin, never
inferred from the appearance of a website. New projects work without an entry.
"""
PROJECT_NOTES = {
    'tsarakaly': {
        'universe': 'Cuisine de saison · Antananarivo',
        'design': 'Une place centrale donnée à la cuisine, aux photographies et à la lecture du menu. Le parcours relie la découverte du restaurant à la réservation.',
        'features': ['Accueil et histoire du restaurant', 'Menu et galerie', 'Réservation de table', 'Administration du menu et des demandes'],
    },
    'mada-market': {
        'universe': 'Commerce local · Madagascar',
        'design': 'Une interface de catalogue où les produits et les catégories guident la découverte. Les accès aux comptes accompagnent les parcours d’achat et de vente.',
        'features': ['Découverte de la boutique', 'Création de compte', 'Parcours acheteur et vendeur', 'Profils professionnels'],
    },
    'gilasy': {
        'universe': 'Saveurs malgaches · Catalogue',
        'design': 'Une présentation centrée sur les parfums et les terroirs malgaches, avec une hiérarchie entre le catalogue, les formats et les informations de la maison.',
        'features': ['Catalogue de quinze parfums', 'Recherche dans le catalogue', 'Sélection au panier', 'Formats, tarifs et terroirs'],
    },
    'vakansy-mada': {
        'universe': 'Voyage · Madagascar',
        'objective': 'Faire découvrir les destinations de Madagascar et aider le visiteur à exprimer ses envies de voyage.',
        'design': 'Des photographies grand format mettent les paysages de Madagascar au premier plan. Les destinations, la durée et le rythme du voyage structurent la découverte.',
        'features': ['Présentation des destinations', 'Choix des envies, de la durée et des voyageurs', 'Découverte de l’approche de voyage', 'Prise de contact pour un itinéraire'],
    },
}


def case_content(project):
    notes = PROJECT_NOTES.get(project.slug, {})
    captures = []
    if project.slug in PROJECT_NOTES:
        captures = [
            {'path': f'portfolio_site/images/projects/{project.slug}-detail.webp',
             'caption': f'{project.title} — Détail de la page', 'kind': 'desktop', 'width': 1440, 'height': 1000},
            {'path': f'portfolio_site/images/projects/{project.slug}-mobile.webp',
             'caption': f'{project.title} — Accueil sur mobile', 'kind': 'mobile', 'width': 390, 'height': 844},
        ]
    return {
        'case_universe': notes.get('universe', project.category.name),
        'case_design': project.design_notes or notes.get('design', ''),
        'case_objective': project.objective or notes.get('objective', ''),
        'case_features': notes.get('features', []),
        'case_captures': captures,
    }
