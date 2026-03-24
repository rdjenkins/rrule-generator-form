import './style.css';

// ─── Templates ───────────────────────────────────────────────────────

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

// ─── Instance counter — guarantees unique IDs if multiple widgets exist ─────

let _instanceCount = 0;

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * RRuleGenerator(targetInput)
 *
 * Attaches an RRULE editor widget to a given <input> element.
 * The input is hidden (but remains in the DOM / form) and its value is kept
 * in sync with the widget so the form submits the correct RRULE string.
 *
 * @param {HTMLInputElement} targetInput  The input to attach to.
 * @returns {{ destroy: Function }}       Call destroy() to remove the widget.
 */
function RRuleGenerator(targetInput) {
	// ── Unique prefix for all internal IDs in this instance ─────────────────
	const uid = `rrg${++_instanceCount}`;
	const id = suffix => `${uid}-${suffix}`;

	// ── Hide the target input — keep it in the form for submission ───────────
	targetInput.type = 'hidden';
	targetInput.value = '';

	// ── Build and inject the widget markup ───────────────────────────────────
	const widget = document.createElement('div');
	widget.className = 'rrule-generator-widget';
	widget.dataset.uid = uid;
	widget.innerHTML = buildTemplate(uid, id);

	// Insert immediately after the target input
	targetInput.insertAdjacentElement('afterend', widget);

	// ── Scoped query helpers (never leak outside this widget) ────────────────
	const root = widget;
	const $ = sel => root.querySelector(sel);
	const $$ = sel => Array.from(root.querySelectorAll(sel));
	const byId = suffix => root.querySelector(`#${id(suffix)}`);

	// ── Initialise defaults ──────────────────────────────────────────────────
	const today = new Date().toISOString().split('T')[0];
	byId('start-date').value = today;
	byId('until-date').value = today;
	populateTimezones(root, id);

	// ── Wire up all event listeners ──────────────────────────────────────────
	attachListeners(root, $, $$, byId, id, targetInput);

	// ── Apply initial visibility and render first output ─────────────────────
	applyFreqVisibility(byId);
	applyMonthModeVisibility($, byId);
	applyYearlyModeVisibility($, byId);
	applyEndModeVisibility($, byId);
	updateOutput(root, $, $$, byId, targetInput);

	// ── Public API ────────────────────────────────────────────────────────────
	return {
		/** Remove the widget and restore the original input. */
		destroy() {
			widget.remove();
			targetInput.type = 'text';
			targetInput.value = ''; // TODO there may be existing values of course!
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

	// Radio/select name attributes are also prefixed so sibling widgets
	// don't share the same radio groups
	const n = suffix => `${uid}_${suffix}`;

	return `
  <div class="rrule-widget-inner">

    <div class="page-header">
      <h1>RRULE Generator</h1>
      <span class="badge">RFC 5545</span>
    </div>

    <!-- ── Event Timing card ── -->
    <div class="card">
      <div class="card-header"><div class="dot"></div><span>Event Timing</span></div>
      <div class="card-body">

        <div class="form-row">
          <label class="row-label">DTSTART</label>
          <div class="row-controls">
            <input type="date" id="${id('start-date')}">
            <input type="time" id="${id('start-time')}" value="00:00">
            <div class="select-wrap">
              <select id="${id('tz-select')}"></select>
            </div>
          </div>
        </div>

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
        <span class="label">Output</span>
        <button type="button" class="copy-btn" id="${id('copy-btn')}">Copy</button>
      </div>
      <div class="output-body" id="${id('output-body')}">
        <div class="output-line" id="${id('output-dtstart')}"></div>
        <div class="output-line" id="${id('output-rrule')}"></div>
        <div class="tz-note"    id="${id('tz-note')}"></div>
      </div>
    </div>

  </div>`;
}

// ─── Timezone helpers ─────────────────────────────────────────────────────────

function getLocalTimezone() {
	try { return Intl.DateTimeFormat().resolvedOptions().timeZone; }
	catch (e) { return 'UTC'; }
}

const TIMEZONE_LIST = [
	'UTC',
	'Europe/London', 'Europe/Dublin', 'Europe/Lisbon',
	'Europe/Paris', 'Europe/Berlin', 'Europe/Rome', 'Europe/Madrid', 'Europe/Amsterdam',
	'Europe/Brussels', 'Europe/Zurich', 'Europe/Vienna', 'Europe/Prague', 'Europe/Warsaw',
	'Europe/Stockholm', 'Europe/Oslo', 'Europe/Copenhagen', 'Europe/Helsinki',
	'Europe/Athens', 'Europe/Bucharest', 'Europe/Sofia', 'Europe/Istanbul',
	'Europe/Moscow', 'Europe/Kiev',
	'Asia/Kolkata', 'Asia/Karachi', 'Asia/Dhaka', 'Asia/Colombo',
	'Asia/Almaty', 'Asia/Tashkent', 'Asia/Yekaterinburg',
	'Asia/Dubai', 'Asia/Baghdad', 'Asia/Riyadh', 'Asia/Tehran',
	'Asia/Bangkok', 'Asia/Jakarta', 'Asia/Kuala_Lumpur', 'Asia/Singapore',
	'Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Taipei', 'Asia/Tokyo', 'Asia/Seoul',
	'Asia/Vladivostok', 'Asia/Magadan', 'Asia/Kamchatka',
	'Australia/Perth', 'Australia/Darwin', 'Australia/Adelaide',
	'Australia/Brisbane', 'Australia/Sydney', 'Australia/Melbourne', 'Australia/Hobart',
	'Pacific/Auckland', 'Pacific/Fiji', 'Pacific/Honolulu', 'Pacific/Tahiti',
	'Pacific/Guam', 'Pacific/Port_Moresby',
	'America/Anchorage', 'America/Los_Angeles', 'America/Denver', 'America/Phoenix',
	'America/Chicago', 'America/New_York', 'America/Indiana/Indianapolis',
	'America/Halifax', 'America/St_Johns', 'America/Sao_Paulo', 'America/Argentina/Buenos_Aires',
	'America/Santiago', 'America/Lima', 'America/Bogota', 'America/Caracas',
	'America/Mexico_City', 'America/Toronto', 'America/Vancouver',
	'America/Winnipeg', 'America/Edmonton', 'America/Regina',
	'Africa/Abidjan', 'Africa/Lagos', 'Africa/Nairobi', 'Africa/Cairo', 'Africa/Johannesburg',
];

function populateTimezones(root, id) {
	const sel = root.querySelector(`#${id('tz-select')}`);
	const local = getLocalTimezone();

	// Prepend the user's detected zone if it isn't already in the curated list
	if (!TIMEZONE_LIST.includes(local)) {
		const opt = document.createElement('option');
		opt.value = local;
		opt.textContent = local.replace(/_/g, ' ') + ' (local)';
		opt.selected = true;
		sel.appendChild(opt);
	}

	TIMEZONE_LIST.forEach(z => {
		const opt = document.createElement('option');
		opt.value = z;
		opt.textContent = z.replace(/_/g, ' ');
		if (z === local) opt.selected = true;
		sel.appendChild(opt);
	});
}

// ─── Date / time formatting ───────────────────────────────────────────────────

/**
 * Build an RFC 5545 DATE-TIME value string.
 * UTC   → "YYYYMMDDTHHmmssZ"
 * Local → "YYYYMMDDTHHmmss"  (TZID param is carried separately in DTSTART)
 */
function formatDateTime(dateStr, timeStr, tz) {
	if (!dateStr) return '';
	const [y, m, d] = dateStr.split('-');
	const [hh, mm] = (timeStr || '00:00').split(':');
	const base = `${y}${m}${d}T${hh}${mm}00`;
	return tz === 'UTC' ? base + 'Z' : base;
}

/**
 * Build the full DTSTART property string, including TZID param when needed.
 *   "DTSTART;TZID=Europe/London:20260323T090000"
 *   "DTSTART:20260323T090000Z"
 */
function buildDTSTART(dateStr, timeStr, tz) {
	const val = formatDateTime(dateStr, timeStr, tz);
	if (!val) return '';
	return tz === 'UTC'
		? `DTSTART:${val}`
		: `DTSTART;TZID=${tz}:${val}`;
}

// ─── Rule builder ─────────────────────────────────────────────────────────────

/**
 * Read the current widget state and return:
 *   { dtstart: string, rrule: string, warnings: string[] }
 *
 * All DOM queries are scoped to this widget's root via the $ / $$ / byId
 * helpers, so multiple widgets on the same page never interfere with each other.
 */
function buildRule($, $$, byId) {
	// name$= suffix-matches the prefixed radio name, e.g. "rrg1_event-recurring"
	const isRecurring = $('input[name$="_event-recurring"]:checked').value === 'yes';
	const dateStr = byId('start-date').value;
	const timeStr = byId('start-time').value;
	const tz = byId('tz-select').value;

	const result = {
		dtstart: buildDTSTART(dateStr, timeStr, tz),
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

	// ── Frequency-specific BY rules ──────────────────────────────────────────

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

	// ── End condition ─────────────────────────────────────────────────────────
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
			const untilVal = formatDateTime(ud, ut, 'UTC');
			parts.UNTIL = untilVal.endsWith('Z') ? untilVal : untilVal + 'Z';
			if (dateStr && ud < dateStr) {
				result.warnings.push('UNTIL is before DTSTART — rule will yield no occurrences');
			}
		}
	}
	// 'forever' → neither COUNT nor UNTIL emitted

	// ── Assemble RRULE string ─────────────────────────────────────────────────
	// Canonical part order per RFC 5545 convention:
	// FREQ → UNTIL/COUNT → INTERVAL → BYDAY → BYMONTHDAY → BYMONTH → BYSETPOS
	const ORDER = ['FREQ', 'UNTIL', 'COUNT', 'INTERVAL', 'BYDAY', 'BYMONTHDAY', 'BYMONTH', 'BYSETPOS'];
	const rruleParts = ORDER
		.filter(k => parts[k] !== undefined)
		.map(k => `${k}=${parts[k]}`);
	result.rrule = 'RRULE:' + rruleParts.join(';');

	return result;
}

// ─── Output rendering ─────────────────────────────────────────────────────────

function escHtml(s) {
	return String(s)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

function colouriseDTSTART(line) {
	const col = line.indexOf(':');
	if (col === -1) return escHtml(line);
	const prop = line.slice(0, col);
	const val = line.slice(col + 1);
	const semi = prop.indexOf(';');
	if (semi === -1) {
		return `<span class="rr-key">${escHtml(prop)}:</span><span class="rr-val">${escHtml(val)}</span>`;
	}
	const propName = prop.slice(0, semi);
	const param = prop.slice(semi + 1);
	return (
		`<span class="rr-key">${escHtml(propName)}</span>` +
		`<span class="rr-sep">;</span>` +
		`<span class="prop-param">${escHtml(param)}</span>` +
		`<span class="rr-sep">:</span>` +
		`<span class="rr-val">${escHtml(val)}</span>`
	);
}

function colouriseRRule(line) {
	if (!line.startsWith('RRULE:')) return escHtml(line);
	const inner = line.slice(6).split(';').map(part => {
		const eq = part.indexOf('=');
		if (eq === -1) return `<span class="rr-val">${escHtml(part)}</span>`;
		const k = part.slice(0, eq);
		const v = part.slice(eq + 1);
		return `<span class="rr-key">${escHtml(k)}</span><span class="rr-sep">=</span><span class="rr-val">${escHtml(v)}</span>`;
	}).join('<span class="rr-sep">;</span>');
	return `<span class="rr-key">RRULE:</span>${inner}`;
}

function updateOutput(root, $, $$, byId, targetInput) {
	const rule = buildRule($, $$, byId);

	// ── Keep the hidden input in sync so the parent form submits correctly ───
	targetInput.value = [rule.dtstart, rule.rrule].filter(Boolean).join('\n');

	// ── Refresh the visible output panel ─────────────────────────────────────
	const dtEl = byId('output-dtstart');
	const rrEl = byId('output-rrule');
	const tzEl = byId('tz-note');

	dtEl.innerHTML = rule.dtstart
		? colouriseDTSTART(rule.dtstart)
		: '<span style="color:var(--muted)">—</span>';

	rrEl.innerHTML = rule.rrule ? colouriseRRule(rule.rrule) : '';
	rrEl.style.marginTop = rule.rrule ? '4px' : '0';

	const tz = byId('tz-select').value;
	tzEl.textContent = (rule.rrule && tz !== 'UTC')
		? 'ℹ DTSTART uses TZID parameter — consumers must support VTIMEZONE or system tz data'
		: '';

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

	// Until: end date before start date
	const endMode = $('input[name$="_end-mode"]:checked').value;
	const untilNote = byId('until-note');
	if (untilNote && endMode === 'until') {
		const sd = byId('start-date').value;
		const ud = byId('until-date').value;
		if (sd && ud) {
			const bad = ud < sd;
			untilNote.className = 'validation-msg' + (bad ? '' : ' ok');
			untilNote.textContent = bad
				? '⚠ Until date is before start date'
				: '✓ Valid end date';
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

function attachListeners(root, $, $$, byId, id, targetInput) {
	const refresh = () => updateOutput(root, $, $$, byId, targetInput);

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
		'start-date', 'start-time', 'tz-select',
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

	// Copy button
	byId('copy-btn').addEventListener('click', () => {
		const rule = buildRule($, $$, byId);
		const text = [rule.dtstart, rule.rrule].filter(Boolean).join('\n');
		navigator.clipboard.writeText(text).then(() => {
			const btn = byId('copy-btn');
			btn.textContent = 'Copied!';
			btn.classList.add('copied');
			setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1500);
		});
	});
}

// ─── Auto-initialise on DOMContentLoaded ─────────────────────────────────────

/**
 * Automatically attach a widget to every
 *   <input data-rrule-generator-form>
 * found in the document at page load.
 *
 * You can also call RRuleGenerator(inputEl) manually at any time after the
 * DOM is ready (e.g. for dynamically inserted inputs).
 */
document.addEventListener('DOMContentLoaded', () => {
	document.querySelectorAll('input[data-rrule-generator-form]').forEach(input => {
		RRuleGenerator(input);
	});
});

export { RRuleGenerator };