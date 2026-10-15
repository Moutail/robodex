# Robodex

Robots humanoïdes : ce qui est promis, ce qui est prouvé.

Un site statique (HTML, CSS, JavaScript, sans serveur) qui suit les annonces des fabricants de robots humanoïdes et les compare à ce que des sources indépendantes ont constaté.

- `data.js` — les fiches des robots et le journal des avancées
- `promises.js` — les promesses, leur échéance, leur statut et leurs sources
- `lines.js` — les phrases de l'assistant vocal VEGA, construites à partir des données
- `i18n.js` — la version anglaise : textes de l'interface, et sélecteur FR | EN (le choix est retenu ; lien direct : `?lang=en`)
- `audio/` — ces phrases, enregistrées avec la voix de VEGA (ElevenLabs) : en français dans `audio/`, en anglais dans `audio/en/`

Après une modification de `data.js` ou `promises.js`, les phrases nouvelles ou modifiées sont réenregistrées avec `python tools/tts.py maj` (dans la copie de travail), puis le dossier `audio/` est recopié ici. En attendant, VEGA lit ces phrases avec la voix du navigateur.

Chaque fiche, entrée du journal et promesse porte sa traduction anglaise dans un champ `en`, à côté du texte français.

## Crédits des images

| Robot | Crédit |
| --- | --- |
| Unitree G1 | Sayanesy, CC0 (Wikimedia Commons) |
| Tesla Optimus | Benjamin Ceci, domaine public (Wikimedia Commons) |
| Unitree H1 | Unitree |
| Figure 03 | Figure AI |
| Atlas | Boston Dynamics |
| Digit | Agility |
| NEO | 1X |
| T800 | EngineAI |

Le Unitree H2, le UBTech Walker S2 et l'Apptronik Apollo n'ont pas encore de photo : le site affiche un schéma à la place.

Les images des constructeurs leur appartiennent ; elles sont utilisées ici à titre d'illustration, sans but commercial, et seront retirées sur simple demande.

## Corrections

Une erreur, une promesse à ajouter, une image à retirer ? Ouvrez un ticket sur ce dépôt.
