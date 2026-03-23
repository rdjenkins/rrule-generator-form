/**
 * RRULE GENERATOR - Full Vanilla Version with Yearly Precision
 */

let recurringRule = {};

// Helper: Format Date objects to YYYYMMDD
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

	container.innerHTML = `
    <form id="rrule-gen" class="form-horizontal">
        <div class="well">
            <div class="form-group">
                <label class="col-sm-3 control-label">Start Date</label>
                <div class="col-sm-9">
                    <input type="date" id="start-date" class="form-control" value="${today}">
                </div>
            </div>

            <div class="form-group">
                <label class="col-sm-3 control-label">Recurring?</label>
                <div class="col-sm-9">
                    <label class="radio-inline"><input type="radio" name="event-recurring" value="no" checked> No</label>
                    <label class="radio-inline"><input type="radio" name="event-recurring" value="yes"> Yes</label>
                </div>
            </div>

            <div id="recurring-rules" style="display:none;">
                <hr>
                <div class="form-group">
                    <label class="col-sm-3 control-label">Frequency</label>
                    <div class="col-sm-4">
                        <select name="freq" class="form-control">
                            <option value="DAILY">Daily</option>
                            <option value="WEEKLY">Weekly</option>
                            <option value="MONTHLY">Monthly</option>
                            <option value="YEARLY">Yearly</option>
                        </select>
                    </div>
                    <div class="col-sm-5">
                        <div class="input-group">
                            <span class="input-group-addon">Every</span>
                            <input type="number" name="interval" class="form-control" value="1" min="1">
                            <span class="input-group-addon freq-selection-label">days</span>
                        </div>
                    </div>
                </div>

                <div id="weekday-select" class="weeks-choice" style="display:none; margin-bottom: 15px;">
                    <label>Repeat on:</label>
                    <div class="btn-group btn-group-justified" role="group">
                        ${['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(d => `<div class="btn-group"><button type="button" class="btn btn-default day-btn" data-day="${d}">${d}</button></div>`).join('')}
                    </div>
                </div>

                <div id="monthday-select" class="months-choice" style="display:none; margin-bottom: 15px;">
                    <div class="radio"><label><input type="radio" name="month-options" value="bymonthday" checked> On Days:</label></div>
                    <div class="btn-group-wrap m-b-10">
                        ${Array.from({ length: 31 }, (_, i) => `<button type="button" class="btn btn-default btn-xs monthday-btn" data-mday="${i + 1}">${i + 1}</button>`).join('')}
                    </div>
                    <div class="radio"><label><input type="radio" name="month-options" value="precise"> Or precise:</label></div>
                    <div class="row">
                        <div class="col-xs-6">
                            <select name="month-setpos" class="form-control month-precise-ctrl" disabled>
                                <option value="1">First</option><option value="2">Second</option><option value="3">Third</option><option value="4">Fourth</option><option value="-1">Last</option>
                            </select>
                        </div>
                        <div class="col-xs-6">
                            <select name="month-byday" class="form-control month-precise-ctrl" disabled>
                                <option value="SU">Sunday</option><option value="MO">Monday</option><option value="TU">Tuesday</option><option value="WE">Wednesday</option><option value="TH">Thursday</option><option value="FR">Friday</option><option value="SA">Saturday</option>
                                <option value="SU,MO,TU,WE,TH,FR,SA" selected>Day</option>
                                <option value="MO,TU,WE,TH,FR">Weekday</option>
                                <option value="SU,SA">Weekend day</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div id="yearly-select" class="years-choice" style="display:none; margin-bottom: 15px;">
                    <div class="radio"><label><input type="radio" name="yearly-options" value="one-month" checked> Single Month</label></div>
                    <div class="row">
                        <div class="col-xs-6">
                            <select name="yearly-bymonth" class="form-control yearly-one-month-ctrl">
                                ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => `<option value="${i + 1}">${m}</option>`).join('')}
                            </select>
                        </div>
                        <div class="col-xs-6">
                            <select name="yearly-bymonthday" class="form-control yearly-one-month-ctrl">
                                ${Array.from({ length: 31 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <div class="radio"><label><input type="radio" name="yearly-options" value="multiple-months"> Multiple Months</label></div>
                    <div class="btn-group-wrap m-b-10">
                        ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => `<button type="button" class="btn btn-default btn-xs yearly-month-btn" data-month="${i + 1}" disabled>${m}</button>`).join('')}
                    </div>

                    <div class="radio"><label><input type="radio" name="yearly-options" value="precise"> Precise Yearly</label></div>
                    <div class="row">
                        <div class="col-xs-4">
                            <select name="yearly-setpos" class="form-control yearly-precise-ctrl" disabled>
                                <option value="1">First</option><option value="2">Second</option><option value="3">Third</option><option value="4">Fourth</option><option value="-1">Last</option>
                            </select>
                        </div>
                        <div class="col-xs-4">
                            <select name="yearly-byday" class="form-control yearly-precise-ctrl" disabled>
                                <option value="SU">Sunday</option><option value="MO">Monday</option><option value="TU">Tuesday</option><option value="WE">Wednesday</option><option value="TH">Thursday</option><option value="FR">Friday</option><option value="SA">Saturday</option>
                                <option value="SU,MO,TU,WE,TH,FR,SA" selected>Day</option>
                            </select>
                        </div>
                        <div class="col-xs-4">
                            <select name="yearly-bymonth-precise" class="form-control yearly-precise-ctrl" disabled>
                                ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => `<option value="${i + 1}">${m}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                </div>

                <div id="until-rules" style="margin-top:20px;">
                    <label>End Condition:</label>
                    <div class="radio"><label><input type="radio" name="end-select" value="count" checked> After <input type="number" name="count" value="1" min="1" style="width: 60px;"> occurrences</label></div>
                    <div class="radio"><label><input type="radio" name="end-select" value="until"> Until Date <input type="date" name="until" id="end-date" disabled></label></div>
                </div>
            </div>
        </div>

        <div class="alert alert-info">
            <strong>Generated RRULE:</strong>
            <input type="text" id="rrule-output" class="form-control" readonly style="background: #fff; cursor: text; margin-top: 10px;">
        </div>
    </form>
    `;
}

function attachListeners() {
	const form = document.getElementById('rrule-gen');

	form.addEventListener('change', (e) => {
		const target = e.target;

		// Visibility Toggles
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

		// Sub-option Control (Enabling/Disabling specific selects)
		if (target.name === 'month-options') {
			form.querySelectorAll('.month-precise-ctrl').forEach(el => el.disabled = target.value !== 'precise');
			form.querySelectorAll('.monthday-btn').forEach(el => target.value === 'precise' ? el.classList.remove('active', 'btn-primary') : null);
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

	// Button Toggles
	form.addEventListener('click', (e) => {
		if (e.target.tagName === 'BUTTON') {
			e.preventDefault();
			if (e.target.disabled) return;
			e.target.classList.toggle('active');
			e.target.classList.toggle('btn-primary');
			syncData();
			updateOutput();
		}
	});

	// Start Date
	document.getElementById('start-date').addEventListener('input', () => {
		recurringRule.dtstart = formatDate(document.getElementById('start-date').value) + 'T000000Z';
		updateOutput();
	});
}

function syncData() {
	const form = document.getElementById('rrule-gen');
	const freq = form.querySelector('select[name="freq"]').value;

	// Core Reset
	recurringRule.freq = freq;
	recurringRule.interval = form.querySelector('input[name="interval"]').value;
	recurringRule.byday = "";
	recurringRule.bymonth = "";
	recurringRule.bymonthday = "";
	recurringRule.bysetpos = "";

	// Weekly
	if (freq === 'WEEKLY') {
		recurringRule.byday = Array.from(form.querySelectorAll('.day-btn.active')).map(b => b.dataset.day).join(',');
	}

	// Monthly
	if (freq === 'MONTHLY') {
		const mode = form.querySelector('input[name="month-options"]:checked').value;
		if (mode === 'bymonthday') {
			recurringRule.bymonthday = Array.from(form.querySelectorAll('.monthday-btn.active')).map(b => b.dataset.mday).join(',');
		} else {
			recurringRule.bysetpos = form.querySelector('select[name="month-setpos"]').value;
			recurringRule.byday = form.querySelector('select[name="month-byday"]').value;
		}
	}

	// Yearly
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

	// End condition
	const endType = form.querySelector('input[name="end-select"]:checked').value;
	if (endType === 'count') {
		recurringRule.count = form.querySelector('input[name="count"]').value;
		recurringRule.until = "";
	} else {
		recurringRule.count = "";
		const uVal = form.querySelector('input[name="until"]').value;
		recurringRule.until = uVal ? formatDate(uVal) + 'T000000Z' : "";
	}
}

function updateOutput() {
	let parts = [];
	const order = ['freq', 'dtstart', 'interval', 'byday', 'bymonth', 'bymonthday', 'bysetpos', 'count', 'until'];

	order.forEach(key => {
		if (recurringRule[key]) {
			parts.push(`${key.toUpperCase()}=${recurringRule[key]}`);
		}
	});

	document.getElementById('rrule-output').value = parts.join(';');
}

init();