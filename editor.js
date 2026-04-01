// ══════════════════════════════════════════════════════════════
// Knave 2e Édition — Éditeur de personnage
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

  if (!state.abilities)  state.abilities  = {};
  if (!state.jobs)       state.jobs       = [];
  if (!state.blessings)  state.blessings  = [];
  if (!state.recipes)    state.recipes    = [];
  if (!state.tags)       state.tags       = [];
  if (!state.level || state.level < 1) state.level = 1;

  ABILITY_KEYS.forEach(k => {
    const v = Number(state.abilities[k]);
    state.abilities[k] = Number.isFinite(v) && v >= 0 ? v : 0;
  });

  if (editingId && charTagMap[editingId]) {
    state.tags = charTagMap[editingId]
      .map(tid => allTags.find(tg => tg.id === tid))
      .filter(Boolean);
  }

  populateEditor();
  showView('editor');
}

// ── Population de l'éditeur ───────────────────────────────────
function populateEditor() {
  document.getElementById('f-name').value = state.name    || '';
  document.getElementById('f-sub').value  = state.subtitle || '';

  const pubCb = document.getElementById('f-public');
  if (pubCb) {
    pubCb.checked = state.is_public || false;
    document.getElementById('public-label').textContent =
      pubCb.checked ? t('share_code_active') : t('share_code_inactive');
  }
  _updateShareCodeBox();

  // Niveau
  _renderLevelCtrl();
  // Caractéristiques
  renderAbilities();
  // Background
  const bg = document.getElementById('f-background');
  if (bg) bg.value = state.background || '';
  // Listes d'items
  renderItems('jobs',      'jobs-list');
  renderItems('blessings', 'blessings-list');
  renderItems('recipes',   'recipes-list');
  // Tags
  renderTagChips();
  // Illustration
  setIllusPreview(state.illustration_url || '', state.illustration_position || 0);
  // Preview
  updatePreview();
}

// ── Share code box ────────────────────────────────────────────
function _updateShareCodeBox() {
  const scBox = document.getElementById('share-code-box');
  const scVal = document.getElementById('share-code-val');
  if (!scBox || !scVal) return;
  const code = state.share_code || (editingId && chars[editingId]?.share_code) || null;
  if (state.is_public && code) {
    scVal.textContent = code;
    scBox.style.display = 'flex';
  } else {
    scBox.style.display = 'none';
  }
}

// ── Niveau ────────────────────────────────────────────────────
function _renderLevelCtrl() {
  const display = document.getElementById('f-level-display');
  if (display) display.textContent = state.level || 1;
  const hiddenInput = document.getElementById('f-level');
  if (hiddenInput) hiddenInput.value = state.level || 1;
  _updateBudgetDisplay();
}

function changeLevel(delta) {
  state.level = Math.max(1, (state.level || 1) + delta);
  _renderLevelCtrl();
  renderAbilities(); // remet à jour les couleurs de budget
  updatePreview();
}

function _updateBudgetDisplay() {
  const el = document.getElementById('abilities-budget');
  if (!el) return;
  const spent  = abilitySpent(state);
  const budget = abilityBudget(state);
  const over   = spent > budget;
  el.innerHTML = `<span class="pts-label" data-i18n="abilities_budget_label">${t('abilities_budget_label')}</span>
    <span class="pts-value ${over ? 'over' : 'ok'}">${spent} / ${budget}</span>`;
}

// ── Caractéristiques ──────────────────────────────────────────
function renderAbilities() {
  const grid = document.getElementById('abilities-grid');
  if (!grid) return;
  const labels = ABILITY_LABELS();
  const fullLabels = [
    t('ability_for_full'), t('ability_dex_full'), t('ability_con_full'),
    t('ability_int_full'), t('ability_sag_full'), t('ability_cha_full'),
  ];
  grid.innerHTML = ABILITY_KEYS.map((k, i) => {
    const val = Number(state.abilities[k]) || 0;
    return `<div class="attr-row">
      <div class="attr-name" title="${fullLabels[i]}">${labels[i]} <span style="font-size:10px;color:var(--text3);font-weight:400">${fullLabels[i]}</span></div>
      <div class="attr-ctrl">
        <button onclick="changeAbility('${k}', -1, event)">−</button>
        <div class="attr-val" id="ability-${k}">${val}</div>
        <button onclick="changeAbility('${k}', 1, event)">+</button>
        <span class="attr-cost" style="min-width:28px;text-align:right">${abilityDie(val)}</span>
      </div>
    </div>`;
  }).join('');
  _updateBudgetDisplay();
}

