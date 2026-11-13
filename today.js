"use strict";const STALE_HOURS=24,UNDELIVERED_MINUTES=30,fmtToday=new Intl.DateTimeFormat("ru-RU",{weekday:"long",day:"numeric",month:"long"});function hoursSince(t,n){return t?(n-new Date(t).getTime())/36e5:1/0}function plural(t,n,r,o){const a=t%10,i=t%100;return a===1&&i!==11?n:a>=2&&a<=4&&(i<12||i>14)?r:o}function todayData(t,n,r=Date.now()){const o=t.filter(e=>!e.supersededBy),a=n.filter(e=>e.status!=="done"),i=a.filter(e=>e.status==="blocked"),s=n.filter(e=>e.unread&&e.status!=="blocked"),c=a.filter(e=>e.alert==="limits"),d=typeof Due<"u",m=d?a.filter(e=>["overdue","soon","tomorrow"].includes(Due.dueState(e.due,r))).sort((e,p)=>e.due.at.localeCompare(p.due.at)):[],b=new Set([...i,...s,...c,...m].map(e=>e.number)),v=sorted(o.filter(e=>!e.read)),h=v.filter(e=>PRIORITY_RANK[e.priority]>=2),w=v.filter(e=>!(PRIORITY_RANK[e.priority]>=2)),f=[];for(const e of a){if(b.has(e.number)||e.status==="blocked")continue;if(!e.delivered&&!e.guest&&e.source!=="telegram"&&hoursSince(e.createdAt,r)*60>30){f.push({task:e,reason:"\u041D\u0435 \u043F\u0435\u0440\u0435\u0434\u0430\u043D\u0430 \u0438\u0441\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044E"});continue}const p=e.lastAgentActivity||e.createdAt,u=hoursSince(p,r);if(u>24){const g=Math.floor(u/24),l=e.lastAgentActivity?"\u041D\u0435\u0442 \u043E\u0442\u0432\u0435\u0442\u0430":"\u0411\u0435\u0437 \u043E\u0442\u0432\u0435\u0442\u0430 \u0441 \u043F\u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0438",S=e.remindedAt&&!(e.lastAgentActivity&&e.lastAgentActivity>=e.remindedAt)?" \xB7 \u043D\u0430\u043F\u043E\u043C\u0438\u043D\u0430\u043D\u0438\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E":"";f.push({task:e,reason:`${l} ${g} ${plural(g,"\u0434\u0435\u043D\u044C","\u0434\u043D\u044F","\u0434\u043D\u0435\u0439")}${S}`})}}const y=startOfDay(new Date(r)).getTime(),k=[...new Set([...Object.keys(AGENTS),...o.map(e=>e.agent),...n.map(e=>e.agent).filter(Boolean)])].map(e=>{const p=o.filter(l=>l.agent===e&&l.date&&new Date(l.date).getTime()>=y).length,u=a.filter(l=>l.agent===e),g=[...o.filter(l=>l.agent===e).map(l=>l.date),...n.filter(l=>l.agent===e).map(l=>l.lastAgentActivity)].filter(Boolean);return{id:e,todayReports:p,open:u.length,inProgress:u.filter(l=>l.status==="in-progress").length,last:g.sort().pop()||null}}).filter(e=>AGENTS[e.id]||e.todayReports||e.open),A=new Set([...i,...s,...h].map(e=>e.number)),T=d?m.filter(e=>Due.dueState(e.due,r)==="overdue"&&!A.has(e.number)).length:0;return{waiting:i,answers:s,important:h,otherUnread:w,stale:f,alerts:c,dueSoon:m,team:k,attention:i.length+s.length+h.length+T}}const KIND={waiting:{label:"\u0416\u0434\u0451\u0442 \u0432\u0430\u0441",cls:"k-wait"},answer:{label:"\u041E\u0442\u0432\u0435\u0442",cls:"k-answer"},important:{label:"\u0412\u0430\u0436\u043D\u043E\u0435",cls:"k-important"},unread:{label:"\u0414\u043E\u043D\u0435\u0441\u0435\u043D\u0438\u0435",cls:"k-unread"},stale:{label:"\u0411\u0435\u0437 \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u044F",cls:"k-stale"}};function todayItems(t){const n=(o,a,i)=>{const s=a.previewAuthor==="owner"?"\u0412\u044B":a.previewAuthor==="guest"?guestLabel(a.previewGuestName):a.previewAuthor==="unverified"?"\u041D\u0435 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u043E":agentInfo(a.previewAuthor).name;return{kind:o,agent:a.agent,time:o==="stale"?a.lastAgentActivity||a.createdAt:taskTime(a),title:a.title,sub:`#${a.number}`,text:i||`${s}: ${plainPreview(a.preview)}`,attr:`data-open-task="${a.number}"`}},r=(o,a)=>({kind:o,agent:a.agent,time:a.date,title:a.title,sub:"",text:a.summary||"",attr:`data-open-report="${esc(a.id)}"`});return[...t.waiting.map(o=>n("waiting",o)),...t.answers.map(o=>n("answer",o)),...t.important.map(o=>r("important",o)),...t.otherUnread.map(o=>r("unread",o)),...t.stale.map(o=>n("stale",o.task,o.reason))]}function todayRow(t,{showKind:n=!0,showText:r=!0}={}){const o=agentInfo(t.agent);return`
    <button class="t-row ${KIND[t.kind].cls}" ${t.attr}>
      <span class="t-row-mark"></span>
      ${avatar(t.agent,"sm")}
      <span class="t-row-main">
        <span class="t-row-top">
          ${n?`<span class="t-kind">${KIND[t.kind].label}</span>`:""}
          <span class="t-author">${esc(o.name)}${t.sub?` \xB7 ${esc(t.sub)}`:""}</span>
          <span class="t-time">${esc(shortTime(t.time))}</span>
        </span>
        <span class="t-row-title">${esc(t.title)}</span>
        ${r&&t.text?`<span class="t-row-text">${esc(t.text)}</span>`:""}
      </span>
    </button>`}const timeOf=t=>t.time&&new Date(t.time).getTime()||0,BOARD_LIMIT=6;function todayBoard(t){const n=todayItems(t),r=a=>a.sort((i,s)=>timeOf(s)-timeOf(i));return`<div class="t-board">${[["\u0416\u0434\u0443\u0442 \u0432\u0430\u0441",r(n.filter(a=>a.kind==="waiting")),"blocked"],["\u041E\u0442\u0432\u0435\u0442\u044B",r(n.filter(a=>a.kind==="answer")),"tasks"],[L("\u0414\u043E\u043D\u0435\u0441\u0435\u043D\u0438\u044F"),[...r(n.filter(a=>a.kind==="important")),...r(n.filter(a=>a.kind==="unread"))],"unread"],["\u0411\u0435\u0437 \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u044F",r(n.filter(a=>a.kind==="stale")),"active"]].map(([a,i,s])=>`
    <section class="t-col${i.length?"":" is-empty"}">
      <h2>${esc(a)}<span class="t-count">${i.length}</span></h2>
      <div class="t-col-list">${i.length?i.slice(0,BOARD_LIMIT).map(c=>todayRow(c,{showKind:c.kind==="important",showText:c.kind==="stale"})).join(""):'<div class="t-col-empty">\u041F\u0443\u0441\u0442\u043E</div>'}</div>
      ${i.length>BOARD_LIMIT?`<button class="t-more" data-today-more="${s}">${s==="tasks"||s==="active"?"\u0412\u0441\u0435 \u0437\u0430\u0434\u0430\u0447\u0438 \u2192":`\u0415\u0449\u0451 ${i.length-BOARD_LIMIT}`}</button>`:""}
    </section>`).join("")}</div>`}function alertLine(t){const n=String(t.body||"").replace(/<!--[\s\S]*?-->/g,"").split(`
`).map(r=>r.trim()).find(Boolean)||"";return n.length>160?`${n.slice(0,157)}\u2026`:n}function renderToday(){if(!state.reports.length&&!state.tasks.length)return renderReader();const t=todayData(state.reports,state.tasks),n=fmtToday.format(new Date),r=[["\u0416\u0434\u0443\u0442 \u0432\u0430\u0441",t.waiting.length,"warn"],["\u041D\u043E\u0432\u044B\u0435 \u043E\u0442\u0432\u0435\u0442\u044B",t.answers.length,""],[L("\u041D\u0435\u043F\u0440\u043E\u0447\u0438\u0442\u0430\u043D\u043D\u044B\u0435"),t.important.length+t.otherUnread.length,""],["\u0411\u0435\u0437 \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u044F",t.stale.length,t.stale.length?"warn":""]],o=t.attention?`\u0422\u0440\u0435\u0431\u0443\u044E\u0442 \u0432\u0430\u0448\u0435\u0433\u043E \u0432\u043D\u0438\u043C\u0430\u043D\u0438\u044F: ${t.attention}.`:"\u0421\u0440\u043E\u0447\u043D\u043E\u0433\u043E \u043D\u0435\u0442: \u043E\u0442\u0432\u0435\u0442\u043E\u0432 \u043D\u0438\u043A\u0442\u043E \u043D\u0435 \u0436\u0434\u0451\u0442, \u0432\u0430\u0436\u043D\u043E\u0435 \u043F\u0440\u043E\u0447\u0438\u0442\u0430\u043D\u043E.",a=t.team.map(s=>{const c=agentInfo(s.id),d=[];return s.todayReports&&d.push(`${s.todayReports} ${plural(s.todayReports,"\u0434\u043E\u043D\u0435\u0441\u0435\u043D\u0438\u0435","\u0434\u043E\u043D\u0435\u0441\u0435\u043D\u0438\u044F","\u0434\u043E\u043D\u0435\u0441\u0435\u043D\u0438\u0439")} \u0441\u0435\u0433\u043E\u0434\u043D\u044F`),s.open&&d.push(`\u043E\u0442\u043A\u0440\u044B\u0442\u044B\u0445: ${s.open}`),`
        <button class="t-agent" data-today-agent="${esc(s.id)}">
          ${avatar(s.id)}
          <span class="t-agent-name">${esc(c.name)}<span class="t-agent-role">${esc(c.role)}</span></span>
          <span class="t-agent-stat">${d.length?esc(d.join(" \xB7 ")):'<span class="muted">\u0442\u0438\u0445\u043E</span>'}</span>
          <span class="t-agent-last">${s.last?esc(shortTime(s.last)):""}</span>
        </button>`}).join(""),i=todayBoard(t);$("#reader").innerHTML=`
    <div class="reader-inner today board">
      <header class="t-head">
        <div class="t-tools">
          <button class="icon-btn t-menu" data-today-menu title="\u041C\u0435\u043D\u044E"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
          <button class="icon-btn" data-voice-mode title="\u0413\u043E\u043B\u043E\u0441\u043E\u0432\u043E\u0439 \u0440\u0435\u0436\u0438\u043C: \u0441\u043B\u0443\u0448\u0430\u0442\u044C \u043D\u043E\u0432\u043E\u0435 \u043F\u043E\u0434\u0440\u044F\u0434"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="5" height="7" rx="2"/><rect x="16" y="14" width="5" height="7" rx="2"/></svg></button>
          <button class="icon-btn ${state.status.state==="syncing"?"spin":""}" data-today-refresh title="\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u043D\u043E\u0432\u043E\u0435"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.64-6.36M21 4v5h-5"/></svg></button>
        </div>
        <div class="t-date">${esc(n.charAt(0).toUpperCase()+n.slice(1))}</div>
        <h1 class="title">${L("\u0421\u0435\u0433\u043E\u0434\u043D\u044F")}</h1>
        <p class="t-lead">${esc(o)}</p>
        <div class="t-chips">${r.map(([s,c,d])=>`<span class="t-chip ${c&&d?d:""} ${c?"":"zero"}"><b>${c}</b>${esc(s)}</span>`).join("")}</div>
      </header>
      ${t.alerts.map(s=>`
        <button class="t-alert" data-open-task="${s.number}">
          <span class="t-alert-title">\u041B\u0438\u043C\u0438\u0442\u044B GitHub Actions</span>
          <span class="t-alert-text">${esc(alertLine(s))} \u0417\u0430\u0434\u0430\u0447\u0430 \u041D\u0435\u043A\u0441\u0443\u0441\u0443 #${s.number}.</span>
        </button>`).join("")}
      ${typeof outboxBlock=="function"?outboxBlock():""}
      ${t.dueSoon.length?`<section class="t-due">
        <h2>\u0421\u0440\u043E\u043A\u0438<span class="t-count">${t.dueSoon.length}</span></h2>
        ${t.dueSoon.map(s=>`
        <button class="t-due-row d-${Due.dueState(s.due)}" data-open-task="${s.number}">
          ${avatar(s.agent,"sm")}
          <span class="t-due-when">${esc(Due.dueLabel(s.due))}</span>
          <span class="t-due-title">${esc(s.title)}</span>
          <span class="t-due-who">${esc(agentInfo(s.agent).name)} \xB7 #${s.number}</span>
        </button>`).join("")}
      </section>`:""}
      ${i||'<div class="t-empty"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg><div>\u0412\u0441\u0451 \u043F\u0440\u043E\u0447\u0438\u0442\u0430\u043D\u043E, \u043D\u043E\u0432\u044B\u0445 \u0434\u0435\u043B \u043D\u0435\u0442.</div></div>'}
      <section class="t-section">
        <h2>\u041A\u043E\u043C\u0430\u043D\u0434\u0430</h2>
        <div class="t-team">${a}</div>
      </section>
    </div>`}function renderTodaySidebar(){$("#nav-views").innerHTML="";const t=[...new Set([...Object.keys(AGENTS),...state.reports.map(n=>n.agent)])];$("#nav-agents").innerHTML=t.map(n=>{const r=agentInfo(n),o=state.reports.filter(a=>a.agent===n&&!a.read).length+state.tasks.filter(a=>a.agent===n&&a.unread).length;return`
      <button class="nav-item" data-today-agent="${esc(n)}">
        ${avatar(n)}
        <span class="label"><span class="name">${esc(r.name)}</span><span class="role">${esc(r.role)}</span></span>
        ${o?`<span class="badge">${o}</span>`:""}
      </button>`}).join("")}document.addEventListener("click",t=>{if(state.mode!=="today")return;if(t.target.closest("[data-today-refresh]"))return t.stopPropagation(),window.api.refresh();const n=s=>{state.mode=s,state.query="",$("#search").value=""},r=t.target.closest("[data-open-task]"),o=t.target.closest("[data-open-report]"),a=t.target.closest("[data-today-more]"),i=t.target.closest("[data-today-agent]");if(!(!r&&!o&&!a&&!i))if(t.stopPropagation(),r)n("tasks"),state.taskView="all",renderAll(),selectTask(Number(r.dataset.openTask));else if(o)n("reports"),state.view="all",renderAll(),select(o.dataset.openReport);else if(a){const s=a.dataset.todayMore;s==="tasks"||s==="blocked"||s==="active"?(n("tasks"),state.taskView=s==="tasks"?"all":s):(n("reports"),state.view=s),renderAll()}else n("reports"),state.view=`agent:${i.dataset.todayAgent}`,renderAll()},!0);
