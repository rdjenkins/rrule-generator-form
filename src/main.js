import './style.css';

// ─── Template constants ───────────────────────────────────────────────────────

const WEEKDAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June',
	'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
	'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const SETPOS_OPTIONS = `
  <option value="1">1st</option>
  <option value="2">2nd</option>
  <option value="3">3rd</option>
  <option value="4">4th</option>
  <option value="-1">Last</option>`;

const BYDAY_OPTIONS = `
  <option value="MO">Monday</option>
  <option value="TU">Tuesday</option>
  <option value="WE">Wednesday</option>
  <option value="TH">Thursday</option>
  <option value="FR">Friday</option>
  <option value="SA">Saturday</option>
  <option value="SU">Sunday</option>
  <option value="MO,TU,WE,TH,FR">Weekday</option>
  <option value="SA,SU">Weekend day</option>
  <option value="MO,TU,WE,TH,FR,SA,SU">Day</option>`;

const MONTH_OPTIONS = MONTHS_LONG
	.map((m, i) => `<option value="${i + 1}">${m}</option>`).join('');

const MONTHDAY_OPTIONS = Array.from({ length: 31 }, (_, i) =>
	`<option value="${i + 1}">${i + 1}</option>`).join('');

// ─── Instance counter — guarantees unique IDs when multiple widgets exist ─────

let _instanceCount = 0;

// ─── RRULE parser ─────────────────────────────────────────────────────────────

/**
 * parseRRule(str)
 *
 * Accepts any of the common forms stored in a database field:
 *   "RRULE:FREQ=MONTHLY;COUNT=5;BYMONTHDAY=9"
 *   "FREQ=MONTHLY;COUNT=5;BYMONTHDAY=9"        (bare, no prefix)
 *
 * Returns a plain object of uppercased key → string value, e.g.:
 *   { FREQ: 'MONTHLY', COUNT: '5', BYMONTHDAY: '9' }
 *
 * Returns null if the string is empty or unparseable.
 */
function parseRRule(str) {
	if (!str || !str.trim()) return null;

	// Strip optional "RRULE:" prefix then any stray whitespace
	const raw = str.trim().replace(/^RRULE:/i, '');
	if (!raw) return null;

	const parts = {};
	for (const segment of raw.split(';')) {
		const eq = segment.indexOf('=');
		if (eq === -1) continue;
		const key = segment.slice(0, eq).trim().toUpperCase();
		const val = segment.slice(eq + 1).trim();
		if (key && val) parts[key] = val;
	}

	return Object.keys(parts).length ? parts : null;
}

/**
 * hydrateForm(parts, $, $$, byId)
 *
 * Takes the object returned by parseRRule and applies each value back to the
 * widget's form controls, then returns the freq string so the caller can
 * trigger the correct visibility passes.
 *
 * Decision logic mirrors buildRule() in reverse:
 *
 *   FREQ        → freq select + recurring radio set to "yes"
 *   INTERVAL    → interval number input
 *   COUNT       → end-mode radio "count" + count-val input
 *   UNTIL       → end-mode radio "until" + until-date / until-time inputs
 *   (neither)   → end-mode radio "forever"
 *
 * MONTHLY:
 *   BYMONTHDAY  → month-mode "bymonthday", activate matching day buttons
 *   BYDAY+BYSETPOS → month-mode "byday", set selects
 *
 * WEEKLY:
 *   BYDAY       → activate matching day buttons
 *
 * YEARLY:
 *   BYMONTH (single) + BYMONTHDAY → yearly-mode "one-month"
 *   BYMONTH (multiple, no BYSETPOS) → yearly-mode "multi-month"
 *   BYMONTH + BYDAY + BYSETPOS → yearly-mode "precise"
 */
function hydrateForm(parts, $, $$, byId) {
	// Recurring = yes ──────────────────────────────────────────────────────
	const recurringYes = $('input[name$="_event-recurring"][value="yes"]');
	recurringYes.checked = true;
	byId('rrule-card').classList.add('visible');

	// FREQ ─────────────────────────────────────────────────────────────────
	const freq = (parts.FREQ || 'DAILY').toUpperCase();
	byId('freq').value = freq;

	// INTERVAL ─────────────────────────────────────────────────────────────
	if (parts.INTERVAL) {
		byId('interval').value = parts.INTERVAL;
	}

	// End condition ─────────────────────────────────────────────────────────
	if (parts.COUNT) {
		$('input[name$="_end-mode"][value="count"]').checked = true;
		byId('count-val').value = parts.COUNT;
	} else if (parts.UNTIL) {
		$('input[name$="_end-mode"][value="until"]').checked = true;
		// UNTIL is stored as YYYYMMDDTHHmmssZ — convert back to HTML date/time inputs
		const u = parts.UNTIL.replace('Z', '');
		// u is like "20271231T120000"
		const datePart = u.slice(0, 8);   // "20271231"
		const timePart = u.slice(9, 13);  // "1200"
		const dateHtml = `${datePart.slice(0, 4)}-${datePart.slice(4, 6)}-${datePart.slice(6, 8)}`;
		const timeHtml = `${timePart.slice(0, 2)}:${timePart.slice(2, 4)}`;
		byId('until-date').value = dateHtml;
		byId('until-time').value = timeHtml;
	} else {
		$('input[name$="_end-mode"][value="forever"]').checked = true;
	}

	// Frequency-specific BY rules ──────────────────────────────────────────

	if (freq === 'WEEKLY' && parts.BYDAY) {
		const days = parts.BYDAY.split(',');
		$$('.day-btn').forEach(btn => {
			if (days.includes(btn.dataset.day)) btn.classList.add('active');
		});
	}

	if (freq === 'MONTHLY') {
		if (parts.BYMONTHDAY) {
			// bymonthday mode — activate the day-of-month buttons
			$('input[name$="_month-mode"][value="bymonthday"]').checked = true;
			const days = parts.BYMONTHDAY.split(',');
			$$('.monthday-btn').forEach(btn => {
				if (days.includes(btn.dataset.mday)) btn.classList.add('active');
			});
		} else if (parts.BYDAY && parts.BYSETPOS) {
			// byday + setpos mode
			$('input[name$="_month-mode"][value="byday"]').checked = true;
			byId('month-setpos').value = parts.BYSETPOS;
			// BYDAY here is a single day or a known multi-day keyword.
			// Match against the <select> option values exactly.
			setSelectByValue(byId('month-byday'), parts.BYDAY);
		}
	}

	if (freq === 'YEARLY') {
		const bymonthVals = parts.BYMONTH ? parts.BYMONTH.split(',') : [];

		if (parts.BYSETPOS && parts.BYDAY && parts.BYMONTH) {
			// Precise: "The Nth <day> of <month>"
			$('input[name$="_yearly-mode"][value="precise"]').checked = true;
			byId('yearly-setpos').value = parts.BYSETPOS;
			setSelectByValue(byId('yearly-byday'), parts.BYDAY);
			byId('yearly-precise-month').value = parts.BYMONTH;

		} else if (bymonthVals.length > 1) {
			// Multiple months — activate month buttons
			$('input[name$="_yearly-mode"][value="multi-month"]').checked = true;
			$$('.yearly-month-btn').forEach(btn => {
				if (bymonthVals.includes(btn.dataset.month)) btn.classList.add('active');
			});

		} else {
			// Single month + day-of-month
			$('input[name$="_yearly-mode"][value="one-month"]').checked = true;
			if (parts.BYMONTH) byId('yearly-month').value = parts.BYMONTH;
			if (parts.BYMONTHDAY) byId('yearly-monthday').value = parts.BYMONTHDAY;
		}
	}

	return freq;
}

/**
 * setSelectByValue(selectEl, value)
 *
 * Sets a <select> to the option whose value matches `value`.
 * Falls back gracefully if no match is found (leaves the current selection).
 */
function setSelectByValue(selectEl, value) {
	const opt = Array.from(selectEl.options).find(o => o.value === value);
	if (opt) selectEl.value = value;
}

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * RRuleGenerator(targetInput)
 *
 * Attaches an RRULE editor widget to a given <input> element.
 * The input is hidden (but remains in the DOM / form) and its value is kept
 * in sync with the widget so the form submits the correct RRULE string.
 *
 * If the input already has a value it is parsed and used to pre-populate the
 * form so the user can edit an existing rule.
 *
 * @param {HTMLInputElement} targetInput  The input to attach to.
 * @returns {{ destroy: Function }}       Call destroy() to remove the widget.
 */
function RRuleGenerator(targetInput, displayInput) {
	// Unique prefix for all internal IDs in this instance ─────────────────
	const uid = `rrg${++_instanceCount}`;
	const id = suffix => `${uid}-${suffix}`;

	// Read any existing value before repositioning the input ───────────────
	const existingValue = (targetInput.value || '').trim();

	// Make the display input readonly — it stays visible and in the form ───────────
	displayInput.readOnly = true;
	displayInput.classList.add('rrule-output-input');

	// Hide the original input — it remains in the DOM and in the form, but out of sight
	targetInput.type = 'hidden';

	// Build and inject the widget markup ───────────────────────────────────
	const widget = document.createElement('div');
	widget.className = 'rrule-generator-widget';
	widget.dataset.uid = uid;
	widget.innerHTML = buildTemplate(uid, id);

	// Insert immediately after the target input
	targetInput.insertAdjacentElement('afterend', widget);

	// Scoped query helpers (never leak outside this widget) ────────────────
	const root = widget;
	const $ = sel => root.querySelector(sel);
	const $$ = sel => Array.from(root.querySelectorAll(sel));
	const byId = suffix => root.querySelector(`#${id(suffix)}`);

	// Move the real input into the output slot ─────────────────────────────
	byId('output-body').appendChild(displayInput); // show the RRULE display keep the real one hidden

	// Hydrate from existing value if present ───────────────────────────────
	const parsedParts = parseRRule(existingValue);
	if (parsedParts) {
		const detectedFreq = hydrateForm(parsedParts, $, $$, byId);
		// Visibility must be applied after hydration so the correct sub-panels show
		applyFreqVisibility(byId);
		applyMonthModeVisibility($, byId);
		applyYearlyModeVisibility($, byId);
		applyEndModeVisibility($, byId);
	} else {
		// Fresh / empty — standard initial state
		applyFreqVisibility(byId);
		applyMonthModeVisibility($, byId);
		applyYearlyModeVisibility($, byId);
		applyEndModeVisibility($, byId);
	}

	// Wire up all event listeners ──────────────────────────────────────────
	attachListeners(root, $, $$, byId, targetInput, displayInput);

	// Render initial output (syncs targetInput.value) ──────────────────────
	updateOutput(root, $, $$, byId, targetInput, displayInput);

	// Public API ────────────────────────────────────────────────────────────
	return {
		/** Remove the widget and restore the original input. */
		destroy() {
			// Move the input back to its original position before removing the widget
			widget.insertAdjacentElement('beforebegin', targetInput);
			targetInput.readOnly = false;
			targetInput.classList.remove('rrule-output-input');
			targetInput.value = '';
			widget.remove();
		},
	};
}

