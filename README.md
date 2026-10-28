# Portfolio d’AMBININTSOA Antonio

Portfolio Django en français, administrable depuis l’interface Django. SQLite fonctionne en local ; une URL PostgreSQL active la base de production. L’interface utilise des templates Django, Tailwind CSS compilé et un peu de JavaScript sans dépendance.

## Prérequis

- Python 3.11 ou plus récent
- Node.js et npm (pour compiler Tailwind)
- Git (facultatif)

## Installation locale (PowerShell)

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
Copy-Item .env.example .env
npm install
npm run css:build
python manage.py migrate
python manage.py load_demo_content
python manage.py createsuperuser
python manage.py runserver
```

Ouvrez `http://127.0.0.1:8000/`. L’administration est disponible sur `/admin/`. Le fichier `.env` est chargé automatiquement. Pour le développement, `DEBUG=True` et le backend email console sont utilisés tant que `EMAIL_HOST` n’est pas défini.

Pour ne pas charger les projets et services d’exemple, omettez `python manage.py load_demo_content`. Les exemples sont des briefs fictifs et sont marqués « Projet de démonstration » ; remplacez-les ou supprimez-les avant publication.

## Styles

Les styles sources sont dans `assets/src/input.css`. Tailwind analyse les templates du dossier `portfolio_site/templates` et produit `portfolio_site/static/css/site.css` :

```powershell
npm run css:build
npm run css:watch
```

Le CSS compilé est livré dans le dépôt pour démarrer immédiatement. Relancez la compilation après modification des classes Tailwind ou du CSS source.

## Administration

- **Profil du site** : nom, métier, présentation, parcours, photo, CV, coordonnées, réseaux, SEO et textes légaux.
- **Projets** : brouillon/publié, catégorie, visuel, galerie, ordre, sélection accueil, étude de cas et champs SEO.
- **Services et compétences** : publication, ordre et contenu.
- **Messages reçus** : les soumissions sont consultables et marquables comme lues.

Les brouillons n’apparaissent ni dans le portfolio, ni dans les détails, ni dans le sitemap. Les catégories sans projet publié sont masquées. Les champs de résultats et les liens professionnels facultatifs ne sont affichés que lorsqu’ils sont renseignés.

## Vérifications

```powershell
python manage.py check
python manage.py check --deploy
python manage.py test
```

`check --deploy` signale les paramètres de sécurité qu’il faut activer selon le proxy et le domaine utilisés. Le projet n’inclut pas encore de suite de tests automatisés ; la commande `test` est documentée pour l’ajout futur de tests applicatifs.

## Déploiement

Voir [DEPLOYMENT.md](DEPLOYMENT.md) pour PostgreSQL, variables de production, fichiers statiques, médias persistants, HTTPS et SMTP.

## Informations à compléter

- Remplacer les projets de démonstration par des réalisations réelles ou les retirer.
- Ajouter une photo et un CV PDF si souhaité.
- Vérifier les coordonnées, les liens et les textes avant publication.
- Compléter les mentions légales et la politique de confidentialité dans l’administration.
- Créer une vraie clé `DJANGO_SECRET_KEY` et configurer le domaine, la base PostgreSQL, les médias persistants et le service SMTP.
