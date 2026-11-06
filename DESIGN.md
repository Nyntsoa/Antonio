# Antonio — composition Layers

## Référence et intention

La demande du 6 novembre 2026 est de reprendre le design de https://www.getlayers.ai/?via=ig3 avec la même densité, en ajoutant des cases vides et du contenu fictif lorsque nécessaire. La page de référence a été examinée dans Chrome et son HTML consulté directement.

La composition reprend la navigation en capsules accompagnée d’une recherche, le hero argenté avec grain, les titres fins General Sans, les grilles de quatre colonnes, les légendes sous les visuels, les rangées finales estompées et leurs boutons, les blocs de compétences, le sommaire fixe de la démarche, la FAQ et le grand pied de page. Les grilles passent à deux colonnes sur téléphone.

Le noir et blanc des demandes précédentes est conservé. Les marques IA et les pastilles tricolores restent absentes. Les assets, le code métier et les textes de Layers ne sont pas intégrés au portfolio.

## Collections et contenu

Cinq collections de douze cases : projets, explorations visuelles, matières, interfaces et photographie. Avec les quatre projets actuellement publiés, cela représente 60 cases : quatre réalisations en ligne, un portrait réel, 28 concepts ou études graphiques et 27 emplacements vides.

Les réalisations réelles restent Tsarakaly, MADA MARKET, Gilasy et Vakansy Mada. Leurs fiches montrent une grande capture en haut, puis leurs informations et leur lien externe. Les nouvelles propositions fictives Mora, Rivo, Cadrage et Nocturne sont étiquetées « Concept ». Les études de forme, de matière et d’interface disposent aussi de leur propre aperçu. Elles ne sont pas présentées comme des missions clients.

Les cases « À venir » sont volontaires, conformément à la demande. Les illustrations de concepts sont composées en HTML/CSS ; aucune photographie de client ou réalisation externe n’est utilisée pour les représenter.

Les données des concepts, études et FAQ se trouvent dans `portfolio_site/presentation.py`. Aucun ajout fictif à la table des projets, aucune migration et aucun faux résultat professionnel. Le parcours personnel fourni par Antonio est conservé.

## Typographie et palette

General Sans pour les titres et boutons, via l’API officielle Fontshare : https://www.fontshare.com/fonts/general-sans. Onest auto-hébergée pour le texte et comme repli ; sa licence SIL OFL accompagne les fichiers dans `portfolio_site/static/portfolio_site/fonts/`.

Fond #080808, surfaces #121212 et #1B1B1B, texte #EEEEEE, secondaire #A7A7A7. Reflets, gradients, grain et illustrations restent monochromes. Les images existantes sont affichées en niveaux de gris, leurs originaux étant conservés.

## Interactions

- Recherche insensible aux accents, projets et concepts ouvrables depuis les résultats, raccourci `/`, état sans résultat.
- Collections déployables et réduction des collections, avec état `aria-expanded`.
- Fenêtres natives pour les projets et les concepts, focus et fermeture Échap.
- Démarche avec navigation fixe sur ordinateur, onglets compacts sur téléphone, flèches du clavier et Home/End.
- FAQ native, menu mobile, navigation par section, liens directs et historique.
- Formulaire Django existant : CSRF, validation serveur, limitation de fréquence, erreurs accessibles et conservation des champs en cas de panne réseau.
- Animations GSAP et préférences de réduction des animations. Les réalisations réelles et le formulaire restent accessibles sans JavaScript.

## Vérification

Compilation CSS et assets réussie, syntaxe JavaScript et vérification Django sans erreur. Les 11 tests Django existants passent. Les contrôles navigateur couvrent 1440 × 900, 768 × 1024, 390 × 844 et 320 × 568, les grilles, les emplacements, la recherche, les fenêtres, Échap, les collections, les étapes, le menu, la FAQ et le repli sans JavaScript.

Les captures de la référence et du rendu ainsi que les scripts de contrôle sont stockés dans le dossier temporaire de la session, hors du dépôt. Aucun outil de design supprimé n’a été réinstallé dans le projet. Aucun déploiement distant n’a été effectué.