// ─── Template ─────────────────────────────────────────────────────────────────

function buildTemplate(uid, id) {
	const weekdayBtns = WEEKDAYS.map(d =>
		`<button type="button" class="btn-toggle day-btn" data-day="${d}">${d}</button>`
	).join('');

	const monthdayBtns = Array.from({ length: 31 }, (_, i) =>
		`<button type="button" class="btn-toggle monthday-btn" data-mday="${i + 1}">${i + 1}</button>`
	).join('');

	const yearlyMonthBtns = MONTHS_SHORT.map((m, i) =>
		`<button type="button" class="btn-toggle yearly-month-btn" data-month="${i + 1}">${m}</button>`
	).join('');

	// Radio name attributes are prefixed so sibling widgets don't share groups
	const n = suffix => `${uid}_${suffix}`;

	return `
  <form><!-- dummy form to isolate the rrule inputs -->
  <div class="rrule-widget-inner">

    <!-- ── Recurring toggle card ── -->
    <div class="card">
      <div class="card-header"><div class="dot"></div><span>Recurrence</span><span class="badge"><a href="https://github.com/rdjenkins/rrule-generator-form" target="_blank">rrule-generator-form</a></span></div>
      <div class="card-body">
        <div class="form-row">
          <label class="row-label">Recurring</label>
          <div class="row-controls">
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" name="${n('event-recurring')}" value="no" checked> No
              </label>
              <label class="radio-label">
                <input type="radio" name="${n('event-recurring')}" value="yes"> Yes
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Recurrence Rule card ── -->
    <div class="card collapsible" id="${id('rrule-card')}">
      <div class="card-header"><div class="dot"></div><span>Recurrence Rule</span></div>
      <div class="card-body">

        <!-- Frequency + Interval -->
        <div class="form-row">
          <label class="row-label">Frequency</label>
          <div class="row-controls">
            <span class="muted-text">Every</span>
            <input type="number" id="${id('interval')}" value="1" min="1" max="999">
            <div class="select-wrap">
              <select id="${id('freq')}">
                <option value="DAILY">Days</option>
                <option value="WEEKLY">Weeks</option>
                <option value="MONTHLY">Months</option>
                <option value="YEARLY">Years</option>
              </select>
            </div>
          </div>
        </div>

        <hr class="section-divider">

        <!-- WEEKLY -->
        <div id="${id('section-weekly')}" class="collapsible">
          <div class="form-row">
            <label class="row-label">On Days</label>
            <div class="row-controls" style="flex-direction:column;align-items:flex-start;">
              <div class="btn-grid">${weekdayBtns}</div>
              <div class="validation-msg" id="${id('weekly-note')}">
                ⚠ No days selected — will repeat on the start date's weekday
              </div>
            </div>
          </div>
          <hr class="section-divider">
        </div>

        <!-- MONTHLY -->
        <div id="${id('section-monthly')}" class="collapsible">
          <div class="form-row">
            <label class="row-label">By</label>
            <div class="row-controls">
              <div class="radio-group">
                <label class="radio-label">
                  <input type="radio" name="${n('month-mode')}" value="bymonthday" checked> Day of month
                </label>
                <label class="radio-label">
                  <input type="radio" name="${n('month-mode')}" value="byday"> Day of week
                </label>
              </div>
            </div>
          </div>

          <div id="${id('monthly-bymonthday')}" class="sub-option">
            <div class="btn-grid" style="gap:4px;">${monthdayBtns}</div>
            <div class="validation-msg" id="${id('monthday-note')}">
              ⚠ No days selected — pick at least one
            </div>
          </div>

          <div id="${id('monthly-byday')}" class="sub-option" style="display:none;">
            <div class="form-row" style="margin-bottom:0;">
              <div class="row-controls">
                <span class="muted-text">The</span>
                <div class="select-wrap">
                  <select id="${id('month-setpos')}">${SETPOS_OPTIONS}</select>
                </div>
                <div class="select-wrap">
                  <select id="${id('month-byday')}">${BYDAY_OPTIONS}</select>
                </div>
                <span class="muted-text">of the month</span>
              </div>
            </div>
          </div>

          <hr class="section-divider">
        </div>

        <!-- YEARLY -->
        <div id="${id('section-yearly')}" class="collapsible">
          <div class="form-row">
            <label class="row-label">In Month</label>
            <div class="row-controls">
              <div class="radio-group">
                <label class="radio-label">
                  <input type="radio" name="${n('yearly-mode')}" value="one-month" checked> Single
                </label>
                <label class="radio-label">
                  <input type="radio" name="${n('yearly-mode')}" value="multi-month"> Multiple
                </label>
                <label class="radio-label">
                  <input type="radio" name="${n('yearly-mode')}" value="precise"> Precise
                </label>
              </div>
            </div>
          </div>

          <div id="${id('yearly-one-month')}" class="sub-option">
            <div class="row-controls">
              <span class="muted-text">On</span>
              <div class="select-wrap">
                <select id="${id('yearly-month')}">${MONTH_OPTIONS}</select>
              </div>
              <div class="select-wrap">
                <select id="${id('yearly-monthday')}">${MONTHDAY_OPTIONS}</select>
              </div>
            </div>
            <div class="validation-msg" id="${id('yearly-dayvalid')}"></div>
          </div>

          <div id="${id('yearly-multi-month')}" class="sub-option" style="display:none;">
            <div class="btn-grid">${yearlyMonthBtns}</div>
            <div class="validation-msg" id="${id('multimonth-note')}">
              ⚠ No months selected — pick at least one
            </div>
          </div>

          <div id="${id('yearly-precise')}" class="sub-option" style="display:none;">
            <div class="row-controls" style="flex-wrap:wrap;gap:8px;">
              <span class="muted-text">The</span>
              <div class="select-wrap">
                <select id="${id('yearly-setpos')}">${SETPOS_OPTIONS}</select>
              </div>
              <div class="select-wrap">
                <select id="${id('yearly-byday')}">${BYDAY_OPTIONS}</select>
              </div>
              <span class="muted-text">of</span>
              <div class="select-wrap">
                <select id="${id('yearly-precise-month')}">${MONTH_OPTIONS}</select>
              </div>
            </div>
          </div>

          <hr class="section-divider">
        </div>

        <!-- End condition -->
        <div class="form-row">
          <label class="row-label">Ends</label>
          <div class="row-controls">
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" name="${n('end-mode')}" value="forever" checked> Forever
              </label>
              <label class="radio-label">
                <input type="radio" name="${n('end-mode')}" value="count"> After
              </label>
              <label class="radio-label">
                <input type="radio" name="${n('end-mode')}" value="until"> On date
              </label>
            </div>
          </div>
        </div>

        <div id="${id('end-count-row')}" class="sub-option" style="display:none;">
          <div class="row-controls">
            <input type="number" id="${id('count-val')}" value="10" min="1" max="9999">
            <span class="muted-text">occurrences</span>
          </div>
        </div>

        <div id="${id('end-until-row')}" class="sub-option" style="display:none;">
          <div class="row-controls">
            <input type="date" id="${id('until-date')}">
            <input type="time" id="${id('until-time')}" value="00:00">
          </div>
          <div class="validation-msg" id="${id('until-note')}"></div>
        </div>

      </div>
    </div>
    <!-- ── Output panel ── -->
    <div class="output-card">
      <div class="output-header">
        <span class="label">RRULE</span>
      </div>
      <div class="output-body" id="${id('output-body')}">
        <!-- copy of the input (the original is hidden) -->
      </div>
    </div>

  </div>
  </form>`;
}