function changeAbility(key, delta, evt) {
  const step = evt?.shiftKey ? 3 : 1;
  const cur  = Number(state.abilities[key]) || 0;
  const spent = abilitySpent(state);
  const budget = abilityBudget(state);

  let nv = Math.max(0, cur + delta * step);
  // On ne laisse pas dépasser le budget en montant
  if (delta > 0 && spent + (nv - cur) > budget) {
    nv = cur + (budget - spent);
  }
  nv = Math.max(0, nv);
  state.abilities[key] = nv;

  const el = document.getElementById(`ability-${key}`);
  if (el) el.textContent = nv;
  _updateBudgetDisplay();
  updatePreview();
}

// ── Items génériques (métiers / bénédictions / recettes) ──────
function renderItems(listKey, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const items = state[listKey] || [];
  container.innerHTML = items.map((p, i) => `
    <div class="power-entry">
      <div class="power-entry-header">
        <input type="text"
          placeholder="${t('editor_item_name_ph')}"
          value="${esc(p.name || '')}"
          oninput="state.${listKey}[${i}].name=this.value;updatePreview()">
        <button class="rm-btn" onclick="removeItem('${listKey}','${containerId}',${i})">✕</button>
      </div>
      <div style="margin-top:7px">
        <textarea class="power-entry-textarea"
          placeholder="${t('editor_item_desc_ph')}"
          oninput="state.${listKey}[${i}].desc=this.value;updatePreview()">${esc(p.desc || '')}</textarea>
      </div>
      <div class="power-score-row">
        <span class="power-score-label">${t('editor_item_score_lbl')}</span>
        <div class="power-score-ctrl">
          <button type="button" onclick="changeItemScore('${listKey}','${containerId}',${i},-1,event)">−</button>
          <div class="power-score-val">${Math.max(0, Number(p.score ?? 0))}</div>
          <button type="button" onclick="changeItemScore('${listKey}','${containerId}',${i},1,event)">+</button>
        </div>
      </div>
    </div>`).join('');
}

function addItem(listKey, containerId) {
  if (!state[listKey]) state[listKey] = [];
  state[listKey].push({ name: '', desc: '', score: 0 });
  renderItems(listKey, containerId);
  updatePreview();
}

function removeItem(listKey, containerId, i) {
  state[listKey].splice(i, 1);
  renderItems(listKey, containerId);
  updatePreview();
}

function changeItemScore(listKey, containerId, i, delta, evt) {
  const step = evt?.shiftKey ? 5 : 1;
  const cur  = Number(state[listKey][i]?.score) || 0;
  state[listKey][i].score = Math.max(0, cur + delta * step);
  renderItems(listKey, containerId);
  updatePreview();
}

// ── Preview ───────────────────────────────────────────────────
function updatePreview() {
  state.name       = document.getElementById('f-name').value;
  state.subtitle   = document.getElementById('f-sub').value;
  state.background = document.getElementById('f-background')?.value || '';
  state.level      = Math.max(1, Number(state.level) || 1);

  const pubCb = document.getElementById('f-public');
  if (pubCb) {
    state.is_public = pubCb.checked;
    document.getElementById('public-label').textContent =
      pubCb.checked ? t('share_code_active') : t('share_code_inactive');
  }
  _updateShareCodeBox();

  document.getElementById('preview-content').innerHTML = renderCharSheet(state);
}

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

// ── Stubs requis par le template (non utilisés dans Knave) ────
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
