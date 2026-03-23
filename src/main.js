/**
 * RRULE GENERATOR - Dynamic Vanilla Version
 */

let recurringRule = {};

// Helper: Format Date objects to YYYYMMDD
const formatDate = (dateStr) => dateStr.replace(/-/g, '');

const INITIAL_STATE = () => {
	const today = new Date().toISOString().split('T')[0];
	return {
		freq: "DAILY",
		dtstart: formatDate(today) + 'T040000Z',
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

                <div id="weekday-select" class="weeks-choice" style="display:none;">
                    <label>Repeat on:</label>
                    <div class="btn-group btn-group-justified" role="group">
                        ${['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(d => `<div class="btn-group"><button type="button" class="btn btn-default day-btn" data-day="${d}">${d}</button></div>`).join('')}
                    </div>
                </div>

                <div id="monthday-select" class="months-choice" style="display:none;">
                    <label><input type="radio" name="month-type" value="bymonthday" checked> On Days:</label>
                    <div class="btn-group-wrap" style="margin-bottom:10px;">
                        ${Array.from({ length: 31 }, (_, i) => `<button type="button" class="btn btn-default btn-xs monthday-btn" data-mday="${i + 1}">${i + 1}</button>`).join('')}
                    </div>
                    <label><input type="radio" name="month-type" value="bysetpos"> Or precise:</label>
                    <div class="row">
                        <div class="col-xs-6">
                            <select name="month-setpos" class="form-control" disabled>
                                <option value="1">First</option><option value="2">Second</option><option value="-1">Last</option>
                            </select>
                        </div>
                        <div class="col-xs-6">
                            <select name="month-byday" class="form-control" disabled>
                                <option value="SU">Sunday</option><option value="MO">Monday</option><option value="SU,MO,TU,WE,TH,FR,SA">Day</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div id="until-rules" style="margin-top:20px;">
                    <label>End Condition:</label>
                    <div>
                        <label><input type="radio" name="end-select" value="count" checked> After</label>
                        <input type="number" name="count" value="1" style="width: 60px;"> occurrences
                    </div>
                    <div style="margin-top:10px;">
                        <label><input type="radio" name="end-select" value="until"> Until Date</label>
                        <input type="date" name="until" id="end-date" disabled>
                    </div>
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

	// Toggle Recurring Section
	form.addEventListener('change', (e) => {
		if (e.target.name === 'event-recurring') {
			document.getElementById('recurring-rules').style.display = e.target.value === 'yes' ? 'block' : 'none';
		}

		// Frequency change
		if (e.target.name === 'freq') {
			const freq = e.target.value;
			recurringRule.freq = freq;
			document.querySelector('.freq-selection-label').textContent = freq.toLowerCase() + '(s)';

			// Show/Hide specific sub-menus
			document.querySelector('.weeks-choice').style.display = freq === 'WEEKLY' ? 'block' : 'none';
			document.querySelector('.months-choice').style.display = freq === 'MONTHLY' ? 'block' : 'none';
		}

		// Handle End Type Toggling
		if (e.target.name === 'end-select') {
			form.querySelector('input[name="count"]').disabled = e.target.value !== 'count';
			form.querySelector('input[name="until"]').disabled = e.target.value !== 'until';
		}

		syncData();
		updateOutput();
	});

	// Handle Button Clicks (Weekly/Monthly Days)
	form.addEventListener('click', (e) => {
		if (e.target.classList.contains('day-btn') || e.target.classList.contains('monthday-btn')) {
			e.preventDefault();
			e.target.classList.toggle('active');
			e.target.classList.toggle('btn-primary');
			syncData();
			updateOutput();
		}
	});

	// Sync Start Date
	document.getElementById('start-date').addEventListener('input', (e) => {
		recurringRule.dtstart = formatDate(e.target.value) + 'T040000Z';
		updateOutput();
	});
}

function syncData() {
	const form = document.getElementById('rrule-gen');

	// Interval
	recurringRule.interval = form.querySelector('input[name="interval"]').value;

	// Weekly Days
	const activeDays = Array.from(form.querySelectorAll('.day-btn.active')).map(b => b.dataset.day);
	recurringRule.byday = activeDays.join(',');

	// Monthly Days
	const activeMDays = Array.from(form.querySelectorAll('.monthday-btn.active')).map(b => b.dataset.mday);
	recurringRule.bymonthday = activeMDays.join(',');

	// End condition
	const endType = form.querySelector('input[name="end-select"]:checked').value;
	if (endType === 'count') {
		recurringRule.count = form.querySelector('input[name="count"]').value;
		recurringRule.until = "";
	} else {
		recurringRule.count = "";
		recurringRule.until = formatDate(form.querySelector('input[name="until"]').value) + 'T000000Z';
	}
}

function updateOutput() {
	let parts = [];
	for (let key in recurringRule) {
		if (recurringRule[key]) {
			parts.push(`${key.toUpperCase()}=${recurringRule[key]}`);
		}
	}
	document.getElementById('rrule-output').value = parts.join(';');
}

// Run the app
init();