// ─── Rule builder ─────────────────────────────────────────────────────────────

/**
 * Read the current widget state and return:
 *   { rrule: string, warnings: string[] }
 *
 * All DOM queries are scoped to this widget's root via the $ / $$ / byId
 * helpers, so multiple widgets on the same page never interfere with each other.
 */
function buildRule($, $$, byId) {
	const isRecurring = $('input[name$="_event-recurring"]:checked').value === 'yes';

	const result = {
		rrule: '',
		warnings: [],
	};

	if (!isRecurring) return result;

	const freq = byId('freq').value;
	const interval = parseInt(byId('interval').value, 10) || 1;
	const endMode = $('input[name$="_end-mode"]:checked').value;

	const parts = {};
	parts.FREQ = freq;
	// INTERVAL=1 is the RFC 5545 default — omit it to keep output clean
	if (interval !== 1) parts.INTERVAL = interval;

	// Frequency-specific BY rules ──────────────────────────────────────────

	if (freq === 'WEEKLY') {
		const days = $$('.day-btn.active').map(b => b.dataset.day);
		// No BYDAY → RFC 5545 implicitly repeats on the start date's weekday. Warn only.
		if (days.length) parts.BYDAY = days.join(',');
	}

	if (freq === 'MONTHLY') {
		const mode = $('input[name$="_month-mode"]:checked').value;
		if (mode === 'bymonthday') {
			const mdays = $$('.monthday-btn.active').map(b => b.dataset.mday);
			if (mdays.length) {
				parts.BYMONTHDAY = mdays.join(',');
			} else {
				result.warnings.push('No days of month selected');
			}
		} else {
			// BYSETPOS requires a companion BYxxx rule (RFC 5545 §3.3.10).
			// BYDAY is always set here, satisfying that requirement.
			parts.BYDAY = byId('month-byday').value;
			parts.BYSETPOS = byId('month-setpos').value;
		}
	}

	if (freq === 'YEARLY') {
		const mode = $('input[name$="_yearly-mode"]:checked').value;
		if (mode === 'one-month') {
			const m = byId('yearly-month').value;
			const md = byId('yearly-monthday').value;
			parts.BYMONTH = m;
			parts.BYMONTHDAY = md;
			const daysInMonth = new Date(2000, parseInt(m, 10), 0).getDate();
			if (parseInt(md, 10) > daysInMonth) {
				result.warnings.push(`Day ${md} does not exist in that month — rule will yield no occurrences`);
			}
		} else if (mode === 'multi-month') {
			const months = $$('.yearly-month-btn.active').map(b => b.dataset.month);
			if (months.length) {
				parts.BYMONTH = months.join(',');
			} else {
				result.warnings.push('No months selected');
			}
		} else {
			// Precise: BYSETPOS + BYDAY + BYMONTH — all three present, satisfies RFC 5545 §3.3.10
			parts.BYMONTH = byId('yearly-precise-month').value;
			parts.BYDAY = byId('yearly-byday').value;
			parts.BYSETPOS = byId('yearly-setpos').value;
		}
	}

	// End condition ─────────────────────────────────────────────────────────
	// COUNT and UNTIL are mutually exclusive (RFC 5545 §3.3.10).
	// The three-way radio (forever / count / until) enforces this structurally.

	if (endMode === 'count') {
		const count = parseInt(byId('count-val').value, 10);
		if (count >= 1) parts.COUNT = count;
	} else if (endMode === 'until') {
		const ud = byId('until-date').value;
		const ut = byId('until-time').value;
		if (ud) {
			// RFC 5545: UNTIL must be in UTC for interoperability.
			const [y, m, d] = ud.split('-');
			const [hh, mm] = (ut || '00:00').split(':');
			parts.UNTIL = `${y}${m}${d}T${hh}${mm}00Z`;
		}
	}
	// 'forever' → neither COUNT nor UNTIL emitted

	// Assemble RRULE string ─────────────────────────────────────────────────
	// Canonical part order per RFC 5545 convention:
	// FREQ → UNTIL/COUNT → INTERVAL → BYDAY → BYMONTHDAY → BYMONTH → BYSETPOS
	const ORDER = ['FREQ', 'UNTIL', 'COUNT', 'INTERVAL', 'BYDAY', 'BYMONTHDAY', 'BYMONTH', 'BYSETPOS'];
	const rruleParts = ORDER
		.filter(k => parts[k] !== undefined)
		.map(k => `${k}=${parts[k]}`);
	//	result.rrule = 'RRULE:' + rruleParts.join(';');
	result.rrule = rruleParts.join(';');

	return result;
}

