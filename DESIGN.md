# Antonio — refonte inspirée de Layers

## Direction du 6 novembre 2026

Référence explicitement demandée : https://www.getlayers.ai/?via=ig3, inspectée dans Chrome sur ordinateur et téléphone. Cette demande remplace la précédente architecture de six écrans sans défilement et le dock inférieur. La référence détermine la direction ; aucun tirage aléatoire de style n’a été ajouté.

Le portfolio reprend le fond presque noir, la barre supérieure en capsules, le hero gris argenté avec grain, les titres légers, les boutons à flèche circulaire, les grandes vignettes et les surfaces arrondies de Layers. Le noir et blanc demandé auparavant reste présent sur les photographies et les interfaces. Aucun logo ou contenu de marque de Layers, aucune étoile IA ni pastille tricolore.

## Contenu et composition

L’idée : les sites réalisés par Antonio deviennent une collection d’interfaces à parcourir, avec leur aperçu en premier et leurs informations en dessous.

- Accueil : Antonio, développeur web, et un lien direct vers les réalisations.
- Projets : Tsarakaly, MADA MARKET, Gilasy et Vakansy Mada, grandes captures sur deux colonnes puis une sur téléphone ; filtrage par catégorie, détails et liens externes.
- À propos : portrait réel, 20 ans, L2 à l’ESTI Antanimena, alternance chez Befiana Platform, intérêt pour le développement et la photographie.
- Compétences : données administrables et outils attestés par les projets existants, sans scores inventés.
- Parcours : formation et alternance, sans dates fictives.
- Contact : adresse, réseaux, formulaire et demande de CV si aucun PDF n’est disponible.

Les captures des quatre sites et le portrait existaient dans le projet. Aucun visuel de remplacement, image générée ou témoignage fictif. Aucun clip n’a été ajouté : aucune vidéo propre à Antonio n’était disponible, et les aperçus des sites portent la démonstration.

## Système visuel

Fond #080808, surfaces #121212 / #1B1B1B, texte principal #EEEEEE, secondaire #A7A7A7, argent #D5D5D5. Titres 300, corps 400, nom 750. Police Onest variable auto-hébergée, distribuée sous SIL Open Font License ; fichiers et licence dans `portfolio_site/static/portfolio_site/fonts/`. Source : https://github.com/google/fonts/tree/main/ofl/onest.

Les gradients neutres, bordures, capsules, petits cartouches et tailles de titre proches de 48 px sont intentionnels : ils reprennent la référence choisie par Antonio. Ils dérogent aux préférences génériques de design-taste-frontend. Le lint stylistique les signale encore ; ce ne sont pas des erreurs de compilation. L’inspection a été exécutée avec ces exceptions explicites (`eyebrow,gradient,button-fx,outlined-box,shadow,focal-point,pill-nav,hairline`).

## Interactions et accessibilité

Défilement vers les sections, menu mobile, lien d’évitement, états de focus, historique du navigateur et accès direct aux fiches. Fenêtre native `dialog` avec focus, fermeture Échap et bouton, récupération des détails avec état d’attente et repli en cas d’échec. Les projets restent accessibles sans JavaScript. Filtres avec `aria-pressed` et annonce du nombre de résultats.

Apparition progressive des sections via GSAP, déplacement subtil de lumière, zoom léger des aperçus et du portrait. Les préférences système et le bouton en pied de page réduisent les animations. Les contenus restent visibles si JavaScript échoue.

Le formulaire conserve CSRF, validation serveur, limitation de fréquence et champ piège. Il expose les erreurs aux lecteurs d’écran, empêche les doubles envois, conserve les champs en cas de panne réseau et se réinitialise après confirmation du serveur.

## Vérification

- Build des assets et du CSS réussi ; syntaxe JavaScript valide.
- 11 tests Django réussis : routes, brouillons, catégories, sitemap, cache privé, fragments, formulaire HTML/JSON, validation et limitation.
- 51 contrôles navigateur réussis à 1440 × 900, 768 × 1024, 390 × 844 et 320 × 568 : débordement, images, police, titres, filtres, fiches, Échap, menu, URL directe, réduction des animations, erreurs/succès simulés du formulaire et repli sans JavaScript. Aucun e-mail réel envoyé par ces contrôles.
- Inspection du CSS compilé : 0 FAIL, 3 WARN avec les exceptions de la référence. Les avertissements restants concernent la variété des tailles, l’absence de vidéo et un faux positif « nom seul » alors que le titre dit « développeur web ».
- Toutes les planches de l’inspection finale ont été ouvertes et examinées. Scripts, captures et rapports locaux dans `.taste-skill/layers-reference/`, `.taste-skill/layers-review/` et `.taste-skill/layers-qa/`.

## Critique visuelle

ROUND 2

Seen in one second: Antonio, développeur web, dans un hero argenté avec accès immédiat à ses projets.

Idea (one sentence): les réalisations réelles d’Antonio forment une collection d’interfaces dans la composition sombre de Layers.

Live thing: filtrer les réalisations et ouvrir leurs grandes fiches, puis les sites réels.

Layout words by section: hero=centré / projets=grands aperçus en grille / profil=portrait et récit / compétences=surfaces en grille / parcours=deux expériences / contact=invitation puis coordonnées et formulaire / footer=signature typographique.

Scores: design 8 · usability 8 · creativity 7 · content 8 → overall 7.8.

Caps applied: créativité plafonnée à 7, puisque la direction reproduit volontairement une référence. Les capsules, bordures et gradients viennent du choix explicite de l’utilisateur.

Top three problems (most visible first), each with the screenshot it shows in and the fix:

1. Premier rendu mobile : « web. » isolé sur une ligne ; corrigé en séparant Antonio et son métier sur deux lignes.
2. Premier rendu des fiches et du pied de page : légendes trop petites ; texte secondaire remonté à 13 px, descriptions à 16 px, signature du footer éclaircie.
3. Premier rendu mobile : les filtres repoussaient inutilement les images ; « Tous » remplace le libellé long et le compteur redondant est masqué sur téléphone.

Limites restantes : le design suit intentionnellement Layers et n’est donc pas une direction originale ; les images des projets sont des captures statiques. Aucun déploiement distant réalisé pour cette refonte.
