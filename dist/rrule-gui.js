(function(){try{if(typeof document<`u`){var e=document.createElement(`style`);e.appendChild(document.createTextNode(`:root{--bg:#fff;--surface:#fff;--border:#d1d5db;--border-hi:#9ca3af;--accent:#2563eb;--accent-dim:#eff6ff;--green:#16a34a;--amber:#d97706;--text:#1f2937;--muted:#6b7280;--sans:system-ui, -apple-system, sans-serif}*,:before,:after{box-sizing:border-box;margin:0;padding:0}body{background:var(--bg);color:var(--text);font-family:var(--sans);padding:20px;font-size:14px}#rrule-form-container{width:100%;max-width:100%;margin:0 auto;padding-top:10px;position:relative}.card{background:var(--surface);border:1px solid var(--border);border-radius:6px;width:100%;margin-bottom:16px}.card-header{border-bottom:1px solid var(--border);background:#f9fafb;align-items:center;gap:8px;padding:8px 16px;display:flex}.card-header .dot{background:var(--accent);border-radius:50%;width:6px;height:6px}.card-header span{text-transform:uppercase;color:var(--muted);letter-spacing:.02em;font-size:11px;font-weight:600}.card-header .badge{margin-left:auto}.card-header .badge a{color:inherit;text-decoration:none}.card-body{padding:16px}.form-row{align-items:center;gap:12px;margin-bottom:12px;display:flex}.form-row>label.row-label{color:var(--muted);min-width:100px;font-size:12px;font-weight:600}.form-row .row-controls{flex-wrap:wrap;flex:1;align-items:center;gap:8px;display:flex}input[type=date],input[type=time],input[type=number],select{border:1px solid var(--border);color:var(--text);background:#fff;border-radius:4px;outline:none;padding:6px 10px;font-size:13px}input[type=date]:focus,input[type=time]:focus,input[type=number]:focus,select:focus{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent-dim)}input[type=number]{width:65px}.select-wrap{display:inline-flex;position:relative}.select-wrap:after{content:"▾";color:var(--muted);pointer-events:none;position:absolute;top:50%;right:8px;transform:translateY(-50%)}select{appearance:none;padding-right:24px}.btn-grid{flex-wrap:wrap;gap:4px;margin-top:8px;display:flex}.btn-toggle{border:1px solid var(--border);color:var(--text);cursor:pointer;background:#fff;border-radius:4px;padding:4px 10px;font-size:12px;font-weight:500}.btn-toggle.active{background:var(--accent);border-color:var(--accent);color:#fff}.section-divider{border:none;border-top:1px solid var(--border);margin:16px 0}.sub-option{border-left:3px solid var(--border);background:#f9fafb;border-radius:0 4px 4px 0;margin-left:10px;padding:12px}.collapsible{display:none}.collapsible.visible{display:block}.validation-msg{color:var(--amber);margin-top:4px;font-size:11px}.validation-msg.ok{color:var(--green)}.output-card{border:1px solid var(--border);background:#f3f4f6;border-radius:6px}.output-header{border-bottom:1px solid var(--border);background:#e5e7eb;justify-content:space-between;padding:6px 12px;display:flex}.output-header .label{color:var(--muted);text-transform:uppercase;font-size:10px;font-weight:700}.copy-btn{text-transform:uppercase;border:1px solid var(--border);cursor:pointer;background:#fff;border-radius:3px;padding:2px 8px;font-size:10px;font-weight:600}.output-body{padding:12px}.output-line{color:#111;font-family:monospace;font-size:13px}.rrule-output-input{width:100%;font-family:var(--mono);color:var(--text);cursor:default;word-break:break-all;background:0 0;border:none;outline:none;padding:0;font-size:12px;line-height:1.7;display:block}`)),document.head.appendChild(e)}}catch(e){console.error(`vite-plugin-css-injected-by-js`,e)}})();(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[`MO`,`TU`,`WE`,`TH`,`FR`,`SA`,`SU`],t=[`January`,`February`,`March`,`April`,`May`,`June`,`July`,`August`,`September`,`October`,`November`,`December`],n=[`Jan`,`Feb`,`Mar`,`Apr`,`May`,`Jun`,`Jul`,`Aug`,`Sep`,`Oct`,`Nov`,`Dec`],r=`
  <option value="1">1st</option>
  <option value="2">2nd</option>
  <option value="3">3rd</option>
  <option value="4">4th</option>
  <option value="-1">Last</option>`,i=`
  <option value="MO">Monday</option>
  <option value="TU">Tuesday</option>
  <option value="WE">Wednesday</option>
  <option value="TH">Thursday</option>
  <option value="FR">Friday</option>
  <option value="SA">Saturday</option>
  <option value="SU">Sunday</option>
  <option value="MO,TU,WE,TH,FR">Weekday</option>
  <option value="SA,SU">Weekend day</option>
  <option value="MO,TU,WE,TH,FR,SA,SU">Day</option>`,a=t.map((e,t)=>`<option value="${t+1}">${e}</option>`).join(``),o=Array.from({length:31},(e,t)=>`<option value="${t+1}">${t+1}</option>`).join(``),s=0;function c(e){if(!e||!e.trim())return null;let t=e.trim().replace(/^RRULE:/i,``);if(!t)return null;let n={};for(let e of t.split(`;`)){let t=e.indexOf(`=`);if(t===-1)continue;let r=e.slice(0,t).trim().toUpperCase(),i=e.slice(t+1).trim();r&&i&&(n[r]=i)}return Object.keys(n).length?n:null}function l(e,t,n,r){let i=t(`input[name$="_event-recurring"][value="yes"]`);i.checked=!0,r(`rrule-card`).classList.add(`visible`);let a=(e.FREQ||`DAILY`).toUpperCase();if(r(`freq`).value=a,e.INTERVAL&&(r(`interval`).value=e.INTERVAL),e.COUNT)t(`input[name$="_end-mode"][value="count"]`).checked=!0,r(`count-val`).value=e.COUNT;else if(e.UNTIL){t(`input[name$="_end-mode"][value="until"]`).checked=!0;let n=e.UNTIL.replace(`Z`,``),i=n.slice(0,8),a=n.slice(9,13),o=`${i.slice(0,4)}-${i.slice(4,6)}-${i.slice(6,8)}`,s=`${a.slice(0,2)}:${a.slice(2,4)}`;r(`until-date`).value=o,r(`until-time`).value=s}else t(`input[name$="_end-mode"][value="forever"]`).checked=!0;if(a===`WEEKLY`&&e.BYDAY){let t=e.BYDAY.split(`,`);n(`.day-btn`).forEach(e=>{t.includes(e.dataset.day)&&e.classList.add(`active`)})}if(a===`MONTHLY`)if(e.BYMONTHDAY){t(`input[name$="_month-mode"][value="bymonthday"]`).checked=!0;let r=e.BYMONTHDAY.split(`,`);n(`.monthday-btn`).forEach(e=>{r.includes(e.dataset.mday)&&e.classList.add(`active`)})}else e.BYDAY&&e.BYSETPOS&&(t(`input[name$="_month-mode"][value="byday"]`).checked=!0,r(`month-setpos`).value=e.BYSETPOS,u(r(`month-byday`),e.BYDAY));if(a===`YEARLY`){let i=e.BYMONTH?e.BYMONTH.split(`,`):[];e.BYSETPOS&&e.BYDAY&&e.BYMONTH?(t(`input[name$="_yearly-mode"][value="precise"]`).checked=!0,r(`yearly-setpos`).value=e.BYSETPOS,u(r(`yearly-byday`),e.BYDAY),r(`yearly-precise-month`).value=e.BYMONTH):i.length>1?(t(`input[name$="_yearly-mode"][value="multi-month"]`).checked=!0,n(`.yearly-month-btn`).forEach(e=>{i.includes(e.dataset.month)&&e.classList.add(`active`)})):(t(`input[name$="_yearly-mode"][value="one-month"]`).checked=!0,e.BYMONTH&&(r(`yearly-month`).value=e.BYMONTH),e.BYMONTHDAY&&(r(`yearly-monthday`).value=e.BYMONTHDAY))}return a}function u(e,t){Array.from(e.options).find(e=>e.value===t)&&(e.value=t)}function d(e,t){let n=`rrg${++s}`,r=e=>`${n}-${e}`,i=(e.value||``).trim();t.readOnly=!0,t.classList.add(`rrule-output-input`),e.type=`hidden`;let a=document.createElement(`div`);a.className=`rrule-generator-widget`,a.dataset.uid=n,a.innerHTML=f(n,r),e.insertAdjacentElement(`afterend`,a);let o=a,u=e=>o.querySelector(e),d=e=>Array.from(o.querySelectorAll(e)),p=e=>o.querySelector(`#${r(e)}`);p(`output-body`).appendChild(t);let h=c(i);return h?(l(h,u,d,p),g(p),_(u,p),v(u,p),y(u,p)):(g(p),_(u,p),v(u,p),y(u,p)),b(o,u,d,p,e,t),m(o,u,d,p,e,t),{destroy(){a.insertAdjacentElement(`beforebegin`,e),e.readOnly=!1,e.classList.remove(`rrule-output-input`),e.value=``,a.remove()}}}function f(t,s){let c=e.map(e=>`<button type="button" class="btn-toggle day-btn" data-day="${e}">${e}</button>`).join(``),l=Array.from({length:31},(e,t)=>`<button type="button" class="btn-toggle monthday-btn" data-mday="${t+1}">${t+1}</button>`).join(``),u=n.map((e,t)=>`<button type="button" class="btn-toggle yearly-month-btn" data-month="${t+1}">${e}</button>`).join(``),d=e=>`${t}_${e}`;return`
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
                <input type="radio" name="${d(`event-recurring`)}" value="no" checked> No
              </label>
              <label class="radio-label">
                <input type="radio" name="${d(`event-recurring`)}" value="yes"> Yes
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Recurrence Rule card ── -->
    <div class="card collapsible" id="${s(`rrule-card`)}">
      <div class="card-header"><div class="dot"></div><span>Recurrence Rule</span></div>
      <div class="card-body">

        <!-- Frequency + Interval -->
        <div class="form-row">
          <label class="row-label">Frequency</label>
          <div class="row-controls">
            <span class="muted-text">Every</span>
            <input type="number" id="${s(`interval`)}" value="1" min="1" max="999">
            <div class="select-wrap">
              <select id="${s(`freq`)}">
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
        <div id="${s(`section-weekly`)}" class="collapsible">
          <div class="form-row">
            <label class="row-label">On Days</label>
            <div class="row-controls" style="flex-direction:column;align-items:flex-start;">
              <div class="btn-grid">${c}</div>
              <div class="validation-msg" id="${s(`weekly-note`)}">
                ⚠ No days selected — will repeat on the start date's weekday
              </div>
            </div>
          </div>
          <hr class="section-divider">
        </div>

        <!-- MONTHLY -->
        <div id="${s(`section-monthly`)}" class="collapsible">
          <div class="form-row">
            <label class="row-label">By</label>
            <div class="row-controls">
              <div class="radio-group">
                <label class="radio-label">
                  <input type="radio" name="${d(`month-mode`)}" value="bymonthday" checked> Day of month
                </label>
                <label class="radio-label">
                  <input type="radio" name="${d(`month-mode`)}" value="byday"> Day of week
                </label>
              </div>
            </div>
          </div>

          <div id="${s(`monthly-bymonthday`)}" class="sub-option">
            <div class="btn-grid" style="gap:4px;">${l}</div>
            <div class="validation-msg" id="${s(`monthday-note`)}">
              ⚠ No days selected — pick at least one
            </div>
          </div>

          <div id="${s(`monthly-byday`)}" class="sub-option" style="display:none;">
            <div class="form-row" style="margin-bottom:0;">
              <div class="row-controls">
                <span class="muted-text">The</span>
                <div class="select-wrap">
                  <select id="${s(`month-setpos`)}">${r}</select>
                </div>
                <div class="select-wrap">
                  <select id="${s(`month-byday`)}">${i}</select>
                </div>
                <span class="muted-text">of the month</span>
              </div>
            </div>
          </div>

          <hr class="section-divider">
        </div>

        <!-- YEARLY -->
        <div id="${s(`section-yearly`)}" class="collapsible">
          <div class="form-row">
            <label class="row-label">In Month</label>
            <div class="row-controls">
              <div class="radio-group">
                <label class="radio-label">
                  <input type="radio" name="${d(`yearly-mode`)}" value="one-month" checked> Single
                </label>
                <label class="radio-label">
                  <input type="radio" name="${d(`yearly-mode`)}" value="multi-month"> Multiple
                </label>
                <label class="radio-label">
                  <input type="radio" name="${d(`yearly-mode`)}" value="precise"> Precise
                </label>
              </div>
            </div>
          </div>

          <div id="${s(`yearly-one-month`)}" class="sub-option">
            <div class="row-controls">
              <span class="muted-text">On</span>
              <div class="select-wrap">
                <select id="${s(`yearly-month`)}">${a}</select>
              </div>
              <div class="select-wrap">
                <select id="${s(`yearly-monthday`)}">${o}</select>
              </div>
            </div>
            <div class="validation-msg" id="${s(`yearly-dayvalid`)}"></div>
          </div>

          <div id="${s(`yearly-multi-month`)}" class="sub-option" style="display:none;">
            <div class="btn-grid">${u}</div>
            <div class="validation-msg" id="${s(`multimonth-note`)}">
              ⚠ No months selected — pick at least one
            </div>
          </div>

          <div id="${s(`yearly-precise`)}" class="sub-option" style="display:none;">
            <div class="row-controls" style="flex-wrap:wrap;gap:8px;">
              <span class="muted-text">The</span>
              <div class="select-wrap">
                <select id="${s(`yearly-setpos`)}">${r}</select>
              </div>
              <div class="select-wrap">
                <select id="${s(`yearly-byday`)}">${i}</select>
              </div>
              <span class="muted-text">of</span>
              <div class="select-wrap">
                <select id="${s(`yearly-precise-month`)}">${a}</select>
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
                <input type="radio" name="${d(`end-mode`)}" value="forever" checked> Forever
              </label>
              <label class="radio-label">
                <input type="radio" name="${d(`end-mode`)}" value="count"> After
              </label>
              <label class="radio-label">
                <input type="radio" name="${d(`end-mode`)}" value="until"> On date
              </label>
            </div>
          </div>
        </div>

        <div id="${s(`end-count-row`)}" class="sub-option" style="display:none;">
          <div class="row-controls">
            <input type="number" id="${s(`count-val`)}" value="10" min="1" max="9999">
            <span class="muted-text">occurrences</span>
          </div>
        </div>

        <div id="${s(`end-until-row`)}" class="sub-option" style="display:none;">
          <div class="row-controls">
            <input type="date" id="${s(`until-date`)}">
            <input type="time" id="${s(`until-time`)}" value="00:00">
          </div>
          <div class="validation-msg" id="${s(`until-note`)}"></div>
        </div>

      </div>
    </div>
    <!-- ── Output panel ── -->
    <div class="output-card">
      <div class="output-header">
        <span class="label">RRULE</span>
      </div>
      <div class="output-body" id="${s(`output-body`)}">
        <!-- copy of the input (the original is hidden) -->
      </div>
    </div>

  </div>
  </form>`}function p(e,t,n){let r=e(`input[name$="_event-recurring"]:checked`).value===`yes`,i={rrule:``,warnings:[]};if(!r)return i;let a=n(`freq`).value,o=parseInt(n(`interval`).value,10)||1,s=e(`input[name$="_end-mode"]:checked`).value,c={};if(c.FREQ=a,o!==1&&(c.INTERVAL=o),a===`WEEKLY`){let e=t(`.day-btn.active`).map(e=>e.dataset.day);e.length&&(c.BYDAY=e.join(`,`))}if(a===`MONTHLY`)if(e(`input[name$="_month-mode"]:checked`).value===`bymonthday`){let e=t(`.monthday-btn.active`).map(e=>e.dataset.mday);e.length?c.BYMONTHDAY=e.join(`,`):i.warnings.push(`No days of month selected`)}else c.BYDAY=n(`month-byday`).value,c.BYSETPOS=n(`month-setpos`).value;if(a===`YEARLY`){let r=e(`input[name$="_yearly-mode"]:checked`).value;if(r===`one-month`){let e=n(`yearly-month`).value,t=n(`yearly-monthday`).value;c.BYMONTH=e,c.BYMONTHDAY=t;let r=new Date(2e3,parseInt(e,10),0).getDate();parseInt(t,10)>r&&i.warnings.push(`Day ${t} does not exist in that month — rule will yield no occurrences`)}else if(r===`multi-month`){let e=t(`.yearly-month-btn.active`).map(e=>e.dataset.month);e.length?c.BYMONTH=e.join(`,`):i.warnings.push(`No months selected`)}else c.BYMONTH=n(`yearly-precise-month`).value,c.BYDAY=n(`yearly-byday`).value,c.BYSETPOS=n(`yearly-setpos`).value}if(s===`count`){let e=parseInt(n(`count-val`).value,10);e>=1&&(c.COUNT=e)}else if(s===`until`){let e=n(`until-date`).value,t=n(`until-time`).value;if(e){let[n,r,i]=e.split(`-`),[a,o]=(t||`00:00`).split(`:`);c.UNTIL=`${n}${r}${i}T${a}${o}00Z`}}return i.rrule=`RRULE:`+[`FREQ`,`UNTIL`,`COUNT`,`INTERVAL`,`BYDAY`,`BYMONTHDAY`,`BYMONTH`,`BYSETPOS`].filter(e=>c[e]!==void 0).map(e=>`${e}=${c[e]}`).join(`;`),i}function m(e,t,n,r,i,a){let o=p(t,n,r);i.value=o.rrule,a.value=o.rrule,e.querySelectorAll(`.global-warning`).forEach(e=>e.remove());let s=r(`output-body`);o.warnings.forEach(e=>{let t=document.createElement(`div`);t.className=`validation-msg global-warning`,t.style.marginTop=`6px`,t.textContent=`⚠ `+e,s.appendChild(t)}),h(t,n,r)}function h(e,t,n){let r=n(`freq`).value,i=n(`weekly-note`);if(i){let e=t(`.day-btn.active`).length;i.className=`validation-msg`+(e?` ok`:``),i.textContent=e?`✓ ${e} day${e>1?`s`:``} selected`:`⚠ No days selected — will repeat on the start date's weekday`}if(r===`MONTHLY`){let r=n(`monthday-note`),i=e(`input[name$="_month-mode"]:checked`)?.value;if(r&&i===`bymonthday`){let e=t(`.monthday-btn.active`).length;r.className=`validation-msg`+(e?` ok`:``),r.textContent=e?`✓ ${e} day${e>1?`s`:``} selected`:`⚠ No days selected — pick at least one`}}if(r===`YEARLY`){let r=n(`yearly-dayvalid`),i=e(`input[name$="_yearly-mode"]:checked`)?.value;if(r&&i===`one-month`){let e=parseInt(n(`yearly-month`).value,10),t=parseInt(n(`yearly-monthday`).value,10),i=new Date(2e3,e,0).getDate();r.className=`validation-msg`+(t<=i?` ok`:``),r.textContent=t<=i?`✓ Valid date`:`⚠ Day ${t} doesn't exist in this month (max ${i}) — will yield no occurrences`}else r&&(r.textContent=``);let a=n(`multimonth-note`);if(a&&i===`multi-month`){let e=t(`.yearly-month-btn.active`).length;a.className=`validation-msg`+(e?` ok`:``),a.textContent=e?`✓ ${e} month${e>1?`s`:``} selected`:`⚠ No months selected — pick at least one`}}let a=e(`input[name$="_end-mode"]:checked`).value,o=n(`until-note`);if(o)if(a===`until`){let e=n(`until-date`).value;o.className=`validation-msg`+(e?` ok`:``),o.textContent=e?`✓ End date set`:`⚠ No end date selected`}else o.textContent=``}function g(e){[`section-weekly`,`section-monthly`,`section-yearly`].forEach(t=>{e(t)?.classList.remove(`visible`)});let t=e(`freq`).value;t===`WEEKLY`&&e(`section-weekly`)?.classList.add(`visible`),t===`MONTHLY`&&e(`section-monthly`)?.classList.add(`visible`),t===`YEARLY`&&e(`section-yearly`)?.classList.add(`visible`)}function _(e,t){let n=e(`input[name$="_month-mode"]:checked`)?.value;n&&(t(`monthly-bymonthday`).style.display=n===`bymonthday`?``:`none`,t(`monthly-byday`).style.display=n===`byday`?``:`none`)}function v(e,t){[`yearly-one-month`,`yearly-multi-month`,`yearly-precise`].forEach(e=>{t(e).style.display=`none`});let n=e(`input[name$="_yearly-mode"]:checked`)?.value;n===`one-month`&&(t(`yearly-one-month`).style.display=``),n===`multi-month`&&(t(`yearly-multi-month`).style.display=``),n===`precise`&&(t(`yearly-precise`).style.display=``)}function y(e,t){t(`end-count-row`).style.display=`none`,t(`end-until-row`).style.display=`none`;let n=e(`input[name$="_end-mode"]:checked`).value;n===`count`&&(t(`end-count-row`).style.display=``),n===`until`&&(t(`end-until-row`).style.display=``)}function b(e,t,n,r,i,a){let o=()=>m(e,t,n,r,i,a);n(`input[name$="_event-recurring"]`).forEach(e=>{e.addEventListener(`change`,()=>{r(`rrule-card`).classList.toggle(`visible`,e.value===`yes`&&e.checked),o()})}),r(`freq`).addEventListener(`change`,()=>{g(r),o()}),r(`interval`).addEventListener(`input`,o),e.addEventListener(`click`,e=>{e.target.classList.contains(`btn-toggle`)&&!e.target.disabled&&(e.preventDefault(),e.target.classList.toggle(`active`),o())}),n(`input[name$="_month-mode"]`).forEach(e=>e.addEventListener(`change`,()=>{_(t,r),o()})),n(`input[name$="_yearly-mode"]`).forEach(e=>e.addEventListener(`change`,()=>{v(t,r),o()})),n(`input[name$="_end-mode"]`).forEach(e=>e.addEventListener(`change`,()=>{y(t,r),o()})),[`until-date`,`until-time`,`count-val`,`month-setpos`,`month-byday`,`yearly-month`,`yearly-monthday`,`yearly-setpos`,`yearly-byday`,`yearly-precise-month`].forEach(e=>{let t=r(e);t&&(t.addEventListener(`change`,o),t.addEventListener(`input`,o))})}document.addEventListener(`DOMContentLoaded`,()=>{document.querySelectorAll(`input[data-rrule-generator-form]`).forEach(e=>{if(e.name===null||e.name===``){console.error(`rrule-generator-form abandoning. Input element has no name attribute:`,e);return}console.info(`rrule-generator-form initializing on input[name="`+e.name+`"]`),d(e,e.cloneNode(!0))})});