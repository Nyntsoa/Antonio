# Antonio — espaces indépendants

## Référence et intention

La nouvelle demande transforme la longue page issue de la référence Layers en un portfolio multipage. L’identité existante est conservée ; la navigation devient une porte d’entrée vers neuf espaces distincts.

La composition conserve le hero argenté avec grain, les titres fins General Sans, les surfaces sombres et les légendes sous les visuels. Une barre persistante indique l’espace ouvert ; un menu plein écran présente toutes les destinations. Les pages intérieures ont un fil d’Ariane, une navigation entre espaces et un pied de page compact. Les galeries sont entièrement accessibles, sans masquer leurs dernières rangées.

Le noir et blanc des demandes précédentes est conservé. Les marques IA et les pastilles tricolores restent absentes. Les assets, le code métier et les textes de Layers ne sont pas intégrés au portfolio.

## Collections et contenu

Neuf pages : Accueil, Projets, Explorations, Matières, Interfaces, Photographie, Compétences, À propos et Contact. L’accueil donne un aperçu et des raccourcis. Le parcours rejoint À propos, la démarche rejoint Compétences, et la FAQ rejoint Contact. Les cases vides répétées ont été remplacées par des collections dédiées et une annonce des prochaines séries photographiques.

Les réalisations restent Tsarakaly, MADA MARKET, Gilasy et Vakansy Mada. Le catalogue ne contient que les projets publiés. Chaque page `/projets/<slug>/` présente une grande capture puis cinq chapitres : présentation, design, galerie, développement et bilan. Les captures supplémentaires desktop/mobile ont été prises sur les quatre sites, vérifiées visuellement et compressées en WebP. Les images s’agrandissent dans une fenêtre accessible. Les projets précédent et suivant restent disponibles en bas de page.

Mora, Rivo, Cadrage et Nocturne restent explicitement fictifs. Avec les huit études de formes, ils constituent Explorations. Huit matières et huit interfaces composent leurs espaces respectifs. Les 28 études ont chacune une URL, un aperçu grand format, une intention, des notes graphiques et une animation facultative. Les illustrations sont composées en HTML/CSS.

`portfolio_site/presentation.py` centralise navigation, descriptions, concepts, études et FAQ. Les textes personnels et professionnels existants restent conservés. `project_cases.py` complète la présentation des projets avec des éléments visibles sur les sites, sans modifier les champs existants. La migration `0007_project_case_details` ajoute trois champs facultatifs : design, difficultés et solutions. Les difficultés non renseignées sont signalées comme restant à documenter ; aucun historique technique ni résultat chiffré n’est inventé.

## Typographie et palette

General Sans pour les titres et boutons, via l’API officielle Fontshare : https://www.fontshare.com/fonts/general-sans. Onest auto-hébergée pour le texte et comme repli ; sa licence SIL OFL accompagne les fichiers dans `portfolio_site/static/portfolio_site/fonts/`.

Fond #080808, surfaces #121212 et #1B1B1B, texte #EEEEEE, secondaire #A7A7A7. Reflets, gradients, grain et illustrations restent monochromes. Les images existantes sont affichées en niveaux de gris, leurs originaux étant conservés.

## Interactions

- Recherche insensible aux accents et accessible avec `/` depuis chaque espace. Les résultats ouvrent les URL des pages.
- Menu plein écran, focus contenu dans la fenêtre, fermeture Échap, flèches haut/bas et Home/End dans les destinations.
- Barre des espaces horizontale sur petit écran, état actif rendu par Django, liens précédent/suivant et fil d’Ariane.
- Navigation native entre documents, avec sortie/entrée GSAP. Aucun routeur client ni historique artificiel : retour, suivant, actualisation et restauration du défilement restent gérés par le navigateur.
- Pages projet avec navigation par chapitres ; fenêtres natives uniquement pour agrandir les images et le portrait.
- Démarche en onglets sur toutes les tailles d’écran ; FAQ native.
- Formulaire Django existant : CSRF, validation serveur, limitation de fréquence, erreurs accessibles et conservation des champs en cas de panne réseau.
- Animations GSAP et préférence de réduction des animations persistante. Les projets, les concepts et le formulaire restent accessibles sans JavaScript. L’animation des études est déclenchée par le visiteur et peut être mise en pause.

## Vérification

La suite Django vérifie les pages indépendantes, les métadonnées, les anciennes URL, les brouillons, les contenus des études de cas, les concepts, le sitemap et le formulaire. Les contrôles navigateur couvrent 1440 × 900, 768 × 1024, 390 × 844 et 320 × 568, ainsi que retour/suivant/actualisation, restauration du défilement, recherche, menu, clavier, agrandissement des captures, animation facultative, réduction des animations et repli sans JavaScript.

Les captures de la référence et du rendu ainsi que les scripts de contrôle sont stockés dans le dossier temporaire de la session, hors du dépôt. Aucun outil de design supprimé n’a été réinstallé dans le projet. Aucun déploiement distant n’a été effectué.
