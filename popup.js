const $=s=>document.querySelector(s),M=$("#main");
const h=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const shuf=a=>[...a].sort(()=>Math.random()-.5);
const dstr=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const dayWords=d=>[0,1,2,3,4].map(i=>W[(d*5+i)%W.length]);
let S,day,tab=0,voices=[];
const save=()=>chrome.storage.local.set({s:S});
const mark=k=>{(S.steps[day]=S.steps[day]||{})[k]=1;save()};
const learned=()=>W.slice(0,Math.min(day*5,W.length));
const loadV=()=>{voices=speechSynthesis.getVoices()};loadV();speechSynthesis.onvoiceschanged=loadV;
// مەخپىيەتلىك: پەقەت يەرلىك (localService) ئاۋاز ئىشلىتىلىدۇ، تاشقى مۇلازىمېتىرغا تېكىست ئەۋەتىلمەيدۇ
function say(t){const v=voices.find(v=>v.localService&&v.lang.toLowerCase().startsWith("en"));
  if(!v){$("#note").textContent="سىستېمىڭىزدا يەرلىك ئىنگلىزچە ئاۋاز يوق. مەخپىيەتلىك ئۈچۈن تاشقى ئاۋاز ئىشلىتىلمەيدۇ.";return}
  $("#note").textContent="";const u=new SpeechSynthesisUtterance(t);u.voice=v;u.lang=v.lang;u.rate=.9;speechSynthesis.cancel();speechSynthesis.speak(u)}
const mcItem=(w,m)=>{const pool=shuf(W.filter(x=>x!==w)).slice(0,3),ug=m!==1;
  return{q:m===1?w[1]:m===2?"🔊":w[0],say:m===2?w[0]:null,rtl:m===1,optRtl:ug,ans:ug?w[1]:w[0],opts:shuf([w,...pool]).map(x=>ug?x[1]:x[0])}};
const typeItem=w=>({q:w[1],rtl:true,say:w[0],type:true,ans:w[0]});
function runQuiz(items,done){let i=0,sc=0;const wrong=[];
  const step=()=>{M.replaceChildren();
    if(i>=items.length){const p=Math.round(sc/items.length*100),c=h("div","card center");
      c.append(h("div","big",p+"%"),h("p","",`${sc} / ${items.length}`));
      if(wrong.length)c.append(h("p","muted","تەكرارلاڭ: "+[...new Set(wrong)].join(" ، ")));
      const b=h("button","btn","تامام");b.onclick=()=>done(p);c.append(b);M.append(c);return}
    const it=items[i],c=h("div","card");c.append(h("div","prog",`${i+1} / ${items.length}`),h("div","q"+(it.rtl?" rtl":""),it.q));
    if(it.say){const s=h("button","icon","🔊");s.onclick=()=>say(it.say);c.append(s);setTimeout(()=>say(it.say),200)}
    const next=ok=>{ok?sc++:wrong.push(it.type?it.ans:it.ans);i++;setTimeout(step,ok?600:1300)};
    if(it.type){const inp=h("input","inp"),b=h("button","btn","تەكشۈر");inp.dir="ltr";inp.placeholder="English";
      b.onclick=()=>{b.disabled=true;const ok=inp.value.trim().toLowerCase()===it.ans;inp.classList.add(ok?"ok":"bad");if(!ok)c.append(h("p","ans",it.ans));next(ok)};
      inp.onkeydown=e=>e.key==="Enter"&&b.click();c.append(inp,b);setTimeout(()=>inp.focus(),60)}
    else it.opts.forEach(o=>{const b=h("button","opt"+(it.optRtl?" rtl":""),o);
      b.onclick=()=>{c.querySelectorAll(".opt").forEach(x=>{x.disabled=true;if(x.textContent===it.ans)x.classList.add("ok")});if(o!==it.ans)b.classList.add("bad");next(o===it.ans)};c.append(b)});
    M.append(c)};
  step()}