// ─── Output rendering ─────────────────────────────────────────────────────────

function updateOutput(root, $, $$, byId, targetInput, displayInput) {
	const rule = buildRule($, $$, byId);

	// Write the RRULE string to the original input AND the display one
	targetInput.value = rule.rrule; // this is hidden
	displayInput.value = rule.rrule; // this is in the RRULE display card


	// Remove stale global warnings then re-render current ones
	root.querySelectorAll('.global-warning').forEach(el => el.remove());
	const outputBody = byId('output-body');
	rule.warnings.forEach(w => {
		const el = document.createElement('div');
		el.className = 'validation-msg global-warning';
		el.style.marginTop = '6px';
		el.textContent = '⚠ ' + w;
		outputBody.appendChild(el);
	});

	updateInlineValidation($, $$, byId);
}

function updateInlineValidation($, $$, byId) {
	const freq = byId('freq').value;

	// Weekly: no days selected
	const weeklyNote = byId('weekly-note');
	if (weeklyNote) {
		const active = $$('.day-btn.active').length;
		weeklyNote.className = 'validation-msg' + (active ? ' ok' : '');
		weeklyNote.textContent = active
			? `✓ ${active} day${active > 1 ? 's' : ''} selected`
			: "⚠ No days selected — will repeat on the start date's weekday";
	}

	// Monthly: no month-days selected
	if (freq === 'MONTHLY') {
		const monthdayNote = byId('monthday-note');
		const mode = $('input[name$="_month-mode"]:checked')?.value;
		if (monthdayNote && mode === 'bymonthday') {
			const active = $$('.monthday-btn.active').length;
			monthdayNote.className = 'validation-msg' + (active ? ' ok' : '');
			monthdayNote.textContent = active
				? `✓ ${active} day${active > 1 ? 's' : ''} selected`
				: '⚠ No days selected — pick at least one';
		}
	}

	// Yearly: day/month validation
	if (freq === 'YEARLY') {
		const yearlyDayValid = byId('yearly-dayvalid');
		const mode = $('input[name$="_yearly-mode"]:checked')?.value;

		if (yearlyDayValid && mode === 'one-month') {
			const m = parseInt(byId('yearly-month').value, 10);
			const md = parseInt(byId('yearly-monthday').value, 10);
			const max = new Date(2000, m, 0).getDate();
			yearlyDayValid.className = 'validation-msg' + (md <= max ? ' ok' : '');
			yearlyDayValid.textContent = md <= max
				? '✓ Valid date'
				: `⚠ Day ${md} doesn't exist in this month (max ${max}) — will yield no occurrences`;
		} else if (yearlyDayValid) {
			yearlyDayValid.textContent = '';
		}

		const multiNote = byId('multimonth-note');
		if (multiNote && mode === 'multi-month') {
			const active = $$('.yearly-month-btn.active').length;
			multiNote.className = 'validation-msg' + (active ? ' ok' : '');
			multiNote.textContent = active
				? `✓ ${active} month${active > 1 ? 's' : ''} selected`
				: '⚠ No months selected — pick at least one';
		}
	}

	// Until: surface the UTC-formatted value as a confirmation
	const endMode = $('input[name$="_end-mode"]:checked').value;
	const untilNote = byId('until-note');
	if (untilNote) {
		if (endMode === 'until') {
			const ud = byId('until-date').value;
			untilNote.className = 'validation-msg' + (ud ? ' ok' : '');
			untilNote.textContent = ud ? '✓ End date set' : '⚠ No end date selected';
		} else {
			untilNote.textContent = '';
		}
	}
}

