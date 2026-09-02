let contacts = [];
let editIndex = -1;

const tbody = document.getElementById('tbody');
const extractBtn = document.getElementById('extractBtn');

chrome.storage.local.get(['contacts'], r=>{
  contacts = r.contacts || [
    {name:'Liam Anderson', email:'liam.anderson@example.com', age:28, gender:'Male', marital:'Unmarried', country:'USA', phone:'+1 202-555-0188', city:'New York, USA'},
    {name:'Olivia Bennett', email:'olivia.bennett@example.com', age:25, gender:'Female', marital:'Single', country:'USA', phone:'+1 415-555-0127', city:'San Francisco, USA'}
  ];
  render();
});

function save(){ chrome.storage.local.set({contacts}); }

function render(){
  const q = document.getElementById('search').value.toLowerCase();
  const g = document.getElementById('filterGender').value;
  const s = document.getElementById('filterStatus').value;
  const c = document.getElementById('filterCountry').value;
  const sortBy = document.getElementById('sortBy').value;

  let filtered = contacts.filter(x=>{
    const matchQ = !q || JSON.stringify(x).toLowerCase().includes(q);
    const matchG = !g || x.gender===g;
    const matchS = !s || x.marital===s;
    const matchC = !c || x.country===c;
    return matchQ && matchG && matchS && matchC;
  });

  filtered.sort((a,b)=>{
    if(sortBy==='age') return (a.age||0)-(b.age||0);
    return String(a[sortBy]||'').localeCompare(String(b[sortBy]||''));
  });

  tbody.innerHTML='';
  filtered.forEach((ct, i)=>{
    const realIdx = contacts.indexOf(ct);
    tbody.innerHTML+=`<tr>
      <td>${ct.name||''}</td><td>${ct.email||''}</td><td>${ct.age||''}</td><td>${ct.gender||''}</td><td>${ct.marital||''}</td><td>${ct.country||''}</td><td>${ct.phone||''}</td><td>${ct.city||''}</td>
      <td><span class="del" data-i="${realIdx}">✕</span></td></tr>`;
  });

  // country dropdown
  const countries = [...new Set(contacts.map(x=>x.country).filter(Boolean))].sort();
  const sel = document.getElementById('filterCountry');
  const cur = sel.value;
  sel.innerHTML='<option value="">All Countries</option>'+countries.map(cc=>`<option ${cc===cur?'selected':''}>${cc}</option>`).join('');

  document.querySelectorAll('.del').forEach(el=>el.onclick=()=>{
    contacts.splice(parseInt(el.dataset.i),1); save(); render();
  });
}

document.getElementById('search').oninput=render;
document.getElementById('filterGender').onchange=render;
document.getElementById('filterStatus').onchange=render;
document.getElementById('filterCountry').onchange=render;
document.getElementById('sortBy').onchange=render;

extractBtn.onclick=async()=>{
  const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
  chrome.scripting.executeScript({target:{tabId:tab.id}, function:extractFromPage}, (results)=>{
    if(chrome.runtime.lastError){ alert(chrome.runtime.lastError.message); return; }
    const emails = results[0]?.result || [];
    emails.forEach(e=>{
      if(!contacts.find(c=>c.email===e.email)){
        contacts.push({name:e.name||e.email.split('@')[0], email:e.email, age:'', gender:'', marital:'', country:'', phone:'', city:''});
      }
    });
    save(); render();
    if(emails.length===0) alert('No emails found on this page.');
  });
};

function extractFromPage(){
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const text = document.body.innerText;
  const matches = text.match(emailRegex) || [];
  const uniq = [...new Set(matches)].filter(e=>!e.endsWith('.png')&&!e.endsWith('.jpg'));
  return uniq.map(email=>({email, name:''}));
}

document.getElementById('saveContact').onclick=()=>{
  const obj = {
    name: document.getElementById('f_name').value.trim(),
    email: document.getElementById('f_email').value.trim(),
    age: parseInt(document.getElementById('f_age').value)||'',
    gender: document.getElementById('f_gender').value,
    marital: document.getElementById('f_marital').value,
    country: document.getElementById('f_country').value.trim(),
    phone: document.getElementById('f_phone').value.trim(),
    city: document.getElementById('f_city').value.trim()
  };
  if(!obj.email){ alert('Email required'); return; }
  if(editIndex>=0) contacts[editIndex]=obj; else contacts.push(obj);
  editIndex=-1; save(); render();
  document.querySelectorAll('.add-form input').forEach(i=>i.value='');
};

document.getElementById('csvFile').onchange=(e)=>{
  const file=e.target.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=()=>{
    const lines=reader.result.split('\n').filter(Boolean);
    const headers=lines[0].split(',').map(h=>h.trim().toLowerCase());
    for(let i=1;i<lines.length;i++){
      const vals=lines[i].split(','); let o={};
      headers.forEach((h,idx)=>o[h]= (vals[idx]||'').trim());
      const mapped={name:o.name||o.user||'', email:o.email||'', age:parseInt(o.age)||'', gender:o.gender||'', marital:o.marital||o['married/unmarried']||o.status||'', country:o.country||'', phone:o.phone||'', city:o.city||''};
      if(mapped.email && !contacts.find(c=>c.email===mapped.email)) contacts.push(mapped);
    }
    save(); render();
  };
  reader.readAsText(file);
};

document.getElementById('exportBtn').onclick=()=>{
  const header=['name','email','age','gender','marital','country','phone','city'];
  const rows=[header.join(',')].concat(contacts.map(c=>header.map(h=>`"${(c[h]||'').toString().replace(/"/g,'""')}"`).join(',')));
  const blob=new Blob([rows.join('\n')],{type:'text/csv'});
  const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='contacts_organized.csv'; a.click();
};
