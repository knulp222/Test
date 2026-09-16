/* Assemble les jeux et porte les réglages par défaut.
   Même schéma que le prompts.json de la version Python : { sets:[{name,categories:[
   {name,short,icon,color,kind?,items:[{num,title,text}]}]}], builder:{...} } */
(function (root) {
  const sets = [root.PW_SET_1, root.PW_SET_2, root.PW_SET_3, root.PW_SET_4].filter(Boolean);

  root.PromptWheelDefaults = {
    version: 2,
    sets: sets,
    builder: root.PW_BUILDER,
    settings: {
      // Raccourci géré dans la page, en plus du raccourci Chrome.
      hotkey: { ctrl: true, alt: true, shift: false, meta: false, key: 'KeyP' },
      hotkeyEnabled: true,
      // 'cursor' : la roue s'ouvre sous la souris ; 'center' : au centre de l'écran.
      openAt: 'cursor',
      // Copier systématiquement, même quand l'insertion dans la page a réussi.
      alwaysCopy: true,
      // Afficher la catégorie « Récents » comme 8e secteur.
      showRecents: false,
      // Jeu ouvert au démarrage (index dans sets).
      startSet: 0
    }
  };
})(typeof window !== 'undefined' ? window : self);