// ─── Visibility helpers ───────────────────────────────────────────────────────

function applyFreqVisibility(byId) {
	['section-weekly', 'section-monthly', 'section-yearly'].forEach(s => {
		byId(s)?.classList.remove('visible');
	});
	const freq = byId('freq').value;
	if (freq === 'WEEKLY') byId('section-weekly')?.classList.add('visible');
	if (freq === 'MONTHLY') byId('section-monthly')?.classList.add('visible');
	if (freq === 'YEARLY') byId('section-yearly')?.classList.add('visible');
}

function applyMonthModeVisibility($, byId) {
	const mode = $('input[name$="_month-mode"]:checked')?.value;
	if (!mode) return;
	byId('monthly-bymonthday').style.display = mode === 'bymonthday' ? '' : 'none';
	byId('monthly-byday').style.display = mode === 'byday' ? '' : 'none';
}

function applyYearlyModeVisibility($, byId) {
	['yearly-one-month', 'yearly-multi-month', 'yearly-precise'].forEach(s => {
		byId(s).style.display = 'none';
	});
	const mode = $('input[name$="_yearly-mode"]:checked')?.value;
	if (mode === 'one-month') byId('yearly-one-month').style.display = '';
	if (mode === 'multi-month') byId('yearly-multi-month').style.display = '';
	if (mode === 'precise') byId('yearly-precise').style.display = '';
}

