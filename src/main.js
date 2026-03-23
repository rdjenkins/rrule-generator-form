import './style.css';

let recurringRule = {};

const formatDate = (dateStr) => dateStr.replace(/-/g, '');

const INITIAL_STATE = () => {
	const today = new Date().toISOString().split('T')[0];
	return {
		freq: "DAILY",
		dtstart: formatDate(today) + 'T000000Z',
		interval: "1",
		byday: "",
		bysetpos: "",
		bymonthday: "",
		bymonth: "",
		count: "1",
		until: ""
	};
};

function init() {
	recurringRule = INITIAL_STATE();
	renderForm();
	attachListeners();
	updateOutput();
}

function renderForm() {
	const container = document.getElementById('rrule-form-container');
	const today = new Date().toISOString().split('T')[0];

	// Helper for precise selects to avoid repetition
	const setPosOptions = `
        <option value="1">First</option>
        <option value="2">Second</option>
        <option value="3">Third</option>
        <option value="4">Fourth</option>
        <option value="5">Fifth</option>
        <option value="-1">Last</option>`;

	const dayOptions = `
        <option value="SU,MO,TU,WE,TH,FR,SA" selected>Day</option>
        <option value="MO,TU,WE,TH,FR">Weekday</option>
        <option value="SU,SA">Weekend day</option>
        <option value="MO">Monday</option>
        <option value="TU">Tuesday</option>
        <option value="WE">Wednesday</option>
        <option value="TH">Thursday</option>
        <option value="FR">Friday</option>
        <option value="SA">Saturday</option>
		<option value="SU">Sunday</option>
`;

	container.innerHTML = `
    <form id="rrule-gen">
        <div class="form-container">
            <div class="form-row">
                <label>Start Date</label>
                <div class="input-content">
                    <input type="date" id="start-date" value="${today}">
                </div>
            </div>

            <div class="form-row">
                <label>Recurring?</label>
                <div class="input-content">
                    <label><input type="radio" name="event-recurring" value="no" checked> No</label>
                    <label><input type="radio" name="event-recurring" value="yes"> Yes</label>
                </div>
            </div>

            <div id="recurring-rules" style="display:none;">
                <hr>
                <div class="form-row">
                    <label>Frequency</label>
                    <div class="input-content">
                        <select name="freq" style="flex: 2;">
                            <option value="DAILY">Daily</option>
                            <option value="WEEKLY">Weekly</option>
                            <option value="MONTHLY">Monthly</option>
                            <option value="YEARLY">Yearly</option>
                        </select>
                        <span>Every</span>
                        <input type="number" name="interval" value="1" min="1" style="flex: 1;">
                        <span class="freq-selection-label">days</span>
                    </div>
                </div>

                <div id="weekday-select" class="weeks-choice" style="display:none;">
                    <label>Repeat on:</label>
                    <div class="btn-grid">
                        ${['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(d => `<button type="button" class="btn-toggle day-btn" data-day="${d}">${d}</button>`).join('')}
                    </div>
                </div>

                <div id="monthday-select" class="months-choice" style="display:none;">
                    <div class="form-row"><label><input type="radio" name="month-options" value="bymonthday" checked> On Days:</label></div>
                    <div class="btn-grid" style="grid-template-columns: repeat(7, 1fr);">
                        ${Array.from({ length: 31 }, (_, i) => `<button type="button" class="btn-toggle monthday-btn" data-mday="${i + 1}">${i + 1}</button>`).join('')}
                    </div>
                    <div class="form-row" style="margin-top:10px;"><label><input type="radio" name="month-options" value="precise"> Or precise:</label></div>
                    <div class="input-content">
                        <select name="month-setpos" class="month-precise-ctrl" disabled>${setPosOptions}</select>
                        <select name="month-byday" class="month-precise-ctrl" disabled>${dayOptions}</select>
                    </div>
                </div>

                <div id="yearly-select" class="years-choice" style="display:none;">
                    <div class="form-row"><label><input type="radio" name="yearly-options" value="one-month" checked> Single Month</label></div>
                    <div class="input-content">
                        <select name="yearly-bymonth" class="yearly-one-month-ctrl">
                            ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => `<option value="${i + 1}">${m}</option>`).join('')}
                        </select>
                        <select name="yearly-bymonthday" class="yearly-one-month-ctrl">
                            ${Array.from({ length: 31 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('')}
                        </select>
                    </div>

                    <div class="form-row"><label><input type="radio" name="yearly-options" value="multiple-months"> Multiple Months</label></div>
                    <div class="btn-grid month-btn-grid">
                        ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => `<button type="button" class="btn-toggle yearly-month-btn" data-month="${i + 1}" disabled>${m}</button>`).join('')}
                    </div>

                    <div class="form-row"><label><input type="radio" name="yearly-options" value="precise"> Precise Yearly</label></div>
                    <div class="input-content">
                        <select name="yearly-setpos" class="yearly-precise-ctrl" disabled>${setPosOptions}</select>
                        <select name="yearly-byday" class="yearly-precise-ctrl" disabled>${dayOptions}</select>
                        <select name="yearly-bymonth-precise" class="yearly-precise-ctrl" disabled>
                             ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => `<option value="${i + 1}">${m}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div id="until-rules" style="margin-top:20px;">
                    <div class="form-row">
                        <label><input type="radio" name="end-select" value="count" checked> After</label>
                        <div class="input-content">
                            <input type="number" name="count" value="1" min="1" style="width: 80px;"> occurrences
                        </div>
                    </div>
                    <div class="form-row">
                        <label><input type="radio" name="end-select" value="until"> Until</label>
                        <div class="input-content">
                            <input type="date" name="until" id="end-date" disabled>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="output-well">
            <strong>Generated RRULE:</strong>
            <input type="text" id="rrule-output" readonly>
        </div>
    </form>
    `;
}

function attachListeners() {
	const form = document.getElementById('rrule-gen');

	form.addEventListener('change', (e) => {
		const target = e.target;
		if (target.name === 'event-recurring') {
			document.getElementById('recurring-rules').style.display = target.value === 'yes' ? 'block' : 'none';
		}
		if (target.name === 'freq') {
			const val = target.value;
			document.querySelector('.freq-selection-label').textContent = val.toLowerCase() + '(s)';
			document.querySelector('.weeks-choice').style.display = val === 'WEEKLY' ? 'block' : 'none';
			document.querySelector('.months-choice').style.display = val === 'MONTHLY' ? 'block' : 'none';
			document.querySelector('.years-choice').style.display = val === 'YEARLY' ? 'block' : 'none';
		}
		if (target.name === 'month-options') {
			form.querySelectorAll('.month-precise-ctrl').forEach(el => el.disabled = target.value !== 'precise');
			if (target.value === 'precise') form.querySelectorAll('.monthday-btn').forEach(b => b.classList.remove('active'));
		}
		if (target.name === 'yearly-options') {
			form.querySelectorAll('.yearly-one-month-ctrl').forEach(el => el.disabled = target.value !== 'one-month');
			form.querySelectorAll('.yearly-month-btn').forEach(el => el.disabled = target.value !== 'multiple-months');
			form.querySelectorAll('.yearly-precise-ctrl').forEach(el => el.disabled = target.value !== 'precise');
		}
		if (target.name === 'end-select') {
			form.querySelector('input[name="count"]').disabled = target.value !== 'count';
			form.querySelector('input[name="until"]').disabled = target.value !== 'until';
		}
		syncData();
		updateOutput();
	});

	form.addEventListener('click', (e) => {
		if (e.target.classList.contains('btn-toggle')) {
			e.preventDefault();
			if (e.target.disabled) return;
			e.target.classList.toggle('active');
			syncData();
			updateOutput();
		}
	});

	document.getElementById('start-date').addEventListener('input', () => {
		recurringRule.dtstart = formatDate(document.getElementById('start-date').value) + 'T000000Z';
		updateOutput();
	});
}

function syncData() {
	const form = document.getElementById('rrule-gen');
	const isRecurring = form.querySelector('input[name="event-recurring"]:checked').value === 'yes';

	// 1. Always sync the Start Date
	const startDateVal = document.getElementById('start-date').value;
	recurringRule.dtstart = startDateVal ? formatDate(startDateVal) + 'T000000Z' : "";

	// 2. If not recurring, clear other fields and stop
	if (!isRecurring) {
		recurringRule.freq = "";
		recurringRule.interval = "";
		recurringRule.byday = "";
		recurringRule.bymonth = "";
		recurringRule.bymonthday = "";
		recurringRule.bysetpos = "";
		recurringRule.count = "";
		recurringRule.until = "";
		return;
	}

	// 3. Otherwise, proceed with existing logic
	const freq = form.querySelector('select[name="freq"]').value;
	recurringRule.freq = freq;
	recurringRule.interval = form.querySelector('input[name="interval"]').value;

	// Clear transient fields before re-assigning
	recurringRule.byday = "";
	recurringRule.bymonth = "";
	recurringRule.bymonthday = "";
	recurringRule.bysetpos = "";

	if (freq === 'WEEKLY') {
		recurringRule.byday = Array.from(form.querySelectorAll('.day-btn.active')).map(b => b.dataset.day).join(',');
	}

	if (freq === 'MONTHLY') {
		const mode = form.querySelector('input[name="month-options"]:checked').value;
		if (mode === 'bymonthday') {
			recurringRule.bymonthday = Array.from(form.querySelectorAll('.monthday-btn.active')).map(b => b.dataset.mday).join(',');
		} else {
			recurringRule.bysetpos = form.querySelector('select[name="month-setpos"]').value;
			recurringRule.byday = form.querySelector('select[name="month-byday"]').value;
		}
	}

	if (freq === 'YEARLY') {
		const mode = form.querySelector('input[name="yearly-options"]:checked').value;
		if (mode === 'one-month') {
			recurringRule.bymonth = form.querySelector('select[name="yearly-bymonth"]').value;
			recurringRule.bymonthday = form.querySelector('select[name="yearly-bymonthday"]').value;
		} else if (mode === 'multiple-months') {
			recurringRule.bymonth = Array.from(form.querySelectorAll('.yearly-month-btn.active')).map(b => b.dataset.month).join(',');
		} else {
			recurringRule.bysetpos = form.querySelector('select[name="yearly-setpos"]').value;
			recurringRule.byday = form.querySelector('select[name="yearly-byday"]').value;
			recurringRule.bymonth = form.querySelector('select[name="yearly-bymonth-precise"]').value;
		}
	}

	const endType = form.querySelector('input[name="end-select"]:checked').value;
	recurringRule.count = endType === 'count' ? form.querySelector('input[name="count"]').value : "";
	const uVal = form.querySelector('input[name="until"]').value;
	recurringRule.until = endType === 'until' && uVal ? formatDate(uVal) + 'T000000Z' : "";
}

function updateOutput() {
	let parts = [];
	// If freq is empty, it means "No Recurring" was selected
	if (!recurringRule.freq) {
		document.getElementById('rrule-output').value = recurringRule.dtstart ? `DTSTART:${recurringRule.dtstart}` : "";
		return;
	}

	const order = ['freq', 'dtstart', 'interval', 'byday', 'bymonth', 'bymonthday', 'bysetpos', 'count', 'until'];
	order.forEach(key => {
		if (recurringRule[key]) {
			const prefix = key === 'dtstart' ? 'DTSTART:' : ''; // Standard prefix for start date
			const separator = key === 'dtstart' ? ';' : '';
			parts.push(`${prefix}${key.toUpperCase()}=${recurringRule[key]}`);
		}
	});
	document.getElementById('rrule-output').value = parts.join(';');
}

init();