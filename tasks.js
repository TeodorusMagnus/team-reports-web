"use strict";const TASK_STATUS={new:"\u041D\u043E\u0432\u0430\u044F","in-progress":"\u0412 \u0440\u0430\u0431\u043E\u0442\u0435",blocked:"\u0416\u0434\u0451\u0442 \u0432\u0430\u0441",done:"\u0412\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u0430"},TASK_PRIORITY={low:"\u041D\u0438\u0437\u043A\u0430\u044F",normal:"\u041E\u0431\u044B\u0447\u043D\u0430\u044F",high:"\u0412\u044B\u0441\u043E\u043A\u0430\u044F",critical:"\u0421\u0440\u043E\u0447\u043D\u043E"},ASSIGNABLE=window.__TEAM&&window.__TEAM.assignable||Object.keys(window.__TEAM&&window.__TEAM.agents||{});function plainPreview(t){return String(t||"").replace(/```[\s\S]*?```/g," ").replace(/^\s*\|?\s*:?-{2,}.*$/gm," ").replace(/!\[[^\]]*\]\([^)]*\)/g," ").replace(/\[([^\]]+)\]\([^)]*\)/g,"$1").replace(/[*_`>#|]+/g," ").replace(/\s+/g," ").trim().slice(0,160)}function taskTime(t){const e=t.comments.length?t.comments[t.comments.length-1].createdAt:null;return[t.updatedAt,e,t.createdAt].filter(Boolean).sort().pop()}function visibleTasks(){let t=state.tasks;const e=state.taskView;e==="active"?t=t.filter(a=>a.status!=="done"):e==="blocked"?t=t.filter(a=>a.status==="blocked"):e==="done"?t=t.filter(a=>a.status==="done"):e.startsWith("agent:")&&(t=t.filter(a=>a.agent===e.slice(6)));const s=state.query.trim().toLowerCase();return s&&(t=t.filter(a=>[a.title,a.body,`#${a.number}`,agentInfo(a.agent).name,...a.comments.map(n=>n.body)].join(`
`).toLowerCase().includes(s))),[...t].sort((a,n)=>taskTime(n).localeCompare(taskTime(a)))}function taskViewTitle(){const t=state.taskView;return t==="active"?"\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0435 \u0437\u0430\u0434\u0430\u0447\u0438":t==="blocked"?"\u0416\u0434\u0443\u0442 \u0432\u0430\u0448\u0435\u0433\u043E \u043E\u0442\u0432\u0435\u0442\u0430":t==="done"?"\u0412\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u043D\u044B\u0435":t.startsWith("agent:")?`\u0417\u0430\u0434\u0430\u0447\u0438: ${agentInfo(t.slice(6)).name}`:"\u0412\u0441\u0435 \u0437\u0430\u0434\u0430\u0447\u0438"}function statusChip(t){return`<span class="status-chip s-${t.status}">${TASK_STATUS[t.status]}</span>`}function priorityChip(t,e=!1){return!t.priority||t.priority==="normal"&&!e?"":`<span class="prio ${t.priority}">${TASK_PRIORITY[t.priority]||t.priority}</span>`}function renderModes(){const t=state.reports.filter(a=>!a.read).length,e=state.tasks.filter(a=>a.unread).length,s=(a,n,i)=>`
    <button class="mode ${state.mode===a?"active":""}" data-switch="${a}">
      ${n}${i?`<span class="badge">${i}</span>`:""}
    </button>`;$("#modes").innerHTML=s("reports","\u041E\u0442\u0447\u0451\u0442\u044B",t)+s("tasks","\u0417\u0430\u0434\u0430\u0447\u0438",e)}function renderTaskSidebar(){const t=state.tasks.filter(n=>n.status!=="done"),e=state.tasks.filter(n=>n.status==="blocked"),s=state.tasks.filter(n=>n.status==="done"),a=[["active","\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0435",'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',t.length,!1],["blocked","\u0416\u0434\u0443\u0442 \u043E\u0442\u0432\u0435\u0442\u0430",'<svg viewBox="0 0 24 24"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/><path d="M12 8v4M12 15.5v.01"/></svg>',e.length,!0],["done","\u0412\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u043D\u044B\u0435",'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>',s.length,!1],["all","\u0412\u0441\u0435 \u0437\u0430\u0434\u0430\u0447\u0438",'<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h10"/></svg>',state.tasks.length,!1]];$("#nav-views").innerHTML=a.map(([n,i,r,c,o])=>`
      <button class="nav-item ${state.taskView===n?"active":""}" data-tview="${n}">
        ${r}<span class="label"><span class="name">${i}</span></span>
        ${c?o?`<span class="badge warn">${c}</span>`:`<span class="count">${c}</span>`:""}
      </button>`).join(""),$("#nav-agents").innerHTML=ASSIGNABLE.map(n=>{const i=agentInfo(n),r=state.tasks.filter(o=>o.agent===n&&o.status!=="done").length,c=state.tasks.filter(o=>o.agent===n&&o.unread).length;return`
      <button class="nav-item ${state.taskView==="agent:"+n?"active":""}" data-tview="agent:${n}">
        ${avatar(n)}
        <span class="label"><span class="name">${esc(i.name)}</span><span class="role">${r?`\u0432 \u0440\u0430\u0431\u043E\u0442\u0435: ${r}`:"\u0441\u0432\u043E\u0431\u043E\u0434\u0435\u043D"}</span></span>
        ${c?`<span class="badge">${c}</span>`:""}
      </button>`}).join("")}function renderTaskList(){$("#list-title").textContent=taskViewTitle();const t=visibleTasks(),e=$("#list");if(!t.length){const s=!!state.query.trim();e.innerHTML=`
      <div class="empty">
        <svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="m8 12 3 3 5-6"/></svg>
        <h3>${s?"\u041D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E":"\u0417\u0430\u0434\u0430\u0447 \u043D\u0435\u0442"}</h3>
        <div>${s?"\u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u0437\u0430\u043F\u0440\u043E\u0441.":"\u041D\u0430\u0436\u043C\u0438\u0442\u0435 \xAB\u041D\u043E\u0432\u0430\u044F \u0437\u0430\u0434\u0430\u0447\u0430\xBB, \u0447\u0442\u043E\u0431\u044B \u043F\u043E\u0440\u0443\u0447\u0438\u0442\u044C \u0447\u0442\u043E-\u043D\u0438\u0431\u0443\u0434\u044C \u043A\u043E\u043C\u0430\u043D\u0434\u0435."}</div>
      </div>`;return}e.innerHTML=t.map(s=>{const a=agentInfo(s.agent),n=s.previewAuthor==="owner"?"\u0412\u044B":agentInfo(s.previewAuthor).name;return`
      <div class="item task-item ${s.unread?"unread":""} ${state.selectedTask===s.number?"active":""}" data-task="${s.number}">
        ${avatar(s.agent,"sm")}
        <div>
          <div class="item-top">
            <span class="item-author">${esc(a.name)} \xB7 #${s.number}</span>
            ${priorityChip(s)}${statusChip(s)}
          </div>
          <div class="item-title">${esc(s.title)}</div>
          <div class="item-summary"><b>${esc(n)}:</b> ${esc(plainPreview(s.preview)||"\u0431\u0435\u0437 \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u044F")}</div>
          <div class="item-time-row">${esc(shortTime(taskTime(s)))}${s.comments.length?` \xB7 \u043E\u0442\u0432\u0435\u0442\u043E\u0432: ${s.comments.length}`:""}</div>
        </div>
      </div>`}).join("")}function renderTaskReader(){const t=$("#reader"),e=state.tasks.find(r=>r.number===state.selectedTask);if(!e){t.innerHTML=`<div class="empty" style="margin-top:18vh">
        <svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="m8 12 3 3 5-6"/></svg>
        <h3>\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0437\u0430\u0434\u0430\u0447\u0443</h3>
        <div>\u0418\u043B\u0438 \u043F\u043E\u0441\u0442\u0430\u0432\u044C\u0442\u0435 \u043D\u043E\u0432\u0443\u044E \u2014 \u0438\u0441\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C \u043F\u043E\u043B\u0443\u0447\u0438\u0442 \u0435\u0451 \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u0438 \u0441\u0430\u043C \u043E\u0446\u0435\u043D\u0438\u0442 \u0441\u0440\u043E\u0447\u043D\u043E\u0441\u0442\u044C.</div>
        <p><button class="btn-primary" data-action="new-task">\u041D\u043E\u0432\u0430\u044F \u0437\u0430\u0434\u0430\u0447\u0430</button></p>
      </div>`;return}const s=agentInfo(e.agent),a=e.status!=="new"?"":e.delivered?'<span class="hint-chip ok">\u0414\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u043E \u0438\u0441\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044E</span>':'<span class="hint-chip">\u041E\u0436\u0438\u0434\u0430\u0435\u0442 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0438</span>',n=e.priority?`\u0421\u0440\u043E\u0447\u043D\u043E\u0441\u0442\u044C: ${TASK_PRIORITY[e.priority]||e.priority}`:"\u0421\u0440\u043E\u0447\u043D\u043E\u0441\u0442\u044C \u043E\u0446\u0435\u043D\u0438\u0432\u0430\u0435\u0442 \u0438\u0441\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C",i=e.comments.map(r=>{const c=r.author==="owner",o=c?{name:"\u0412\u044B",color:"#7c9cff"}:agentInfo(r.author);return`
      <div class="msg ${c?"mine":""}">
        <span class="avatar sm" style="background:${o.color}">${esc(o.name.charAt(0))}</span>
        <div class="msg-body">
          <div class="msg-head"><b>${esc(o.name)}</b><span>${esc(fmtFull.format(new Date(r.createdAt)))}</span></div>
          <div class="md">${renderMarkdown(r.body)}</div>
        </div>
      </div>`}).join("");t.innerHTML=`
    <article class="reader-inner task">
      <div class="reader-head">
        ${avatar(e.agent,"lg")}
        <div class="reader-who">
          <div class="name">${esc(s.name)} <span class="count">\xB7 ${esc(s.role)}</span></div>
          <div class="meta">\u041F\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u0430 ${esc(fmtFull.format(new Date(e.createdAt)))}${e.closedAt?` \xB7 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u0430 ${esc(fmtFull.format(new Date(e.closedAt)))}`:""}</div>
        </div>
        <div class="reader-actions">
          ${e.status==="done"?'<button class="btn-secondary" data-action="task-reopen">\u0412\u0435\u0440\u043D\u0443\u0442\u044C \u0432 \u0440\u0430\u0431\u043E\u0442\u0443</button>':'<button class="btn-secondary" data-action="task-close">\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u0437\u0430\u0434\u0430\u0447\u0443</button>'}
          ${e.url?'<button class="btn-secondary" data-action="task-github" title="\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043D\u0430 GitHub">GitHub \u2197</button>':""}
        </div>
      </div>
      <h1 class="title">${esc(e.title)} <span class="num">#${e.number}</span></h1>
      <div class="tags">${statusChip(e)}${priorityChip(e,!0)}${e.priority?"":`<span class="hint-chip">${esc(n)}</span>`}${a}</div>
      <div class="divider"></div>
      ${e.body?`<div class="task-brief"><div class="brief-label">\u0417\u0430\u0434\u0430\u043D\u0438\u0435</div><div class="md">${renderMarkdown(e.body)}</div></div>`:""}
      <div class="timeline">${i||'<div class="hint">\u0418\u0441\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C \u0435\u0449\u0451 \u043D\u0435 \u043E\u0442\u0432\u0435\u0442\u0438\u043B.</div>'}</div>
      <form class="composer" id="composer">
        <textarea name="body" rows="3" placeholder="${e.status==="done"?"\u0417\u0430\u0434\u0430\u0447\u0430 \u0437\u0430\u043A\u0440\u044B\u0442\u0430. \u0412\u0435\u0440\u043D\u0438\u0442\u0435 \u0435\u0451 \u0432 \u0440\u0430\u0431\u043E\u0442\u0443, \u0447\u0442\u043E\u0431\u044B \u0438\u0441\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C \u043F\u043E\u043B\u0443\u0447\u0438\u043B \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435.":`\u041D\u0430\u043F\u0438\u0441\u0430\u0442\u044C ${esc(s.name)}\u2026 (Ctrl+Enter \u2014 \u043E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C)`}"></textarea>
        <div class="composer-row">
          <span class="form-error" id="composer-error"></span>
          <button class="btn-primary" type="submit">\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C</button>
        </div>
      </form>
    </article>`}function selectTask(t){state.selectedTask=t;const e=state.tasks.find(s=>s.number===t);e&&e.unread&&(e.unread=!1,window.api.markTaskSeen(t)),renderModes(),renderTaskSidebar(),renderTaskList(),renderTaskReader(),hydrateImages($("#reader")),document.querySelector(`.item[data-task="${t}"]`)?.scrollIntoView({block:"nearest"})}function moveTask(t){const e=visibleTasks();if(!e.length)return;const s=e.findIndex(a=>a.number===state.selectedTask);selectTask(e[Math.min(e.length-1,Math.max(0,s<0?0:s+t))].number)}function openNewTask(t){const e=$("#task-form");e.reset(),$("#task-error").textContent="";const s=t||(state.taskView.startsWith("agent:")?state.taskView.slice(6):"");$("#task-agents").innerHTML=ASSIGNABLE.map(a=>{const n=agentInfo(a);return`<label class="agent-pick">
        <input type="radio" name="agent" value="${a}" ${a===s?"checked":""} />
        <span>${avatar(a,"sm")}${esc(n.name)}</span>
      </label>`}).join(""),$("#new-task").hidden=!1,e.title.focus()}async function submitNewTask(t){t.preventDefault();const e=t.target,s=e.querySelector('button[type="submit"]'),a=e.agent.value;if(!a)return $("#task-error").textContent="\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0438\u0441\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044F.";s.disabled=!0;const n=await window.api.createTask({agent:a,title:e.title.value,body:e.body.value});if(s.disabled=!1,!n.ok)return $("#task-error").textContent=n.error;$("#new-task").hidden=!0,state.mode="tasks",state.taskView="all",state.tasks.find(r=>r.number===n.value)&&selectTask(n.value)}async function submitComment(t){const e=state.tasks.find(i=>i.number===state.selectedTask);if(!e)return;const s=t.body.value.trim();if(!s)return;const a=t.querySelector('button[type="submit"]');a.disabled=!0,t.body.value="";const n=await window.api.commentTask(e.number,s);if(a.disabled=!1,!n.ok){const i=document.querySelector("#composer textarea");i&&(i.value=s);const r=document.querySelector("#composer-error");r&&(r.textContent=n.error)}}async function changeTaskState(t){const e=state.tasks.find(a=>a.number===state.selectedTask);if(!e)return;const s=await window.api.setTaskState(e.number,t);s.ok||alert(s.error)}
