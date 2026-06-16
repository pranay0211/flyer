const $ = (id) => document.getElementById(id);
const inputs = ['date','day','joining','happy','emceeName','workoutName','workoutType','knowledgeName','topic'];
function titleCase(s){return (s||'').trim().replace(/\s+/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}
function sync(){
  $('vDate').textContent=$('date').value; $('vDay').textContent=$('day').value; $('vJoining').textContent=$('joining').value; $('vHappy').textContent=$('happy').value;
  $('vEmceeInfo').textContent=titleCase($('emceeName').value); $('vEmceeName').textContent=titleCase($('emceeName').value);
  $('vWorkoutName').textContent=titleCase($('workoutName').value); $('vWorkoutType').textContent='Workout Type: '+titleCase($('workoutType').value);
  $('vKnowledgeName').textContent=titleCase($('knowledgeName').value); $('vTopic').textContent='Topic: '+titleCase($('topic').value);
}
inputs.forEach(id=>$(id).addEventListener('input',sync)); sync();
function photo(inputId,imgId){
  $(inputId).addEventListener('change',e=>{const f=e.target.files?.[0]; if(!f)return; const r=new FileReader(); r.onload=()=>$(imgId).src=r.result; r.readAsDataURL(f);});
}
photo('emceePhoto','vEmceePhoto'); photo('workoutPhoto','vWorkoutPhoto'); photo('knowledgePhoto','vKnowledgePhoto');
$('resetBgBtn').onclick=()=>{$('flyer').classList.remove('hasAi'); $('aiBackground').removeAttribute('src')};
$('aiBtn').onclick=async()=>{
  const btn=$('aiBtn'); btn.disabled=true; btn.textContent='Generating...';
  try{const fd=new FormData(); fd.append('theme',$('theme').value); const res=await fetch('/api/generate-background',{method:'POST',body:fd}); const json=await res.json(); if(!res.ok) throw new Error(json.error||'Generation failed'); $('aiBackground').src=json.image; $('flyer').classList.add('hasAi');}
  catch(e){alert(e.message + '\n\nUse CSS background until OPENAI_API_KEY is set on Render.');}
  finally{btn.disabled=false; btn.textContent='Generate AI Background';}
};
$('downloadBtn').onclick=async()=>{
  const canvas=await html2canvas($('flyer'),{scale:2,useCORS:true,backgroundColor:null});
  const a=document.createElement('a'); a.download=`WENY-Flyer-${$('date').value.replaceAll(' ','-')}.png`; a.href=canvas.toDataURL('image/png'); a.click();
};
