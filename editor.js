// ══════════════════════════════════════════════════════════════
// Quick TTRPG Manager — Éditeur de personnage
// Adapté au système simplifié : niveau, nom, titre/occupation,
// profession, race, background.
// ══════════════════════════════════════════════════════════════

function newChar() {
  editingId = null;
  state     = freshState();
  populateEditor();
  showView('editor');
}

function editChar(id, dataOverride) {
  editingId = id;
  const src = dataOverride || (id ? chars[id] : null) || freshState();
  state = JSON.parse(JSON.stringify(src));
  if (!state.tags) state.tags = [];
  if (editingId && charTagMap[editingId]) {
    state.tags = charTagMap[editingId]
      .map(tid => allTags.find(tg => tg.id === tid))
      .filter(Boolean);
  }
  populateEditor();
  showView('editor');
}

function populateEditor() {
  document.getElementById('f-name').value       = state.name       || '';
  document.getElementById('f-sub').value        = state.subtitle   || '';
  document.getElementById('f-profession').value = state.profession || '';
  document.getElementById('f-race').value       = state.race       || '';

  const levelVal = state.level ?? 0;
  const hiddenLevel = document.getElementById('f-level');
  if (hiddenLevel) hiddenLevel.value = levelVal;
  const displayLevel = document.getElementById('f-level-display');
  if (displayLevel) displayLevel.textContent = levelVal;

  const pubCb = document.getElementById('f-public');
  if (pubCb) {
    pubCb.checked = state.is_public || false;
    document.getElementById('public-label').textContent =
      pubCb.checked ? t('share_code_active') : t('share_code_inactive');
  }
  _updateShareCodeBox();

  const bgField = document.getElementById('f-background');
  if (bgField) bgField.value = state.background || '';

  renderTagChips();
  setIllusPreview(state.illustration_url || '', state.illustration_position || 0);
  updatePreview();
}

// ── Share code box ─────────────────────────────────────────────
function _updateShareCodeBox() {
  const scBox = document.getElementById('share-code-box');
  const scVal = document.getElementById('share-code-val');
  if (!scBox || !scVal) return;
  const code = state.share_code || (editingId && chars[editingId]?.share_code) || null;
  if (state.is_public && code) {
    scVal.textContent   = code;
    scBox.style.display = 'flex';
  } else {
    scBox.style.display = 'none';
  }
}

// ── Niveau ────────────────────────────────────────────────────
function changeLevel(delta) {
  const current = state.level ?? 0;
  state.level   = Math.max(0, current + delta);
  const hiddenInput = document.getElementById('f-level');
  if (hiddenInput) hiddenInput.value = state.level;
  const display = document.getElementById('f-level-display');
  if (display) display.textContent = state.level;
  updatePreview();
}

// ── Preview ───────────────────────────────────────────────────
function updatePreview() {
  state.name       = document.getElementById('f-name').value;
  state.subtitle   = document.getElementById('f-sub').value;
  state.profession = document.getElementById('f-profession').value;
  state.race       = document.getElementById('f-race').value;
  state.level      = parseInt(document.getElementById('f-level').value) || 0;
  state.background = document.getElementById('f-background')?.value || state.background || '';

  const pubCb = document.getElementById('f-public');
  if (pubCb) {
    state.is_public = pubCb.checked;
    document.getElementById('public-label').textContent =
      pubCb.checked ? t('share_code_active') : t('share_code_inactive');
  }
  _updateShareCodeBox();

  document.getElementById('preview-content').innerHTML = renderCharSheet(state);
}

// ── Stubs requis par le template (non utilisés) ───────────────
function updatePtsDisplay()    {}
function updateAptPtsDisplay() {}
function renderPowers()        {}
function renderAptitudes()     {}
function renderTraits()        {}
function renderComplications() {}
function addPower()            {}
function removePower()         {}
function addTrait()            {}
function removeTrait()         {}
function changeTrait()         {}
function addComplication()     {}
function removeComplication()  {}
function setComplLabel()       {}
function setComplDetail()      {}
function changeApt()           {}
function changeXP()            {}
function updateRankMax()       {}

// ── Save / Share ──────────────────────────────────────────────
function saveChar() { saveCharToDB(); }

function shareChar() {
  if (!state.is_public) { showToast(t('toast_share_need_public')); return; }
  const code = state.share_code || (editingId && chars[editingId]?.share_code);
  if (!code) { showToast(t('toast_share_need_save')); return; }
  copyUrl(buildShareUrl('char', code));
}

function copyShareCode() {
  const code = document.getElementById('share-code-val')?.textContent;
  if (!code || code === '—') return;
  navigator.clipboard.writeText(code)
    .then(() => showToast(ti('toast_code_copied', { code })))
    .catch(() => prompt(t('share_code_prompt_short'), code));
}

// ── Mobile tabs ───────────────────────────────────────────────
function switchMobTab(tab) {
  const form    = document.getElementById('editor-form');
  const preview = document.getElementById('preview-panel');
  const btnForm = document.getElementById('mob-tab-form');
  const btnPrev = document.getElementById('mob-tab-preview');
  if (!form || !preview) return;
  if (tab === 'form') {
    form.classList.remove('mob-hidden');   preview.classList.add('mob-hidden');
    btnForm?.classList.add('active');      btnPrev?.classList.remove('active');
  } else {
    form.classList.add('mob-hidden');      preview.classList.remove('mob-hidden');
    btnForm?.classList.remove('active');   btnPrev?.classList.add('active');
  }
}