const views=[
function today(){dayWords(day).forEach(w=>{const c=h("div","card"),r=h("div","row"),l=h("div");
    l.append(h("div","en",w[0]),h("div","ug",w[1]));const s=h("button","icon","🔊");s.onclick=()=>say(w[0]);r.append(l,s);c.append(r);M.append(c)});
  const b=h("button","btn","ئۆگىنىپ بولدۇم ✓");b.onclick=()=>{mark("learn");b.textContent="ياخشى! مەشىققە ئۆتۈڭ ←"};M.append(b)},
function practice(){const st=S.steps[day]||{},ws=dayWords(day);
  const plan=[["p0","1) ئاڭلا ۋە مەنىسىنى تاللا",()=>ws.map(w=>mcItem(w,2))],
    ["p1","2) ئۇيغۇرچىسىغا qarap ئىنگلىزچىسىنى تاللا".replace("qarap","قاراپ"),()=>ws.map(w=>mcItem(w,1))],
    ["p2","3) ئاڭلاپ يېزىش (ئىملا)",()=>ws.map(typeItem)]];
  plan.forEach(([k,t,f])=>{const c=h("div","card row"),x=h("span",st[k]?"done":"",t),b=h("button","icon","▶");
    b.onclick=()=>runQuiz(f(),p=>{if(p>=60)mark(k);go(1)});c.append(x,b);M.append(c)})},
function review(){const set=new Map();[1,3,7].forEach(g=>{const d=day-g;if(d>=0)dayWords(d).forEach(w=>set.set(w[0],w))});
  const ws=[...set.values()];if(!ws.length){M.append(h("div","card center","تېخى تەكرارلايدىغان سۆز يوق. ئەتە قايتا كېلىڭ."));return}
  const c=h("div","card center");c.append(h("p","",`بۈگۈن ${ws.length} سۆزنى تەكرارلايسىز (1، 3، 7 كۈن بۇرۇنقى)`));
  const b=h("button","btn","باشلاش");b.onclick=()=>runQuiz(shuf(ws).map((w,i)=>i%3===2?typeItem(w):mcItem(w,i%3)),p=>{mark("review");go(2)});c.append(b);M.append(c)},
function exam(){const pool=learned(),c=h("div","card center");
  if(pool.length<5){c.append(h("p","","ئىمتىهان ئۈچۈن ئەڭ ئاز 5 سۆز ئۆگىنىشىڭىز كېرەك."));M.append(c);return}
  const b=h("button","btn",`ئىمتىهان باشلاش (${Math.min(10,pool.length)} سوئال)`);
  b.onclick=()=>runQuiz(shuf(pool).slice(0,10).map((w,i)=>i%4===3?typeItem(w):mcItem(w,i%3)),p=>{S.exams.push({d:dstr(new Date()),p});S.exams=S.exams.slice(-30);mark("exam");go(3)});
  c.append(b);M.append(c);
  S.exams.slice(-5).reverse().forEach(e=>{const r=h("div","card row");r.append(h("span","muted",e.d),h("b","",e.p+"%"));M.append(r)})}];
const names=["بۈگۈن","مەشىق","تەكرار","ئىمتىهان"];
function go(i){tab=i;M.replaceChildren();document.querySelectorAll("#tabs button").forEach((b,j)=>b.classList.toggle("on",j===i));views[i]()}
const applyTheme=()=>{S.theme==="auto"?delete document.documentElement.dataset.theme:document.documentElement.dataset.theme=S.theme};
(async()=>{const r=await chrome.storage.local.get("s");S=r.s||{start:dstr(new Date()),steps:{},exams:[],theme:"auto"};
  if(!r.s)save();day=Math.max(0,Math.round((new Date(dstr(new Date()))-new Date(S.start))/864e5));
  $("#dayInfo").textContent=`${day+1}-كۈن · بۈگۈنكى 5 سۆز`;applyTheme();
  names.forEach((n,i)=>{const b=h("button","",n);b.onclick=()=>go(i);$("#tabs").append(b)});
  $("#theme").onclick=()=>{S.theme={auto:"dark",dark:"light",light:"auto"}[S.theme];applyTheme();save()};go(0)})();
