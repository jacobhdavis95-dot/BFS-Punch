const STORAGE_KEY = 'bfs-punch-items-v1';
const starterItems = [
  {id:1,title:'Incorrect header height',description:'Header at garage opening does not match plan.',location:'Building 6 · Lot 42',priority:'Urgent',status:'assigned',assignee:'Turner Framing',initials:'TF',created:Date.now()-7200000,photos:[]},
  {id:2,title:'Window flashing incomplete',description:'Complete flashing before exterior inspection.',location:'Building 4 · Lot 31',priority:'Normal',status:'new',assignee:'Ramos Exteriors',initials:'RE',created:Date.now()-86400000,photos:[]},
  {id:3,title:'Replace damaged stair stringer',description:'Stringer split near the upper landing.',location:'Building 7 · Lot 48',priority:'Normal',status:'assigned',assignee:'Apex Carpentry',initials:'AC',created:Date.now()-172800000,photos:[]}
];
let items = loadItems(); let activeFilter = 'all'; let selectedPhotos = [];
const $ = selector => document.querySelector(selector);

$('#currentDate').textContent = new Intl.DateTimeFormat('en-US', {month:'long', day:'numeric', year:'numeric'}).format(new Date());
function loadItems(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)) || starterItems}catch{return starterItems}}
function saveItems(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(items))}catch{showToast('Saved item, but photos exceed device storage')}}
function esc(value=''){const div=document.createElement('div');div.textContent=value;return div.innerHTML}
function relativeTime(timestamp){const hours=Math.floor((Date.now()-timestamp)/3600000);if(hours<1)return 'Just now';if(hours<24)return `${hours}h ago`;const days=Math.floor(hours/24);return `${days}d ago`}
function render(){
  const visible=items.filter(item=>activeFilter==='all'||(activeFilter==='urgent'?item.priority==='Urgent':item.status===activeFilter));
  $('#openCount').textContent=items.length; $('#emptyState').hidden=visible.length>0;
  $('#itemList').innerHTML=visible.map(item=>`<article class="item-card" data-id="${item.id}"><div class="item-photo">${item.photos?.[0]?`<img src="${item.photos[0]}" alt="Photo for ${esc(item.title)}">`:'<span class="placeholder">▧</span>'}${item.photos?.length?`<span class="photo-count">▣ ${item.photos.length}</span>`:''}</div><div class="item-content"><div class="badges">${item.priority==='Urgent'?'<span class="badge urgent">Urgent</span>':''}<span class="badge ${item.status}">${item.status}</span></div><h3>${esc(item.title)}</h3><p>${esc(item.location)} · ${esc(item.description)}</p><div class="meta"><span><i class="avatar">${esc(item.initials)}</i>${esc(item.assignee)}</span><time>${relativeTime(item.created)}</time></div></div></article>`).join('');
}
function openForm(){selectedPhotos=[];$('#itemForm').reset();$('#photoPreview').innerHTML='';$('#itemDialog').showModal();setTimeout(()=>$('#titleInput').focus(),100)}
function showToast(message){const toast=$('#toast');toast.textContent=message;toast.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove('show'),2600)}
async function readPhotos(files){selectedPhotos=[];for(const file of [...files].slice(0,5)){selectedPhotos.push(await resizeImage(file))}$('#photoPreview').innerHTML=selectedPhotos.map(src=>`<img src="${src}" alt="Selected jobsite photo">`).join('')}
function resizeImage(file){return new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{const scale=Math.min(1,1000/img.width);const canvas=document.createElement('canvas');canvas.width=img.width*scale;canvas.height=img.height*scale;canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',.72))};img.src=reader.result};reader.readAsDataURL(file)})}
function shareReport(){const text=`BFS Punch — ${$('#activeProject').textContent}\n${items.length} open item${items.length===1?'':'s'}\n\n`+items.map((x,i)=>`${i+1}. ${x.title} — ${x.location} — Assigned to ${x.assignee}`).join('\n');if(navigator.share){navigator.share({title:'BFS Punch Report',text}).catch(()=>{})}else{navigator.clipboard?.writeText(text);showToast('Report copied to clipboard')}}

$('#newPunch').onclick=openForm;$('#navAdd').onclick=openForm;$('#cameraShortcut').onclick=()=>{openForm();setTimeout(()=>$('#photoInput').click(),150)};
$('#photoInput').onchange=e=>readPhotos(e.target.files);
$('#itemForm').addEventListener('submit',event=>{if(event.submitter?.value==='cancel')return;event.preventDefault();const assignee=$('#assigneeInput').value.trim();items.unshift({id:Date.now(),title:$('#titleInput').value.trim(),description:$('#descriptionInput').value.trim(),location:$('#locationInput').value.trim(),priority:$('#priorityInput').value,status:'new',assignee,initials:assignee.split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase(),created:Date.now(),photos:selectedPhotos});saveItems();render();$('#itemDialog').close();showToast('Punch item created and assigned')});
$('#filterButton').onclick=()=>{$('#filters').hidden=!$('#filters').hidden};
document.querySelectorAll('[data-filter]').forEach(button=>button.onclick=()=>{activeFilter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===button));render()});
$('#shareReport').onclick=shareReport;$('#reportsNav').onclick=shareReport;$('#viewAll').onclick=()=>{activeFilter='all';$('#filters').hidden=false;render();window.scrollTo({top:470,behavior:'smooth'})};
$('#changeProject').onclick=()=>{const name=prompt('Active project name',$('#activeProject').textContent);if(name?.trim()){$('#activeProject').textContent=name.trim();showToast('Active project updated')}};
$('#helpButton').onclick=()=>$('#infoDialog').showModal();$('#infoDialog .close').onclick=()=>$('#infoDialog').close();
$('#itemsNav').onclick=()=>window.scrollTo({top:470,behavior:'smooth'});$('#teamNav').onclick=()=>showToast('Team directory is ready for backend integration');
render();
