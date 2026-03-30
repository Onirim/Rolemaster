// ══════════════════════════════════════════════════════════════
// Quick TTRPG Manager — Fichier à personnaliser pour chaque jeu de rôle
//
// Ce fichier est le SEUL fichier métier à remplacer pour adapter
// le template à un nouveau système de jeu.
// ══════════════════════════════════════════════════════════════


// ── 1. IDENTITÉ DU JEU ────────────────────────────────────────
const GAME_NAME     = 'Rolemaster';
const GAME_SUBTITLE = 'Gestionnaire de campagne';


// ── 2. ÉTAT INITIAL D'UN PERSONNAGE ──────────────────────────
function freshState() {
  return {
    name:                  '',
    subtitle:              '',   // "Titre ou occupation"
    profession:            '',
    race:                  '',
    level:                 0,
    is_public:             false,
    illustration_url:      '',
    illustration_position: 0,
    tags:                  [],
    background:            '',
  };
}


// ── 3. CALCUL DES POINTS ──────────────────────────────────────
// Fonctions requises par le template (ici inutilisées mais présentes
// pour éviter les erreurs dans editor.js / scripts.js).

function totalCost()   { return 0; }
function maxPts()      { return 0; }
function calcAptPts()  { return 0; }
function maxAptPts()   { return 0; }
function powerCost()   { return 0; }
function calcAttrCost(){ return 0; }
function calcPowersCost(){ return 0; }

// Listes vides — non utilisées dans ce système
function POWER_TYPES() { return []; }
function MOD_OPTIONS()  { return []; }
function APTITUDES()    { return []; }
const APTITUDES_KEYS = [];


// ── 4. RENDU CARTE ROSTER ─────────────────────────────────────
// Retourne le HTML interne de la carte dans la liste du roster.

function renderCharCardBody(c) {
  const level = c.level ?? 0;

  return `
    <div class="card-name">${esc(c.name) || '—'}</div>
    ${c.subtitle
      ? `<div class="card-sub">${esc(c.subtitle)}</div>`
      : ''}
    ${c.profession
      ? `<div class="card-rank">${esc(c.profession)}</div>`
      : ''}
    ${c.race
      ? `<div class="card-rank" style="margin-top:4px;background:rgba(92,155,224,0.1);color:var(--def);border-color:rgba(92,155,224,0.25)">${esc(c.race)}</div>`
      : ''}
    <div class="card-attrs" style="margin-top:10px">
      <div class="card-attr" style="text-align:center">
        <div class="val" style="font-family:var(--font-mono);font-size:24px;font-weight:700;color:var(--accent)">${level}</div>
        <div class="lbl" style="font-size:10px;text-transform:uppercase;letter-spacing:0.06em;color:var(--text3)">${t('card_attr_level')}</div>
      </div>
    </div>
  `;
}


// ── 5. RENDU FICHE COMPLÈTE (preview + vue partagée) ─────────
function renderCharSheet(data) {
  const level = data.level ?? 0;

  const bgHtml = data.background
    ? `<div class="preview-section-title">${t('preview_section_background')}</div>
       <div class="background-preview">${esc(data.background)}</div>`
    : '';

  return `
    ${data.illustration_url
      ? `<img class="preview-illus"
           src="${esc(data.illustration_url)}"
           style="object-position:center ${data.illustration_position || 0}%"
           onclick="openLightbox('${esc(data.illustration_url)}')" alt="">`
      : ''}

    <div class="preview-header">
      <div class="preview-name">${esc(data.name) || '—'}</div>
      ${data.subtitle
        ? `<div class="preview-sub">${esc(data.subtitle)}</div>`
        : ''}
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;align-items:center">
        ${data.profession
          ? `<div class="preview-rank-badge">${esc(data.profession)}</div>`
          : ''}
        ${data.race
          ? `<div class="preview-rank-badge" style="background:rgba(92,155,224,0.12);color:var(--def);border-color:rgba(92,155,224,0.3)">${esc(data.race)}</div>`
          : ''}
      </div>
    </div>

    <div class="preview-section-title">${t('preview_section_level')}</div>
    <div class="preview-attrs" style="grid-template-columns:1fr;max-width:180px">
      <div class="preview-attr" style="border-left:3px solid var(--accent)">
        <div class="val" style="color:var(--accent);font-size:40px">${level}</div>
        <div class="lbl">${t('preview_attr_level')}</div>
      </div>
    </div>

    ${bgHtml}
  `;
}


// ── 6. CLÉS i18n SPÉCIFIQUES AU JEU ──────────────────────────
const GAME_I18N = {
  fr: {
    // Carte roster
    card_attr_level: 'Niveau',

    // Preview
    preview_section_level:      'Niveau',
    preview_attr_level:         'Niveau du personnage',
    preview_section_background: 'Background',

    // Éditeur — labels
    editor_field_level:         'Niveau',
    editor_field_profession:    'Profession',
    editor_field_profession_ph: 'Ex: Guerrier, Voleur, Magicien…',
    editor_field_race:          'Race',
    editor_field_race_ph:       'Ex: Humain, Elfe, Nain…',
    editor_field_subtitle:      'Titre ou occupation',
    editor_field_subtitle_ph:   'Ex: Capitaine de la garde, Apprenti mage…',
    editor_section_identity:    'Identité',
    editor_section_background:  'Background',
    editor_background_ph:       'Histoire du personnage, origines, motivations…',

    // Alertes
    alert_char_no_name: 'Veuillez donner un nom au personnage.',
  },
  en: {
    // Roster card
    card_attr_level: 'Level',

    // Preview
    preview_section_level:      'Level',
    preview_attr_level:         'Character level',
    preview_section_background: 'Background',

    // Editor labels
    editor_field_level:         'Level',
    editor_field_profession:    'Profession',
    editor_field_profession_ph: 'E.g. Fighter, Thief, Wizard…',
    editor_field_race:          'Race',
    editor_field_race_ph:       'E.g. Human, Elf, Dwarf…',
    editor_field_subtitle:      'Title or occupation',
    editor_field_subtitle_ph:   'E.g. Captain of the guard, Apprentice mage…',
    editor_section_identity:    'Identity',
    editor_section_background:  'Background',
    editor_background_ph:       'Character history, origins, motivations…',

    // Alerts
    alert_char_no_name: 'Please give the character a name.',
  },
};

// Merge automatique dans TRANSLATIONS au chargement
Object.keys(GAME_I18N).forEach(lang => {
  if (TRANSLATIONS[lang]) {
    Object.assign(TRANSLATIONS[lang], GAME_I18N[lang]);
  }
});
