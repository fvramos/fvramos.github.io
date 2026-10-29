let cacheExplorerStarted = false;
function startCacheExplorer() {
  if (cacheExplorerStarted || !document.querySelector("#size")) return;
  cacheExplorerStarted = true;
  'use strict';
  const $=id=>document.getElementById(id);
  class CacheModel{
   constructor(n,b,c,w,p,stride){Object.assign(this,{n,b,c,w,p,stride});this.sets=c/b/w;this.mem=Array(n).fill(0);this.lines=Array.from({length:c/b},()=>({block:null,data:[],dirty:false,last:0}));this.pos=0;this.pass=0;this.stage='ready';this.clock=0;this.hits=0;this.misses=0;this.wb=0;this.stats=Array.from({length:p},()=>({h:0,m:0}));this.pending=null;this.event={title:'Ready',text:'The cache is empty. The first access updates byte 0.'};this.selected=-1;this.transfer=null;this.lastAddress=-1;}
   phase(){this.transfer=null;if(this.stage==='done')return;
   if(this.stage==='ready'){
    const a=this.pos,block=Math.floor(a/this.b),set=block%this.sets;let idx=this.lines.findIndex((l,i)=>Math.floor(i/this.w)===set&&l.block===block);const hit=idx>=0;
    if(!hit){idx=this.lines.findIndex((l,i)=>Math.floor(i/this.w)===set&&l.block===null);if(idx<0){idx=set*this.w;for(let i=idx+1;i<(set+1)*this.w;i++)if(this.lines[i].last<this.lines[idx].last)idx=i;}}
    this.pending={a,block,set,idx,hit};this.selected=idx;this.lastAddress=a;
    if(hit){this.hits++;this.stats[this.pass].h++;this.event={title:'Cache hit',text:`Pass ${this.pass+1}: byte ${a} belongs to block ${block}, already in set ${set}. Read it from cache.`,kind:'hit'};this.stage='update';}
    else{this.misses++;this.stats[this.pass].m++;const old=this.lines[idx];this.event={title:'Cache miss',text:`Pass ${this.pass+1}: byte ${a} belongs to block ${block}, mapped to set ${set}. ${old.block===null?'An empty way is available.':`Block ${old.block} must be replaced.`}`,kind:'miss'};this.stage=old.block===null?'fill':'evict';}
   }else if(this.stage==='evict'){
    const x=this.pending,l=this.lines[x.idx],old=l.block;if(l.dirty){l.data.forEach((v,j)=>this.mem[old*this.b+j]=v);this.wb++;this.transfer={block:old,idx:x.idx,back:true};}
    this.event={title:l.dirty?'Write back & evict':'Evict',text:`Remove block ${old} from set ${x.set}.${l.dirty?' Copy its modified bytes back to memory first.':''}`,kind:'miss'};this.lines[x.idx]={block:null,data:[],dirty:false,last:0};this.stage='fill';
   }else if(this.stage==='fill'){
    const x=this.pending,start=x.block*this.b;this.lines[x.idx]={block:x.block,data:this.mem.slice(start,start+this.b),dirty:false,last:0};this.transfer={block:x.block,idx:x.idx,back:false};this.event={title:'Load whole line',text:`Copy all ${this.b} bytes (${start}–${start+this.b-1}) into set ${x.set}, way ${x.idx%this.w}. Only byte ${x.a} will be updated.`,kind:'miss'};this.stage='update';
   }else if(this.stage==='update'){
    const x=this.pending,l=this.lines[x.idx],off=x.a%this.b,old=l.data[off];l.data[off]=(old+1)%256;l.dirty=true;l.last=++this.clock;this.event={title:'Update byte',text:`array[${x.a}]: ${old} → ${l.data[off]}. The cached line is dirty; memory retains its old value until writeback.`,kind:x.hit?'hit':'miss'};
    this.pos+=this.stride;if(this.pos>=this.n){this.pos=0;this.pass++;}this.stage=this.pass>=this.p?'done':'ready';
   }
   }
  }
  let model,timer=null;
  function pause(){clearInterval(timer);timer=null;$('play').textContent='▶ Play';}
  function reset(){pause();const n=+$('size').value,b=+$('line').value,c=+$('capacity').value;for(const o of $('ways').options)o.disabled=o.value!=='full'&&+o.value>c/b;if($('ways').selectedOptions[0].disabled)$('ways').value='full';for(const o of $('stride').options)o.disabled=+o.value>n/2;if(+$('stride').value>n/2)$('stride').value=String(n/2);const w=$('ways').value==='full'?c/b:+$('ways').value;model=new CacheModel(n,b,c,w,+$('passes').value,+$('stride').value);render();}
  function phase(){model.phase();render();if(model.stage==='done')pause();}
  function oneAccess(){pause();do{model.phase();}while(model.stage!=='ready'&&model.stage!=='done');render();}
  function bytes(start,data,isCache){return '<div class="bytes" style="--b:'+model.b+'">'+data.map((v,j)=>`<div class="byte ${(start+j===model.lastAddress)?'current':''}"><small>${start+j}</small><strong>${v}</strong></div>`).join('')+'</div>';}
  function render(){const m=model;let html='';for(let b=0;b<m.n/m.b;b++){const resident=m.lines.some(l=>l.block===b);html+=`<div id="block-${b}" class="block ${resident?'resident':''} ${Math.floor(m.lastAddress/m.b)===b?'target':''}"><span class="small">Block ${b}<br>${b*m.b}–${b*m.b+m.b-1}</span>${bytes(b*m.b,m.mem.slice(b*m.b,b*m.b+m.b),false)}</div>`;}$('memory').innerHTML=html;
   $('cache').innerHTML=m.lines.map((l,i)=>`<tr id="cache-${i}" class="${i===m.selected?'selected':''}"><td>${Math.floor(i/m.w)}</td><td>${i%m.w}</td><td>${l.block===null?'—':`B${l.block}<br><span class="small">tag ${Math.floor(l.block/m.sets)}</span>`}</td><td class="linebytes">${l.block===null?'Empty':bytes(l.block*m.b,l.data,true)}</td><td>${l.block===null?'Invalid':`<span class="badge ${l.dirty?'dirty':''}">${l.dirty?'Dirty':'Clean'}</span>`}</td></tr>`).join('');
   $('geometry').textContent=`${m.c} bytes · ${m.sets} set${m.sets===1?'':'s'} × ${m.w} way${m.w===1?'':'s'} × ${m.b} bytes/line`;
   $('phase').textContent=m.event.title;$('detail').textContent=m.event.text;$('status').className='panel status '+(m.event.kind||'');$('progress').textContent=m.stage==='done'?`${m.p} passes complete`:`Pass ${m.pass+1} / ${m.p} · ${m.stage==='ready'?'next offset '+m.pos:'offset '+m.pending.a}`;
   const seq=Array.from({length:Math.ceil(m.n/m.stride)},(_,i)=>i*m.stride);$('trace').textContent=(seq.length>18?seq.slice(0,16).join(' → ')+' → … → '+seq.at(-1):seq.join(' → '))+' → restart at 0';$('mapping').textContent=m.pending?`Block = floor(${m.pending.a} / ${m.b}) = ${m.pending.block}; set = ${m.pending.block} mod ${m.sets} = ${m.pending.set}.`:'Block = floor(byte offset / line size); set = block mod number of sets.';
   $('hits').textContent=m.hits;$('misses').textContent=m.misses;$('rate').textContent=m.hits+m.misses?(100*m.hits/(m.hits+m.misses)).toFixed(1)+'%':'—';$('wb').textContent=m.wb;$('passstats').textContent=m.stats.map((s,i)=>`Pass ${i+1}: ${s.h} hits, ${s.m} misses`).join(' · ');
   for(const id of ['play','step','access'])$(id).disabled=m.stage==='done';
   if(m.transfer){const block=$('block-'+m.transfer.block);const sc=$('memory');if(block.offsetTop<sc.scrollTop||block.offsetTop+block.offsetHeight>sc.scrollTop+sc.clientHeight)block.scrollIntoView({block:'nearest'});}
   requestAnimationFrame(drawArrow);
  }
  function drawArrow(){const t=model.transfer,p=$('flowpath');if(!t){p.setAttribute('d','');return;}const frame=$('scene').getBoundingClientRect(),a=$('block-'+t.block).getBoundingClientRect(),b=$('cache-'+t.idx).getBoundingClientRect();let x1=a.right-frame.left,y1=a.top+a.height/2-frame.top,x2=b.left-frame.left,y2=b.top+b.height/2-frame.top;if(t.back){[x1,x2]=[x2,x1];[y1,y2]=[y2,y1];}p.setAttribute('class',t.back?'writeback':'');p.setAttribute('d',`M${x1},${y1} C${(x1+x2)/2},${y1} ${(x1+x2)/2},${y2} ${x2},${y2}`);}
  $('play').onclick=()=>{if(timer){pause();return;}$('play').textContent='Ⅱ Pause';phase();if(model.stage!=='done')timer=setInterval(phase,+$('speed').value);};$('step').onclick=()=>{pause();phase();};$('access').onclick=oneAccess;$('reset').onclick=reset;
  for(const id of ['size','stride','capacity','line','ways','passes'])$(id).onchange=reset;
  $('speed').onchange=()=>{if(timer){clearInterval(timer);timer=setInterval(phase,+$('speed').value);}};
  const presets={local:[32,1,16,4,'full'],capacity:[32,4,16,4,'full'],conflict:[32,8,16,4,'2'],drop:[32,16,16,4,'2']};document.querySelectorAll('[data-preset]').forEach(btn=>btn.onclick=()=>{const v=presets[btn.dataset.preset];['size','stride','capacity','line','ways'].forEach((id,i)=>$(id).value=v[i]);reset();});window.addEventListener('resize',drawArrow);$('memory').addEventListener('scroll',drawArrow);reset();
}
document.addEventListener("site:content-loaded", startCacheExplorer);
startCacheExplorer();
