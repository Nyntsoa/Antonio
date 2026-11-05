# Antonio — portfolio immersif

Le brief fourni le 5 novembre 2026 remplace la première piste claire et les prescriptions esthétiques génériques des skills.

## Système

Palette monochrome : noir charbon #090909, surfaces #161616, blanc doux #F4F4F4, texte secondaire #D6D6D6 et gris #A3A3A3. Boutons principaux #EDEDED avec texte #111111. Les panneaux, le dock, les bordures, les survols et les états du formulaire emploient uniquement des gris neutres. Les erreurs restent identifiables par leur texte et leur bordure. La photographie et les captures sont affichées en niveaux de gris par CSS ; les fichiers originaux sont conservés.

Verre dépoli réservé au dock et aux fenêtres. Typographie système native, grands titres et navigation discrète. Le portrait photographique d’Antonio accompagne son nom à l’accueil. La signature de navigation reste typographique.

## Architecture

Django conserve l’administration, les projets illimités, le référencement et le formulaire. Les six vues utilisent un shell unique et des composants de template. Le JavaScript assure les transitions GSAP, les liens profonds, l’historique, le clavier et le tactile. Sans JavaScript, les liens chargent les écrans depuis Django. Aucun défilement vertical du document ; les contenus exceptionnellement longs restent accessibles dans leur fenêtre.

Les compétences viennent de l’administration. Les technologies complémentaires sont tirées des projets existants. Le parcours dans `portfolio_site/presentation.py` reprend les informations fournies par Antonio, sans dates, expérience ni niveau de maîtrise inventés.

## Image

Le visuel généré a été retiré à la demande d’Antonio, ainsi que les étoiles décoratives, le pictogramme de marque et les badges flottants. L’accueil utilise sa photographie existante. Le contrôle des animations utilise les symboles lecture / pause. Les autres images sont celles des projets.

## Navigation et accessibilité

Dock à six destinations, liens directs, retour/précédent du navigateur, flèches gauche/droite hors champs de saisie, Escape pour fermer une fenêtre puis revenir à l’accueil, gestes horizontaux sur les écrans. Les onglets et carrousels disposent de commandes tactiles et clavier. Réduction des animations système et bouton explicite ; aucune animation essentielle à la lecture. Formulaire CSRF, validation serveur, retour JSON accessible et repli HTML.

## Vérification du rendu

Les six écrans ont été inspectés dans Chrome à 1440 × 900, 768 × 1024, 390 × 844, 375 × 667 et 320 × 568. Aucun défilement du document, aucune image cassée et aucun débordement horizontal involontaire. Les six écrans tiennent dans la fenêtre dès 375 × 667 ; à 320 × 568, les panneaux longs peuvent défiler localement. Les deux étapes du formulaire tiennent aussi sur ce dernier format.

Navigation, historique, interruption des transitions, carrousel, ouverture et fermeture des fiches, sélection des compétences et du parcours, réduction des animations et repli sans JavaScript vérifiés dans le navigateur. Les derniers ajustements du formulaire ont passé les 35 contrôles ciblés. La suite Django passe ses 11 tests ; la compilation CSS et la copie locale de GSAP réussissent. Aucun message réel envoyé lors des vérifications navigateur.

### Critique de la refonte initiale (avant retrait du monogramme)

ROUND 3

Seen in one second: le nom Antonio et son monogramme en verre.

Idea (one sentence): un espace personnel inspiré d’un bureau numérique, où chaque destination révèle une facette d’Antonio.

Live thing: les écrans, onglets, projets et fenêtres se manipulent ; le contact dispose d’une validation et d’un envoi réels.

Layout words by section: hero=duo / about=portrait et fenêtres / skills=navigation et outils / projects=carrousel / experience=chronologie / contact=conversation et formulaire.

Scores: design 7.8 · usability 7.8 · creativity 7.5 · content 8 → overall 7.8

Caps applied: aucun plafond bloquant ; la palette sombre, les dégradés et le verre suivent le brief explicite. Les écrans de projets utilisent les réalisations existantes, et non des maquettes de remplissage.

Top three problems (most visible first), each with the screenshot it shows in and the fix:

1. Les commandes du formulaire étaient coupées sur le format 320 × 568 (`320-contact-step2.jpg`). Corrigé : champs compacts, intitulé court et espacement adapté ; envoi et confidentialité désormais visibles.
2. La capture d’un projet était trop recadrée sur tablette (`768-project_list.jpg`). Corrigé : composition verticale conservant une grande capture au-dessus de sa description.
3. Le monogramme débordait de sa zone sur ordinateur (`1440-home.jpg`). Corrigé : image ramenée à la taille de son cadre, avec de la place pour son mouvement.

Limites de contenu : aucun CV PDF fourni ; le lien propose une demande par e-mail. Aucune date de formation ou d’alternance inventée. La photo fournie reste utilisée, avec sa définition d’origine.
