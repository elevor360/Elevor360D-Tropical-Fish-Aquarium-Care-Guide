const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY='elevor360d_tropical_fish_aquarium_care_v1';const defaults=()=>({mine:[],favs:[],completed:{},customTasks:[]});
let data;try{data={...defaults(),...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{data=defaults()}
let tips=[],ads=[],adIndex=0,view='Care Guides',search='',cat='All',installPrompt=null;
const save=()=>localStorage.setItem(KEY,JSON.stringify(data));
const all=()=>[...tips,...data.mine],get=id=>all().find(t=>String(t.id)===String(id));
const navs=['Care Guides','Favourites','My Guides','Care Checklist','Backup & Restore'];
function toast(t){$('#toast').textContent=t;$('#toast').style.display='block';setTimeout(()=>$('#toast').style.display='none',2800)}
function render(){
 $('#nav').innerHTML=navs.map(n=>`<button data-nav="${esc(n)}" class="${view===n?'active':''}">${esc(n)}</button>`).join('');
 document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{view=b.dataset.nav;render()});
 const c=$('#content');
 if(['Care Guides','Favourites','My Guides'].includes(view)){
 const categories=['All',...new Set(all().map(t=>t.category))];
 const list=all().filter(t=>view==='Care Guides'||(view==='Favourites'?data.favs.includes(String(t.id)):data.mine.some(m=>String(m.id)===String(t.id)))).filter(t=>view!=='Care Guides'||((cat==='All'||cat===t.category)&&[t.title,t.category,t.frequency].join(' ').toLowerCase().includes(search.toLowerCase())));
 c.innerHTML=`<div class="row between"><h2>${esc(view)} (${list.length})</h2>${view==='My Guides'?'<button id="addTip">+ Add My Guide</button>':''}</div>${view==='Care Guides'?`<div class="fields"><label class="field"><span>Search tips</span><input id="search" value="${esc(search)}" placeholder="e.g. hay, housing, health"></label><label class="field"><span>Care topic</span><select id="category">${categories.map(x=>`<option ${x===cat?'selected':''}>${esc(x)}</option>`).join('')}</select></label></div>`:''}<div class="grid">${list.map(t=>`<article class="card"><div class="row between"><span class="pill">${esc(t.category)}</span><span class="muted">${esc(t.frequency)}</span></div><h3>${esc(t.title)}</h3><p class="muted">${esc((t.steps||[])[0]||'')}</p><div class="row"><button data-open="${esc(t.id)}">View Steps</button><button class="ghost" data-fav="${esc(t.id)}">${data.favs.includes(String(t.id))?'★ Saved':'☆ Save'}</button>${data.mine.some(m=>String(m.id)===String(t.id))?`<button class="ghost" data-edit="${esc(t.id)}">Edit</button>`:''}</div></article>`).join('')}</div>`;
 if(view==='Care Guides'){$('#search').oninput=e=>{search=e.target.value;render();$('#search').focus();$('#search').setSelectionRange(search.length,search.length)};$('#category').onchange=e=>{cat=e.target.value;render()}}
 if($('#addTip'))$('#addTip').onclick=()=>editTip();
 document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>showTip(b.dataset.open));
 document.querySelectorAll('[data-fav]').forEach(b=>b.onclick=()=>{const id=String(b.dataset.fav);data.favs=data.favs.includes(id)?data.favs.filter(x=>x!==id):[...data.favs,id];save();render()});
 document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>editTip(b.dataset.edit));
 }else if(view==='Care Checklist')renderSchedule();else renderBackup();
}
function showTip(id){
 const t=get(id);if(!t)return;
 $('#dialogTitle').textContent=t.title;
 $('#dialogBody').innerHTML=`<div class="row"><span class="pill">${esc(t.category)}</span><span class="pill">${esc(t.frequency)}</span></div><h3>Care steps</h3><ol>${(t.steps||[]).map(s=>`<li>${esc(s)}</li>`).join('')}</ol>${t.caution?`<p class="notice"><strong>Safety:</strong> ${esc(t.caution)}</p>`:''}<button id="scheduleTip">Add to Care Checklist</button>`;
 $('#scheduleTip').onclick=()=>{if(!data.customTasks.some(x=>x.tipId===String(id)))data.customTasks.push({id:crypto.randomUUID(),tipId:String(id),title:t.title,frequency:t.frequency});save();toast('Added to care checklist')};
 $('#tipDialog').showModal();
}
$('#closeDialog').onclick=()=>$('#tipDialog').close();
function editTip(id){
 const t=id?get(id):{title:'',category:'Other',frequency:'Weekly',steps:[],caution:''};
 $('#dialogTitle').textContent=id?'Edit My Guide':'Add My Bird Care Tip';
 $('#dialogBody').innerHTML=`<form id="tipForm"><label class="field"><span>Tip title</span><input name="title" required value="${esc(t.title)}"></label><label class="field"><span>Care topic</span><input name="category" required value="${esc(t.category)}"></label><label class="field"><span>How often</span><select name="frequency">${['Daily','After use','Weekly','Monthly','Seasonal','As needed'].map(f=>`<option ${f===t.frequency?'selected':''}>${f}</option>`).join('')}</select></label><label class="field"><span>Care guidance (one per line)</span><textarea name="steps" required>${esc((t.steps||[]).join('\n'))}</textarea></label><label class="field"><span>Safety / veterinary note</span><textarea name="caution">${esc(t.caution||'')}</textarea></label><div class="row"><button type="submit">Save Tip</button>${id?'<button type="button" class="danger" id="deleteTip">Delete My Guide</button>':''}</div></form>`;
 $('#tipForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),obj={id:id||'mine-'+crypto.randomUUID(),title:String(f.get('title')).trim(),category:String(f.get('category')).trim(),frequency:String(f.get('frequency')),steps:String(f.get('steps')).split('\n').map(s=>s.trim()).filter(Boolean),caution:String(f.get('caution')).trim()};if(!obj.title||!obj.steps.length)return;data.mine=id?data.mine.map(x=>String(x.id)===String(id)?obj:x):[...data.mine,obj];save();$('#tipDialog').close();render()};
 if(id)$('#deleteTip').onclick=()=>{if(confirm('Delete this personal tip?')){data.mine=data.mine.filter(x=>String(x.id)!==String(id));save();$('#tipDialog').close();render()}};
 $('#tipDialog').showModal();
}
function renderSchedule(){
 const list=data.customTasks;
 $('#content').innerHTML=`<h2>Care Checklist</h2><p class="muted">Create your own checklist. Tick tasks as completed; use Reset Checks to start a new round. This is a manual checklist, not automatic reminders.</p><div class="panel"><div class="fields"><label class="field"><span>Task name</span><input id="taskName" placeholder="e.g. Brush coat"></label><label class="field"><span>Frequency</span><select id="taskFreq">${['Daily','Weekly','Monthly','Seasonal','As needed'].map(x=>`<option>${x}</option>`).join('')}</select></label></div><div class="row"><button id="addTask">Add Task</button><button class="ghost" id="resetChecks">Reset Checks</button></div><div id="taskList">${list.map(t=>`<div class="row between" style="padding:12px 0;border-bottom:1px solid #e3eee5"><label class="check"><input type="checkbox" data-done="${esc(t.id)}" ${data.completed[t.id]?'checked':''}><span>${esc(t.title)} <small class="muted">(${esc(t.frequency)})</small></span></label><button class="ghost" data-remove="${esc(t.id)}">Remove</button></div>`).join('')}</div></div>`;
 $('#addTask').onclick=()=>{const title=$('#taskName').value.trim();if(!title)return toast('Enter a task name');data.customTasks.push({id:crypto.randomUUID(),title,frequency:$('#taskFreq').value});save();renderSchedule()};
 $('#resetChecks').onclick=()=>{data.completed={};save();renderSchedule()};
 document.querySelectorAll('[data-done]').forEach(x=>x.onchange=()=>{data.completed[x.dataset.done]=x.checked;save()});
 document.querySelectorAll('[data-remove]').forEach(x=>x.onclick=()=>{data.customTasks=data.customTasks.filter(t=>t.id!==x.dataset.remove);delete data.completed[x.dataset.remove];save();renderSchedule()});
}
function renderBackup(){
 $('#content').innerHTML=`<h2>Backup & Restore</h2><div class="panel"><p>Export your personal tips, favourites and care checklist to a JSON file. Built-in care guides are included with the app.</p><button id="export">Download Backup</button><label class="field"><span>Restore a previous backup</span><input id="import" type="file" accept=".json,application/json"></label><p class="notice">Restoring replaces your personal data on this device.</p></div>`;
 $('#export').onclick=()=>{const u=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=u;a.download='Elevor360D-Budgie-Bird-Care-Backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)};
 $('#import').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;const x=JSON.parse(await f.text());if(!Array.isArray(x.mine)||!Array.isArray(x.favs)||!Array.isArray(x.customTasks)||typeof x.completed!=='object'||!x.completed)throw Error('Invalid backup');if(confirm('Replace your personal bird care data?')){data={...defaults(),...x};save();render();toast('Backup restored')}}catch{toast('Invalid backup file')}};
}
async function loadTips(){try{const r=await fetch('./tips.json',{cache:'no-store'});if(!r.ok)throw Error();tips=await r.json()}catch{try{tips=JSON.parse(localStorage.getItem('tropical_fish_aquarium_builtin_cache')||'[]')}catch{tips=[]}}if(tips.length)localStorage.setItem('tropical_fish_aquarium_builtin_cache',JSON.stringify(tips));render()}
function renderAd(){
 const d=$('#advert');if(!ads.length){d.innerHTML='<p class="muted">No adverts configured.</p>';return}
 const a=ads[adIndex];d.replaceChildren();const img=document.createElement('img');img.src='advertising/'+a.image.replace(/^\/+/,'');img.alt=a.title||'Sponsored advert';const title=document.createElement('p');title.textContent=a.title||'Sponsored advertisement';if(a.url){const link=document.createElement('a');link.href=a.url;link.target='_blank';link.rel='noopener noreferrer sponsored';link.append(img,title);d.append(link)}else d.append(img,title);
}
async function loadAds(){try{const r=await fetch('./advertising/adverts.json',{cache:'no-store'});const obj=await r.json();ads=Array.isArray(obj)?obj:(obj.adverts||[]);renderAd()}catch{ads=[];renderAd()}}
$('#prevAd').onclick=()=>{if(ads.length){adIndex=(adIndex-1+ads.length)%ads.length;renderAd()}};
$('#nextAd').onclick=()=>{if(ads.length){adIndex=(adIndex+1)%ads.length;renderAd()}};
setInterval(()=>{if(ads.length>1){adIndex=(adIndex+1)%ads.length;renderAd()}},10000);
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('#install').classList.remove('hide')});
$('#install').onclick=async()=>{if(installPrompt){installPrompt.prompt();await installPrompt.userChoice;installPrompt=null}else toast('Use your browser menu and choose Install app or Add to Home screen')};
window.addEventListener('appinstalled',()=>$('#install').classList.add('hide'));
if(window.matchMedia('(display-mode: standalone)').matches)$('#install').classList.add('hide');
else $('#install').classList.remove('hide');
function onlineStatus(){$('#offline').classList.toggle('hide',navigator.onLine)}
window.addEventListener('online',onlineStatus);window.addEventListener('offline',onlineStatus);onlineStatus();
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
loadTips();loadAds();
