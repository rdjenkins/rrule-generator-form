/*

RRULE GENERATOR FORM aka RRULE GUI

MIT License

Copyright (c) 2016 Jordan Roberts
Updated (c) 2026 Dean Jenkins

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


*/

import './style.css';

// ─── Template helpers ─────────────────────────────────────────────────────────

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

function monthOptions(selectId) {
	return MONTHS_LONG.map((m, i) => `<option value="${i + 1}">${m}</option>`).join('');
}

function monthdayOptions() {
	return Array.from({ length: 31 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('');
}

// ─── DOM injection ────────────────────────────────────────────────────────────

function renderApp() {
	document.body.innerHTML = `
    <header class="page-header">
      <h1>RRULE Generator</h1>
      <span class="badge">RFC 5545</span>
    </header>

    <!-- Event Timing card -->
    <div class="card">
      <div class="card-header"><div class="dot"></div><span>Event Timing</span></div>
      <div class="card-body">

        <div class="form-row">
          <label class="row-label">DTSTART</label>
          <div class="row-controls">
            <input type="date" id="start-date">
            <input type="time" id="start-time" value="00:00">
            <div class="select-wrap">
              <select id="tz-select"></select>
            </div>
          </div>
        </div>

        <div class="form-row">
          <label class="row-label">Recurring</label>
          <div class="row-controls">
            <div class="radio-group">
              <label class="radio-label"><input type="radio" name="event-recurring" value="no" checked> No</label>
              <label class="radio-label"><input type="radio" name="event-recurring" value="yes"> Yes</label>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Recurrence Rule card — hidden until recurring=yes -->
    <div class="card collapsible" id="rrule-card">
      <div class="card-header"><div class="dot"></div><span>Recurrence Rule</span></div>
      <div class="card-body">

        <!-- Frequency + Interval -->
        <div class="form-row">
          <label class="row-label">Frequency</label>
          <div class="row-controls">
            <span class="muted-text">Every</span>
            <input type="number" id="interval" value="1" min="1" max="999">
            <div class="select-wrap">
              <select id="freq">
                <option value="DAILY">Days</option>
                <option value="WEEKLY">Weeks</option>
                <option value="MONTHLY">Months</option>
                <option value="YEARLY">Years</option>
              </select>
            </div>
          </div>
        </div>

        <hr class="section-divider">

        <!-- WEEKLY: day-of-week picker -->
        <div id="section-weekly" class="collapsible">
          <div class="form-row">
            <label class="row-label">On Days</label>
            <div class="row-controls" style="flex-direction:column;align-items:flex-start;">
              <div class="btn-grid">
                ${WEEKDAYS.map(d => `<button type="button" class="btn-toggle day-btn" data-day="${d}">${d}</button>`).join('')}
              </div>
              <div class="validation-msg" id="weekly-note">⚠ No days selected — will repeat on the start date's weekday</div>
            </div>
          </div>
          <hr class="section-divider">
        </div>

        <!-- MONTHLY options -->
        <div id="section-monthly" class="collapsible">
          <div class="form-row">
            <label class="row-label">By</label>
            <div class="row-controls">
              <div class="radio-group">
                <label class="radio-label"><input type="radio" name="month-mode" value="bymonthday" checked> Day of month</label>
                <label class="radio-label"><input type="radio" name="month-mode" value="byday"> Day of week</label>
              </div>
            </div>
          </div>

          <!-- by month-day grid -->
          <div id="monthly-bymonthday" class="sub-option">
            <div class="btn-grid" style="gap:4px;">
              ${Array.from({ length: 31 }, (_, i) =>
		`<button type="button" class="btn-toggle monthday-btn" data-mday="${i + 1}">${i + 1}</button>`
	).join('')}
            </div>
            <div class="validation-msg" id="monthday-note">⚠ No days selected — pick at least one</div>
          </div>

          <!-- by setpos + byday -->
          <div id="monthly-byday" class="sub-option" style="display:none;">
            <div class="form-row" style="margin-bottom:0;">
              <div class="row-controls">
                <span class="muted-text">The</span>
                <div class="select-wrap"><select id="month-setpos">${SETPOS_OPTIONS}</select></div>
                <div class="select-wrap"><select id="month-byday">${BYDAY_OPTIONS}</select></div>
                <span class="muted-text">of the month</span>
              </div>
            </div>
          </div>

          <hr class="section-divider">
        </div>

        <!-- YEARLY options -->
        <div id="section-yearly" class="collapsible">
          <div class="form-row">
            <label class="row-label">In Month</label>
            <div class="row-controls">
              <div class="radio-group">
                <label class="radio-label"><input type="radio" name="yearly-mode" value="one-month" checked> Single</label>
                <label class="radio-label"><input type="radio" name="yearly-mode" value="multi-month"> Multiple</label>
                <label class="radio-label"><input type="radio" name="yearly-mode" value="precise"> Precise</label>
              </div>
            </div>
          </div>

          <!-- single month + day -->
          <div id="yearly-one-month" class="sub-option">
            <div class="row-controls">
              <span class="muted-text">On</span>
              <div class="select-wrap"><select id="yearly-month">${monthOptions()}</select></div>
              <div class="select-wrap"><select id="yearly-monthday">${monthdayOptions()}</select></div>
            </div>
            <div class="validation-msg" id="yearly-dayvalid"></div>
          </div>

          <!-- multiple months -->
          <div id="yearly-multi-month" class="sub-option" style="display:none;">
            <div class="btn-grid">
              ${MONTHS_SHORT.map((m, i) =>
		`<button type="button" class="btn-toggle yearly-month-btn" data-month="${i + 1}">${m}</button>`
	).join('')}
            </div>
            <div class="validation-msg" id="multimonth-note">⚠ No months selected — pick at least one</div>
          </div>

          <!-- precise: setpos + byday + month -->
          <div id="yearly-precise" class="sub-option" style="display:none;">
            <div class="row-controls" style="flex-wrap:wrap;gap:8px;">
              <span class="muted-text">The</span>
              <div class="select-wrap"><select id="yearly-setpos">${SETPOS_OPTIONS}</select></div>
              <div class="select-wrap"><select id="yearly-byday">${BYDAY_OPTIONS}</select></div>
              <span class="muted-text">of</span>
              <div class="select-wrap"><select id="yearly-precise-month">${monthOptions()}</select></div>
            </div>
          </div>

          <hr class="section-divider">
        </div>

        <!-- End condition -->
        <div class="form-row">
          <label class="row-label">Ends</label>
          <div class="row-controls">
            <div class="radio-group">
              <label class="radio-label"><input type="radio" name="end-mode" value="forever" checked> Forever</label>
              <label class="radio-label"><input type="radio" name="end-mode" value="count"> After</label>
              <label class="radio-label"><input type="radio" name="end-mode" value="until"> On date</label>
            </div>
          </div>
        </div>

        <div id="end-count-row" class="sub-option" style="display:none;">
          <div class="row-controls">
            <input type="number" id="count-val" value="10" min="1" max="9999">
            <span class="muted-text">occurrences</span>
          </div>
        </div>

        <div id="end-until-row" class="sub-option" style="display:none;">
          <div class="row-controls">
            <input type="date" id="until-date">
            <input type="time" id="until-time" value="00:00">
          </div>
          <div class="validation-msg" id="until-note"></div>
        </div>

      </div>
    </div>

    <!-- Output -->
    <div class="output-card">
      <div class="output-header">
        <span class="label">Output</span>
        <button class="copy-btn" id="copy-btn">Copy</button>
      </div>
      <div class="output-body">
        <div class="output-line" id="output-dtstart"></div>
        <div class="output-line" id="output-rrule"></div>
        <div class="tz-note" id="tz-note"></div>
      </div>
    </div>
  `;
}

// ─── Timezone helpers ─────────────────────────────────────────────────────────

function getLocalTimezone() {
	try { return Intl.DateTimeFormat().resolvedOptions().timeZone; }
	catch (e) { return 'UTC'; }
}

function populateTimezones() {
	const sel = document.getElementById('tz-select');
	const zones = [
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

	const local = getLocalTimezone();

	// Prepend the user's local zone if it isn't already in the list
	if (!zones.includes(local)) {
		const opt = document.createElement('option');
		opt.value = local;
		opt.textContent = local.replace(/_/g, ' ') + ' (local)';
		opt.selected = true;
		sel.appendChild(opt);
	}

	zones.forEach(z => {
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
 * UTC  → "YYYYMMDDTHHmmssZ"
 * Local → "YYYYMMDDTHHmmss"  (TZID carried separately in DTSTART param)
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
 * e.g. "DTSTART;TZID=Europe/London:20260323T090000"
 *   or "DTSTART:20260323T090000Z"
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
 * Read the current form state and return:
 *   { dtstart: string, rrule: string, warnings: string[] }
 *
 * dtstart and rrule are separate RFC 5545 property strings.
 * rrule is empty ('') when the event is not recurring.
 */
function buildRule() {
	const isRecurring = document.querySelector('input[name="event-recurring"]:checked').value === 'yes';
	const dateStr = document.getElementById('start-date').value;
	const timeStr = document.getElementById('start-time').value;
	const tz = document.getElementById('tz-select').value;

	const result = {
		dtstart: buildDTSTART(dateStr, timeStr, tz),
		rrule: '',
		warnings: [],
	};

	if (!isRecurring) return result;

	const freq = document.getElementById('freq').value;
	const interval = parseInt(document.getElementById('interval').value, 10) || 1;
	const endMode = document.querySelector('input[name="end-mode"]:checked').value;

	const parts = {};
	parts.FREQ = freq;
	// INTERVAL=1 is the RFC 5545 default — omit it to keep output clean
	if (interval !== 1) parts.INTERVAL = interval;

	// ── Frequency-specific BY rules ──────────────────────────────────────────

	if (freq === 'WEEKLY') {
		const days = Array.from(document.querySelectorAll('.day-btn.active')).map(b => b.dataset.day);
		// No BYDAY → RFC 5545 implicitly repeats on the start date's weekday. We warn but don't error.
		if (days.length) parts.BYDAY = days.join(',');
	}

	if (freq === 'MONTHLY') {
		const mode = document.querySelector('input[name="month-mode"]:checked').value;
		if (mode === 'bymonthday') {
			const mdays = Array.from(document.querySelectorAll('.monthday-btn.active')).map(b => b.dataset.mday);
			if (mdays.length) {
				parts.BYMONTHDAY = mdays.join(',');
			} else {
				result.warnings.push('No days of month selected');
			}
		} else {
			// BYSETPOS requires a companion BYxxx rule (RFC 5545 §3.3.10).
			// BYDAY is always set here, satisfying that requirement.
			parts.BYDAY = document.getElementById('month-byday').value;
			parts.BYSETPOS = document.getElementById('month-setpos').value;
		}
	}

	if (freq === 'YEARLY') {
		const mode = document.querySelector('input[name="yearly-mode"]:checked').value;
		if (mode === 'one-month') {
			const m = document.getElementById('yearly-month').value;
			const md = document.getElementById('yearly-monthday').value;
			parts.BYMONTH = m;
			parts.BYMONTHDAY = md;
			const daysInMonth = new Date(2000, parseInt(m, 10), 0).getDate();
			if (parseInt(md, 10) > daysInMonth) {
				result.warnings.push(`Day ${md} does not exist in that month — rule will yield no occurrences`);
			}
		} else if (mode === 'multi-month') {
			const months = Array.from(document.querySelectorAll('.yearly-month-btn.active')).map(b => b.dataset.month);
			if (months.length) {
				parts.BYMONTH = months.join(',');
			} else {
				result.warnings.push('No months selected');
			}
		} else {
			// Precise: BYSETPOS + BYDAY + BYMONTH — all three present, satisfies RFC 5545 §3.3.10
			parts.BYMONTH = document.getElementById('yearly-precise-month').value;
			parts.BYDAY = document.getElementById('yearly-byday').value;
			parts.BYSETPOS = document.getElementById('yearly-setpos').value;
		}
	}

	// ── End condition ─────────────────────────────────────────────────────────
	// COUNT and UNTIL are mutually exclusive (RFC 5545 §3.3.10).
	// The three-way radio (forever / count / until) enforces this structurally.

	if (endMode === 'count') {
		const count = parseInt(document.getElementById('count-val').value, 10);
		if (count >= 1) parts.COUNT = count;
	} else if (endMode === 'until') {
		const ud = document.getElementById('until-date').value;
		const ut = document.getElementById('until-time').value;
		if (ud) {
			// RFC 5545: UNTIL should be in UTC for interoperability.
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

/** Syntax-colour a DTSTART property string. */
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

/** Syntax-colour an RRULE property string. */
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

function updateOutput() {
	const rule = buildRule();

	const dtEl = document.getElementById('output-dtstart');
	const rrEl = document.getElementById('output-rrule');
	const tzEl = document.getElementById('tz-note');

	dtEl.innerHTML = rule.dtstart
		? colouriseDTSTART(rule.dtstart)
		: '<span style="color:var(--muted)">—</span>';

	rrEl.innerHTML = rule.rrule ? colouriseRRule(rule.rrule) : '';
	rrEl.style.marginTop = rule.rrule ? '4px' : '0';

	const tz = document.getElementById('tz-select').value;
	tzEl.textContent = (rule.rrule && tz !== 'UTC')
		? 'ℹ DTSTART uses TZID parameter — consumers must support VTIMEZONE or system tz data'
		: '';

	// Remove any previous global warnings, then re-add current ones
	document.querySelectorAll('.global-warning').forEach(el => el.remove());
	rule.warnings.forEach(w => {
		const el = document.createElement('div');
		el.className = 'validation-msg global-warning';
		el.style.marginTop = '6px';
		el.textContent = '⚠ ' + w;
		document.querySelector('.output-body').appendChild(el);
	});

	updateInlineValidation();
}

function updateInlineValidation() {
	const freq = document.getElementById('freq').value;

	// Weekly: no days selected
	const weeklyNote = document.getElementById('weekly-note');
	if (weeklyNote) {
		const active = document.querySelectorAll('.day-btn.active').length;
		weeklyNote.className = 'validation-msg' + (active ? ' ok' : '');
		weeklyNote.textContent = active
			? `✓ ${active} day${active > 1 ? 's' : ''} selected`
			: "⚠ No days selected — will repeat on the start date's weekday";
	}

	// Monthly bymonthday: no days selected
	if (freq === 'MONTHLY') {
		const monthdayNote = document.getElementById('monthday-note');
		const mode = document.querySelector('input[name="month-mode"]:checked')?.value;
		if (monthdayNote && mode === 'bymonthday') {
			const active = document.querySelectorAll('.monthday-btn.active').length;
			monthdayNote.className = 'validation-msg' + (active ? ' ok' : '');
			monthdayNote.textContent = active
				? `✓ ${active} day${active > 1 ? 's' : ''} selected`
				: '⚠ No days selected — pick at least one';
		}
	}

	// Yearly one-month: validate day exists in month
	if (freq === 'YEARLY') {
		const yearlyDayValid = document.getElementById('yearly-dayvalid');
		const mode = document.querySelector('input[name="yearly-mode"]:checked')?.value;

		if (yearlyDayValid && mode === 'one-month') {
			const m = parseInt(document.getElementById('yearly-month').value, 10);
			const md = parseInt(document.getElementById('yearly-monthday').value, 10);
			const max = new Date(2000, m, 0).getDate();
			yearlyDayValid.className = 'validation-msg' + (md <= max ? ' ok' : '');
			yearlyDayValid.textContent = md <= max
				? '✓ Valid date'
				: `⚠ Day ${md} doesn't exist in this month (max ${max}) — will yield no occurrences`;
		} else if (yearlyDayValid) {
			yearlyDayValid.textContent = '';
		}

		// Yearly multi-month: no months selected
		const multiNote = document.getElementById('multimonth-note');
		if (multiNote && mode === 'multi-month') {
			const active = document.querySelectorAll('.yearly-month-btn.active').length;
			multiNote.className = 'validation-msg' + (active ? ' ok' : '');
			multiNote.textContent = active
				? `✓ ${active} month${active > 1 ? 's' : ''} selected`
				: '⚠ No months selected — pick at least one';
		}
	}

	// Until: date before start
	const endMode = document.querySelector('input[name="end-mode"]:checked').value;
	const untilNote = document.getElementById('until-note');
	if (untilNote && endMode === 'until') {
		const sd = document.getElementById('start-date').value;
		const ud = document.getElementById('until-date').value;
		if (sd && ud) {
			const bad = ud < sd;
			untilNote.className = 'validation-msg' + (bad ? '' : ' ok');
			untilNote.textContent = bad
				? '⚠ Until date is before start date'
				: '✓ Valid end date';
		}
	}
}

// ─── UI visibility helpers ────────────────────────────────────────────────────

const showSection = id => document.getElementById(id)?.classList.add('visible');
const hideSection = id => document.getElementById(id)?.classList.remove('visible');
const showEl = id => { const el = document.getElementById(id); if (el) el.style.display = ''; };
const hideEl = id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; };

function applyFreqVisibility() {
	['section-weekly', 'section-monthly', 'section-yearly'].forEach(hideSection);
	const freq = document.getElementById('freq').value;
	if (freq === 'WEEKLY') showSection('section-weekly');
	if (freq === 'MONTHLY') showSection('section-monthly');
	if (freq === 'YEARLY') showSection('section-yearly');
}

function applyMonthModeVisibility() {
	const mode = document.querySelector('input[name="month-mode"]:checked')?.value;
	if (!mode) return;
	document.getElementById('monthly-bymonthday').style.display = mode === 'bymonthday' ? '' : 'none';
	document.getElementById('monthly-byday').style.display = mode === 'byday' ? '' : 'none';
}

function applyYearlyModeVisibility() {
	['yearly-one-month', 'yearly-multi-month', 'yearly-precise'].forEach(hideEl);
	const mode = document.querySelector('input[name="yearly-mode"]:checked')?.value;
	if (mode === 'one-month') showEl('yearly-one-month');
	if (mode === 'multi-month') showEl('yearly-multi-month');
	if (mode === 'precise') showEl('yearly-precise');
}

function applyEndModeVisibility() {
	['end-count-row', 'end-until-row'].forEach(hideEl);
	const mode = document.querySelector('input[name="end-mode"]:checked').value;
	if (mode === 'count') showEl('end-count-row');
	if (mode === 'until') showEl('end-until-row');
}

// ─── Event listeners ──────────────────────────────────────────────────────────

function attachListeners() {
	// Recurring toggle
	document.querySelectorAll('input[name="event-recurring"]').forEach(r => {
		r.addEventListener('change', () => {
			document.getElementById('rrule-card').classList.toggle('visible', r.value === 'yes' && r.checked);
			updateOutput();
		});
	});

	// Frequency select
	document.getElementById('freq').addEventListener('change', () => {
		applyFreqVisibility();
		updateOutput();
	});

	// Interval number input
	document.getElementById('interval').addEventListener('input', updateOutput);

	// Toggle buttons (days / months) — delegated to document
	document.addEventListener('click', e => {
		if (e.target.classList.contains('btn-toggle') && !e.target.disabled) {
			e.preventDefault();
			e.target.classList.toggle('active');
			updateOutput();
		}
	});

	// Monthly mode radios
	document.querySelectorAll('input[name="month-mode"]').forEach(r =>
		r.addEventListener('change', () => { applyMonthModeVisibility(); updateOutput(); })
	);

	// Yearly mode radios
	document.querySelectorAll('input[name="yearly-mode"]').forEach(r =>
		r.addEventListener('change', () => { applyYearlyModeVisibility(); updateOutput(); })
	);

	// End mode radios
	document.querySelectorAll('input[name="end-mode"]').forEach(r =>
		r.addEventListener('change', () => { applyEndModeVisibility(); updateOutput(); })
	);

	// All remaining inputs and selects that feed into buildRule()
	const watchIds = [
		'start-date', 'start-time', 'tz-select',
		'until-date', 'until-time', 'count-val',
		'month-setpos', 'month-byday',
		'yearly-month', 'yearly-monthday',
		'yearly-setpos', 'yearly-byday', 'yearly-precise-month',
	];
	watchIds.forEach(id => {
		const el = document.getElementById(id);
		if (!el) return;
		el.addEventListener('change', updateOutput);
		el.addEventListener('input', updateOutput);
	});

	// Copy button
	document.getElementById('copy-btn').addEventListener('click', () => {
		const rule = buildRule();
		const text = [rule.dtstart, rule.rrule].filter(Boolean).join('\n');
		navigator.clipboard.writeText(text).then(() => {
			const btn = document.getElementById('copy-btn');
			btn.textContent = 'Copied!';
			btn.classList.add('copied');
			setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1500);
		});
	});
}

// ─── Init ─────────────────────────────────────────────────────────────────────

function init() {
	renderApp();

	// Set default dates
	const today = new Date().toISOString().split('T')[0];
	document.getElementById('start-date').value = today;
	document.getElementById('until-date').value = today;

	populateTimezones();
	attachListeners();
	applyFreqVisibility();
	applyMonthModeVisibility();
	applyYearlyModeVisibility();
	applyEndModeVisibility();
	updateOutput();
}

init();