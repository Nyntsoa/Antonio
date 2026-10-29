# Guide de déploiement

## Variables

Copiez `.env.example` dans l’environnement du fournisseur et configurez au minimum :

- `DJANGO_SECRET_KEY` : secret long, aléatoire et propre à l’environnement.
- `DJANGO_DEBUG=False` (obligatoire en production ; ne le définissez pas à `True` sur Vercel).
- `DJANGO_ALLOWED_HOSTS=portfolio.example.com` pour un domaine personnalisé. Sur Vercel, les domaines de déploiement, de branche et de production sont ajoutés automatiquement depuis les variables système de Vercel.
- `DJANGO_CSRF_TRUSTED_ORIGINS=https://portfolio.example.com` pour un domaine personnalisé. Les origines HTTPS Vercel sont ajoutées automatiquement.
- `DATABASE_URL=postgresql://...` : URL PostgreSQL poolée pour le trafic du site sur Vercel.
- `DATABASE_URL_UNPOOLED=postgresql://...` : URL directe PostgreSQL, sans pooler, utilisée par le script de build Vercel pour appliquer les migrations.
- `SECURE_SSL_REDIRECT=True` si le HTTPS est correctement transmis au serveur Django.
- Variables SMTP : `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `EMAIL_USE_TLS=True`, `DEFAULT_FROM_EMAIL` et `CONTACT_NOTIFY_EMAIL`.

Ne commitez jamais `.env`. Utilisez le gestionnaire de secrets du fournisseur en production. La configuration sécurise les cookies, active HSTS et désactive `DEBUG` lorsque l’environnement le demande. Si TLS est terminé sur un proxy, configurez aussi celui-ci pour transmettre correctement `X-Forwarded-Proto` avant d’activer la redirection HTTPS.

Sur Vercel, `DEBUG` est désactivé et les domaines fournis par Vercel sont ajoutés à `ALLOWED_HOSTS` et `CSRF_TRUSTED_ORIGINS`. Définissez `DJANGO_SECRET_KEY` avec une valeur aléatoire d'au moins 50 caractères, ainsi que les deux URL PostgreSQL : `DATABASE_URL` poolée pour l'application et `DATABASE_URL_UNPOOLED` directe pour les migrations. Le fichier `pyproject.toml` lance les migrations et crée la table de cache pendant le build de production, ce qui évite de les exécuter depuis un réseau local qui bloque le port 5432. Si un `Build Command` personnalisé est défini dans les paramètres Vercel, retirez-le ou intégrez ce script. Après modification, redéployez l'application.

## Commandes de livraison

Dans l’environnement de production, avec les variables définies :

```sh
python -m pip install -r requirements.txt
npm ci
npm run css:build
python manage.py migrate
python manage.py createcachetable portfolio_cache
python manage.py collectstatic --noinput
gunicorn portfolio.wsgi:application
```

Créez le compte administrateur avec `python manage.py createsuperuser`. N’ajoutez pas de mot de passe administrateur prédéfini au déploiement.

## Fichiers statiques et médias

`collectstatic` rassemble le CSS/JS avec WhiteNoise. En production, le compteur antispam utilise la table de cache Django (`createcachetable`) pour être partagé entre les workers. Les téléversements utilisateur (`MEDIA_ROOT=media/`) doivent être stockés sur un volume persistant ou un stockage objet compatible et sauvegardé. N’utilisez pas le système de fichiers éphémère d’un conteneur pour les photos, CV ou visuels. Servez `/media/` depuis ce stockage via le domaine HTTPS et protégez les sauvegardes.

## PostgreSQL et email

Une variable `DATABASE_URL` PostgreSQL remplace automatiquement SQLite. Gardez une base distincte par environnement et exécutez les migrations pendant le déploiement. Sur Vercel, les migrations de production s'exécutent via `pyproject.toml` avec l'URL directe `DATABASE_URL_UNPOOLED`. Configurez SMTP avec TLS, un expéditeur autorisé par le fournisseur email et une adresse de notification contrôlée. En local, l'absence de `EMAIL_HOST` utilise le backend console.

## Après mise en ligne

1. Créez un superutilisateur et connectez-vous à `/admin/`.
2. Vérifiez qu’aucun contenu de démonstration ne subsiste.
3. Téléversez les vrais visuels/CV et confirmez leur persistance après redémarrage.
4. Renseignez les mentions légales et la confidentialité.
5. Testez une soumission de contact, la notification SMTP, le sitemap et les pages 404.
6. Lancez `python manage.py check --deploy` et adaptez les réglages à l’infrastructure réelle.