function applyEndModeVisibility($, byId) {
	byId('end-count-row').style.display = 'none';
	byId('end-until-row').style.display = 'none';
	const mode = $('input[name$="_end-mode"]:checked').value;
	if (mode === 'count') byId('end-count-row').style.display = '';
	if (mode === 'until') byId('end-until-row').style.display = '';
}

// ─── Event listeners ──────────────────────────────────────────────────────────

function attachListeners(root, $, $$, byId, targetInput, displayInput) {
	const refresh = () => updateOutput(root, $, $$, byId, targetInput, displayInput);

	// Recurring toggle
	$$('input[name$="_event-recurring"]').forEach(r => {
		r.addEventListener('change', () => {
			byId('rrule-card').classList.toggle('visible', r.value === 'yes' && r.checked);
			refresh();
		});
	});

	// Frequency
	byId('freq').addEventListener('change', () => {
		applyFreqVisibility(byId);
		refresh();
	});

	// Interval
	byId('interval').addEventListener('input', refresh);

	// Toggle buttons (day / month pickers).
	// Delegated to the widget root — not document — so clicks never
	// accidentally trigger a sibling widget's handler.
	root.addEventListener('click', e => {
		if (e.target.classList.contains('btn-toggle') && !e.target.disabled) {
			e.preventDefault();
			e.target.classList.toggle('active');
			refresh();
		}
	});

	// Monthly mode
	$$('input[name$="_month-mode"]').forEach(r =>
		r.addEventListener('change', () => { applyMonthModeVisibility($, byId); refresh(); })
	);

	// Yearly mode
	$$('input[name$="_yearly-mode"]').forEach(r =>
		r.addEventListener('change', () => { applyYearlyModeVisibility($, byId); refresh(); })
	);

	// End mode
	$$('input[name$="_end-mode"]').forEach(r =>
		r.addEventListener('change', () => { applyEndModeVisibility($, byId); refresh(); })
	);

	// All scalar inputs / selects that feed buildRule()
	[
		'until-date', 'until-time', 'count-val',
		'month-setpos', 'month-byday',
		'yearly-month', 'yearly-monthday',
		'yearly-setpos', 'yearly-byday', 'yearly-precise-month',
	].forEach(suffix => {
		const el = byId(suffix);
		if (!el) return;
		el.addEventListener('change', refresh);
		el.addEventListener('input', refresh);
	});

}

// ─── Auto-initialise on DOMContentLoaded ─────────────────────────────────────

/**
 * Automatically attach a widget to every
 *   <input data-rrule-generator-form>
 * found in the document at page load.
 */
document.addEventListener('DOMContentLoaded', () => {
	document.querySelectorAll('input[data-rrule-generator-form]').forEach(input => {
		if (input.name === null || input.name === '') {
			console.error('rrule-generator-form abandoning. Input element has no name attribute:', input);
			return;
		}
		console.info('rrule-generator-form initializing on input[name="' + input.name + '"]');
		var input_display = input.cloneNode(true);
		RRuleGenerator(input, input_display);
	});
});
