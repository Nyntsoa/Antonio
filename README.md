# Portfolio d’AMBININTSOA Antonio

Portfolio Django en français, administrable depuis l’interface Django. Page à défilement reprenant la structure de Layers : navigation en capsules, recherche, hero argenté, cinq galeries de douze cases, blocs de compétences, démarche, profil, parcours, FAQ et contact. Palette noir et blanc, titres General Sans, texte Onest et animations GSAP. SQLite fonctionne en local ; une URL PostgreSQL active la base de production. L’interface utilise des templates Django, Tailwind CSS compilé et JavaScript.

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
npm run build
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

Les images téléversées depuis l’administration génèrent automatiquement des variantes WebP selon leur taille d’affichage. Pour les médias déjà présents, lancez `python manage.py optimize_images` après la mise à jour du code.

Le CSS compilé, GSAP et Onest sont livrés dans le dépôt. General Sans est chargée depuis l’API officielle Fontshare, avec Onest comme police de repli. `npm run build` copie GSAP depuis la version installée, puis compile le CSS. Relancez la compilation après modification des styles.

## Navigation et aperçu

Pour prévisualiser ce projet localement avec SQLite, lancez `npm run dev`, puis ouvrez `http://127.0.0.1:8011/`. Cette commande active le mode développement sans modifier `.env`. Pour choisir une autre base uniquement pour cet aperçu, exportez `PORTFOLIO_PREVIEW_DATABASE_URL`.

Les liens supérieurs font défiler la page vers chaque section sans rechargement. Les URL directes et l’historique du navigateur restent fonctionnels. Sur mobile, le menu se replie. La recherche, accessible aussi avec `/`, retrouve les projets, les concepts et les sections. Les détails s’ouvrent dans une fenêtre accessible au clavier ; Échap la ferme. Chaque réalisation conserve sa page directe et son lien vers le site réel. Les collections se déploient avec leur bouton, les étapes de la démarche se parcourent au clavier et la FAQ utilise des accordéons natifs.

Les préférences de réduction des animations sont respectées, avec un bouton supplémentaire en pied de page. Le formulaire utilise une réponse JSON pour l’envoi sans navigation, et un repli HTML sans JavaScript. Ses champs restent visibles sur mobile. Sans PDF dans le profil, le lien CV permet d’en faire la demande par e-mail.

La biographie et le parcours fournis par Antonio sont dans les templates `screens/` et `portfolio_site/presentation.py`. Les projets et les compétences restent administrables. Le système visuel et ses choix sont documentés dans [DESIGN.md](DESIGN.md).

Les collections supplémentaires ont été demandées pour conserver la densité de la référence malgré le nombre limité de réalisations. Les concepts fictifs et les études visuelles sont définis dans `portfolio_site/presentation.py`, clairement étiquetés, et ne sont pas enregistrés comme projets clients en base. Les cases « À venir » sont volontairement vides. Les créations graphiques sont réalisées en HTML/CSS.

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

`check --deploy` signale les paramètres de sécurité à adapter au proxy et au domaine. La suite couvre les pages, les brouillons, le sitemap, les liens directs, la confidentialité du cache CSRF, les fiches projet, la validation et les réponses JSON du contact, ainsi que l’anti-spam.

## Déploiement

Voir [DEPLOYMENT.md](DEPLOYMENT.md) pour PostgreSQL, variables de production, fichiers statiques, médias persistants, HTTPS et SMTP.

## Informations à compléter

- Remplacer les projets de démonstration par des réalisations réelles ou les retirer.
- Ajouter une photo et un CV PDF si souhaité.
- Vérifier les coordonnées, les liens et les textes avant publication.
- Compléter les mentions légales et la politique de confidentialité dans l’administration.
- Créer une vraie clé `DJANGO_SECRET_KEY` et configurer le domaine, la base PostgreSQL, les médias persistants et le service SMTP.
