(function(){
'use strict';
var LAB={"anime":"Anime","kids":"Baby & Kids","beauty":"Beauty & Health","media":"Books, Music & Movies","collectibles":"Collectibles & Art","electronics":"Electronics & Tech","fashion":"Fashion & Accessories","fragrances":"Fragrances","home":"Home & Kitchen","jewelry":"Jewelry & Watches","music_gear":"Musical Instruments & Gear","office":"Office & More","other":"Other Finds","outdoor":"Outdoor & Sports","pets":"Pets","tools_auto":"Tools & Auto","travel":"Travel & Experiences","watches":"Watches"};
function $(s,r){return (r||document).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function fmt(v){return '$'+Number(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
function tier(p){return p>=80?4:p>=70?3:p>=60?2:1}
function keyOf(d){return (d.subcategory||'').indexOf('fragrance')===0?'fragrances':d.category}
function card(d){var p=Math.round(d.discount_pct),k=keyOf(d),t=d.title.slice(0,90);
 return "<a class='card' id='"+esc(d.id)+"' href='"+esc(d.url)+"' target='_blank' rel='noopener sponsored nofollow' data-cat='"+esc(k||'')+"' data-price='"+d.price+"' data-discount='"+p+"' data-search='"+esc(t.toLowerCase())+"'><span class='off pct-t"+tier(p)+"'>"+p+"%</span><span class='im'><img src='"+esc(d.image_url||'')+"' alt='' loading='lazy' decoding='async'></span><span class='cat'>"+esc(d.cat_label||LAB[k]||LAB[d.category]||'Deals')+"</span><span class='badge'>eBay deal</span><h4>"+esc(t)+"</h4><span class='price-row'><span class='now'>"+fmt(d.price)+"</span><span class='was'>"+fmt(d.original_price)+"</span></span><span class='seen'>Seen "+esc(d.seen_text||'now')+"</span></a>"}
function setOn(btns,on,attr){btns.forEach(function(b){var a=b===on;b.classList.toggle('on',a);b.setAttribute('aria-pressed',String(a))})}

/* theme: the same toggle as the rest of the site (data-theme on <html>, saved as 'theme') */
(function(){var btn=$('#themeToggle');if(!btn)return;
 function cur(){var e=document.documentElement.getAttribute('data-theme');if(e)return e;return (window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light'}
 btn.setAttribute('aria-pressed',cur()==='dark'?'true':'false');
 btn.addEventListener('click',function(){var n=cur()==='dark'?'light':'dark';document.documentElement.setAttribute('data-theme',n);try{localStorage.setItem('theme',n)}catch(e){}btn.setAttribute('aria-pressed',n==='dark'?'true':'false')})})();

/* broken product photos: neutral note instead of a hole */
document.addEventListener('error',function(e){var img=e.target;if(!img||img.tagName!=='IMG')return;var box=img.closest('.im,.photo,.th,.cv');if(!box)return;img.hidden=true;box.classList.add('image-failed')},true);

/* live feed, loaded once on first use */
var feed=null,feedCbs=[],feedBusy=false;
function withFeed(cb){if(feed)return cb(feed);feedCbs.push(cb);if(feedBusy)return;feedBusy=true;
 fetch('/deals.json').then(function(r){return r.json()}).then(function(j){feed=(j.deals||[]).filter(function(d){return d.image_url&&d.price&&d.original_price});feedCbs.splice(0).forEach(function(f){f(feed)})}).catch(function(){feedBusy=false})}

/* ---- The deal edit ---- */
var grid=$('#deal-grid');
if(grid){
 var st={cat:'all',gender:'all',q:'',sort:'featured',n:10},count=$('#result-count'),empty=$('#empty'),more=$('#dealMore'),search=$('#search'),pickPool=null;
 function norm(s){return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')}
 function matchCat(d){if(st.gender!=='all'&&d.gender!==st.gender)return false;var c=st.cat;if(c==='all')return true;if(c==='budget')return d.price<20;if(c==='picks')return false;return keyOf(d)===c}
 function matchQ(t){if(!st.q)return true;var q=norm(st.q).split(/\s+/);var x=norm(t);return q.every(function(w){return x.indexOf(w)>-1})}
 function sorted(l){if(st.sort==='price')return l.slice().sort(function(a,b){return a.price-b.price});if(st.sort==='discount')return l.slice().sort(function(a,b){return b.discount_pct-a.discount_pct});return l}
 function pickCards(){if(!pickPool)pickPool=$$('#pick-grid .card').map(function(c){return c.cloneNode(true)});return pickPool}
 function draw(){
  if(st.cat==='picks'){var pk=pickCards().filter(function(c){return matchQ(c.getAttribute('data-search'))});
   if(st.sort==='price')pk.sort(function(a,b){return a.getAttribute('data-price')-b.getAttribute('data-price')});
   if(st.sort==='discount')pk.sort(function(a,b){return b.getAttribute('data-discount')-a.getAttribute('data-discount')});
   grid.innerHTML='';pk.slice(0,st.n).forEach(function(c){grid.appendChild(c.cloneNode(true))});
   count.textContent='Showing '+Math.min(st.n,pk.length)+' of '+pk.length+' Amazon picks';empty.hidden=pk.length>0;more.hidden=st.n>=pk.length;return}
  withFeed(function(f){var l=sorted(f.filter(function(d){return matchCat(d)&&matchQ(d.title)}));
   grid.innerHTML=l.slice(0,st.n).map(card).join('');
   count.textContent='Showing '+Math.min(st.n,l.length).toLocaleString('en-US')+' of '+l.length.toLocaleString('en-US')+' deals'+(st.cat==='budget'?' · Under $20':'');
   empty.hidden=l.length>0;more.hidden=st.n>=l.length})}
 function go(cat,scroll){st.cat=cat;st.n=10;draw();var btns=$$('.rail [data-category]');setOn(btns,btns.filter(function(b){return b.getAttribute('data-category')===cat})[0]||null);if(scroll)$('#deals').scrollIntoView({block:'start'})}
 $$('.rail [data-category]').forEach(function(b){b.addEventListener('click',function(){go(b.getAttribute('data-category'),true)})});
 $$('[data-filter]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();go(b.getAttribute('data-filter'),true)})});
 more.addEventListener('click',function(){st.n+=10;draw()});
 $('#sort').addEventListener('change',function(e){st.sort=e.target.value;draw()});
 var gsel=$('#gender');if(gsel)gsel.addEventListener('change',function(){st.gender=gsel.value;st.n=10;draw()});
 $('.reset').addEventListener('click',function(){st.q='';st.sort='featured';st.gender='all';search.value='';$('#sort').value='featured';if(gsel)gsel.value='all';go('all',false)});
 var t;search.addEventListener('input',function(){clearTimeout(t);t=setTimeout(function(){st.q=search.value.trim();st.n=10;if(st.q){draw();$('#deals').scrollIntoView({block:'start'})}else draw()},250)});
 var u=new URLSearchParams(location.search),dd=u.get('deal')||(location.hash.indexOf('#d-')===0?location.hash.slice(1):'');
 if(dd){withFeed(function(f){var d=f.filter(function(x){return x.id===dd})[0];if(d){grid.insertAdjacentHTML('afterbegin',card(d).replace("class='card'","class='card shared'"));$('#deals').scrollIntoView()}})}
}

/* ---- eBay panel ---- */
(function(){var p=$('#ebay');if(!p)return;var g=$('#ebay-grid'),btns=$$('[data-ecat]',p),empty=$('.e-empty',p),more=$('#ebayMore'),s={cat:'all',n:10};
 function draw(){withFeed(function(f){var l=f.filter(function(d){return s.cat==='all'||keyOf(d)===s.cat});g.innerHTML=l.slice(0,s.n).map(card).join('');empty.hidden=l.length>0;more.hidden=s.n>=l.length})}
 btns.forEach(function(b){b.addEventListener('click',function(){s.cat=b.getAttribute('data-ecat');s.n=10;setOn(btns,b);draw()})});
 more.addEventListener('click',function(){s.n+=10;draw()})})();

/* ---- Amazon Picks panel (cards are in the page; chips, gender, sort and search filter them) ---- */
(function(){var p=$('#picks');if(!p)return;var grid=$('#pick-grid'),cards=$$('#pick-grid .card'),btns=$$('[data-pcat]',p),empty=$('.p-empty',p),step=parseInt(grid.getAttribute('data-step')||'8',10),
 s={cat:'all',gender:'all',sort:'featured',q:'',n:step},wrap=document.createElement('div'),count=$('#picks-count'),fg=$('#p-gender'),fs=$('#p-sort'),
 srch=$('#deal-grid')?null:$('#search'),order=cards.slice();
 wrap.className='deal-more';wrap.innerHTML="<button class='btn' type='button'>Show more picks</button>";$('.in',p).appendChild(wrap);var more=$('button',wrap);
 function nrm(t){return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')}
 function num(c,a){return parseFloat(c.getAttribute(a))||0}
 function draw(){var q=nrm(s.q).split(/\s+/).filter(Boolean),
  m=order.filter(function(c){return (s.cat==='all'||c.getAttribute('data-pcat')===s.cat)&&(s.gender==='all'||c.getAttribute('data-gender')===s.gender)&&q.every(function(w){return nrm(c.getAttribute('data-search')).indexOf(w)>-1})});
  if(s.sort==='price')m=m.slice().sort(function(a,b){var x=num(a,'data-price'),y=num(b,'data-price');return (x||1e12)-(y||1e12)});
  if(s.sort==='discount')m=m.slice().sort(function(a,b){return num(b,'data-discount')-num(a,'data-discount')});
  cards.forEach(function(c){c.hidden=true});m.slice(0,s.n).forEach(function(c){c.hidden=false;grid.appendChild(c)});
  if(count)count.textContent='Showing '+Math.min(s.n,m.length)+' of '+m.length+' picks';empty.hidden=m.length>0;wrap.hidden=s.n>=m.length}
 btns.forEach(function(b){b.addEventListener('click',function(){s.cat=b.getAttribute('data-pcat');s.n=step;setOn(btns,b);draw()})});
 if(fg)fg.addEventListener('change',function(){s.gender=fg.value;s.n=step;draw()});
 if(fs)fs.addEventListener('change',function(){s.sort=fs.value;s.n=step;draw()});
 if(srch){var t;srch.addEventListener('input',function(){clearTimeout(t);t=setTimeout(function(){s.q=srch.value.trim();s.n=step;draw()},200)});
  var u=new URLSearchParams(location.search).get('q');if(u){srch.value=u;s.q=u}}
 more.addEventListener('click',function(){s.n+=step;draw()});draw()})();

/* ---- Brands page: brand + gender + sort + search over /deals-brands.json (first screenful is in the page) ---- */
(function(){var g=$('#brand-grid');if(!g)return;
 var st={brand:'all',gender:'all',sort:'featured',q:'',n:20},count=$('#result-count'),empty=$('#empty'),more=$('#brandMore'),fb=$('#f-brand'),fg=$('#f-gender'),fs=$('#f-sort'),search=$('#search'),rows=null,loading=false,cbs=[];
 function nrm(t){return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')}
 function load(cb){if(rows)return cb();cbs.push(cb);if(loading)return;loading=true;if(count)count.textContent='Loading all brand deals…';
  fetch('/deals-brands.json').then(function(r){return r.json()}).then(function(j){rows=(j.deals||[]).filter(function(d){return d.image_url&&d.price&&d.original_price});cbs.splice(0).forEach(function(f){f()})})
   .catch(function(){loading=false;cbs.length=0;if(count)count.textContent='Could not load more deals. Refresh to try again.'})}
 function draw(){load(function(){var q=nrm(st.q).split(/\s+/).filter(Boolean),
  l=rows.filter(function(d){return (st.brand==='all'||d.brand_slug===st.brand)&&(st.gender==='all'||d.gender===st.gender)&&q.every(function(w){return nrm(d.title).indexOf(w)>-1})});
  if(st.sort==='price')l=l.slice().sort(function(a,b){return a.price-b.price});if(st.sort==='price-desc')l=l.slice().sort(function(a,b){return b.price-a.price});
  g.innerHTML=l.slice(0,st.n).map(card).join('');count.textContent='Showing '+Math.min(st.n,l.length).toLocaleString('en-US')+' of '+l.length.toLocaleString('en-US')+' deals';
  empty.hidden=l.length>0;more.hidden=st.n>=l.length})}
 fb.addEventListener('change',function(){st.brand=fb.value;st.n=20;draw()});
 fg.addEventListener('change',function(){st.gender=fg.value;st.n=20;draw()});
 fs.addEventListener('change',function(){st.sort=fs.value;st.n=20;draw()});
 more.addEventListener('click',function(){st.n+=20;draw()});
 $('.reset').addEventListener('click',function(){st={brand:'all',gender:'all',sort:'featured',q:'',n:20};fb.value='all';fg.value='all';fs.value='featured';if(search)search.value='';draw()});
 if(search){var t;search.addEventListener('input',function(){clearTimeout(t);t=setTimeout(function(){st.q=search.value.trim();st.n=20;draw()},250)})}
 var u=new URLSearchParams(location.search),qb=u.get('brand'),qg=u.get('gender'),qq=u.get('q');
 if(qb&&fb.querySelector("option[value='"+qb.replace(/[^a-z0-9-]/gi,'')+"']")){fb.value=qb;st.brand=qb}
 if(qg&&/^(women|men|other)$/.test(qg)){fg.value=qg;st.gender=qg}
 if(qq&&search){search.value=qq;st.q=qq}
 if(st.brand!=='all'||st.gender!=='all'||st.q)draw()})();

/* ---- Category pages: gender + sort + search, rest of the page's feed loaded on first use (data-feed + data-feed-* narrow it) ---- */
(function(){var g=$('#cat-grid');if(!g||!g.getAttribute('data-feed'))return;
 var url=g.getAttribute('data-feed'),wCat=g.getAttribute('data-feed-cat'),wSub=g.getAttribute('data-feed-subcat'),wType=g.getAttribute('data-feed-type'),wMin=g.getAttribute('data-feed-price-min'),wMax=g.getAttribute('data-feed-price-max'),
  step=20,st={gender:'all',sort:'featured',q:'',n:g.querySelectorAll('.card').length+step},count=$('#result-count'),empty=$('#empty'),more=$('#catMore'),fg=$('#c-gender'),fs=$('#c-sort'),search=$('#search'),rows=null,loading=false,cbs=[],total=null;
 function nrm(t){return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')}
 function ok(d){return d.image_url&&d.price&&d.original_price&&(!wCat||d.category===wCat)&&(!wSub||d.subcategory===wSub)&&(!wType||d.fashion_type===wType)&&(wMin===null||d.price>parseFloat(wMin))&&(wMax===null||d.price<=parseFloat(wMax))}
 function load(cb){if(rows)return cb();cbs.push(cb);if(loading)return;loading=true;if(count)count.textContent='Loading all deals…';
  fetch(url).then(function(r){return r.json()}).then(function(j){rows=(j.deals||[]).filter(ok);cbs.splice(0).forEach(function(f){f()})})
   .catch(function(){loading=false;cbs.length=0;if(count)count.textContent='Could not load more deals. Refresh to try again.'})}
 function draw(){load(function(){var q=nrm(st.q).split(/\s+/).filter(Boolean),
  l=rows.filter(function(d){return (st.gender==='all'||d.gender===st.gender)&&q.every(function(w){return nrm(d.title).indexOf(w)>-1})});
  if(st.sort==='price')l=l.slice().sort(function(a,b){return a.price-b.price});if(st.sort==='price-desc')l=l.slice().sort(function(a,b){return b.price-a.price});
  g.innerHTML=l.slice(0,st.n).map(card).join('');count.textContent='Showing '+Math.min(st.n,l.length).toLocaleString('en-US')+' of '+l.length.toLocaleString('en-US')+' deals';
  empty.hidden=l.length>0;more.hidden=st.n>=l.length})}
 if(more)more.addEventListener('click',function(){st.n+=step;draw()});
 fg.addEventListener('change',function(){st.gender=fg.value;st.n=step*2;draw()});
 fs.addEventListener('change',function(){st.sort=fs.value;st.n=step*2;draw()});
 if(search){var t;search.addEventListener('input',function(){clearTimeout(t);t=setTimeout(function(){st.q=search.value.trim();st.n=step*2;draw()},250)});
  var u=new URLSearchParams(location.search).get('q');if(u){search.value=u;st.q=u;draw()}}})();

/* ---- Search page: deals.json + (when few hits) the category feeds named by /search-concepts.json ---- */
(function(){var g=$('#search-grid');if(!g)return;
 var sec=$('#deals'),feeds={};try{feeds=JSON.parse(sec.getAttribute('data-cat-feeds')||'{}')}catch(e){}
 var STOP={a:1,an:1,the:1,and:1,or:1,of:1,for:1,my:1,me:1,to:1,in:1,on:1,with:1,some:1,something:1,any:1,your:1,i:1,want:1,need:1,looking:1,find:1,cheap:1,best:1,good:1};
 var search=$('#search'),count=$('#result-count'),note=$('#search-note'),pl=$('#picks-link'),empty=$('#empty'),more=$('#searchMore'),fg=$('#s-gender'),fs=$('#s-sort'),title=$('#searchTitle'),
  st={q:'',gender:'all',sort:'featured',n:20},base=null,concept=null,loaded={},extra=[],seq=0;
 function nrm(t){return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')}
 function stem(w){return w.replace(/ies$/,'y').replace(/([^s])s$/,'$1')}
 function same(a,b){return a===b||(a.length>=5&&b.length>=5&&(a.indexOf(b)===0||b.indexOf(a)===0))}
 function words(){var w=nrm(st.q).split(/\s+/).filter(Boolean),c=w.filter(function(x){return !STOP[x]});return c.length?c:w}
 function ok(d){return d.image_url&&d.price&&d.original_price}
 function loadBase(cb){if(base)return cb();fetch('/deals.json').then(function(r){return r.json()}).then(function(j){base=(j.deals||[]).filter(ok);cb()}).catch(function(){base=[];cb()})}
 function loadConcept(cb){if(concept)return cb();fetch('/search-concepts.json').then(function(r){return r.json()}).then(function(raw){concept=Object.keys(raw).map(function(k){return {key:k,phrases:raw[k].map(function(p){return p.split(/\s+/).map(stem).filter(function(w){return !STOP[w]})}).filter(function(p){return p.length})}})}).catch(function(){concept=[]}).then(cb)}
 function conceptKeys(ws){var q=ws.map(stem),sc=[],max=0;concept.forEach(function(e){var s=0;e.phrases.forEach(function(p){if(p.every(function(w){return q.some(function(x){return same(x,w)})}))s+=p.length});if(s){sc.push([e.key,s]);if(s>max)max=s}});return sc.filter(function(x){return x[1]>=max*.5}).map(function(x){return x[0]})}
 function loadCats(keys,cb){var slugs=[];keys.forEach(function(k){var s=feeds[k.split(':')[0]];if(s&&!loaded[s]&&slugs.indexOf(s)<0)slugs.push(s)});if(!slugs.length)return cb();slugs.forEach(function(s){loaded[s]=1});
  Promise.all(slugs.map(function(s){return fetch('/deals-'+s+'.json').then(function(r){return r.json()}).catch(function(){return {deals:[]}})})).then(function(fs){var have={};base.concat(extra).forEach(function(d){have[d.id]=1});fs.forEach(function(f){(f.deals||[]).forEach(function(d){if(!have[d.id]&&ok(d)){have[d.id]=1;extra.push(d)}})});cb()})}
 function show(list,msg){var l=list;if(st.gender!=='all')l=l.filter(function(d){return d.gender===st.gender});
  if(st.sort==='discount')l=l.slice().sort(function(a,b){return b.discount_pct-a.discount_pct});if(st.sort==='price')l=l.slice().sort(function(a,b){return a.price-b.price});
  g.innerHTML=l.slice(0,st.n).map(card).join('');count.textContent='Showing '+Math.min(st.n,l.length).toLocaleString('en-US')+' of '+l.length.toLocaleString('en-US')+' deals';
  note.hidden=!msg;note.textContent=msg||'';empty.hidden=l.length>0;more.hidden=st.n>=l.length}
 function run(){var my=++seq;if(title)title.textContent=st.q?'Results for “'+st.q+'”':'Search deals';
  if(!st.q){loadBase(function(){if(my!==seq)return;show(base.slice().sort(function(a,b){return b.discount_pct-a.discount_pct}),'')});return}
  loadBase(function(){var ws=words(),pool=function(){return base.concat(extra)},hit=function(){return pool().filter(function(d){var t=nrm(d.title);return ws.every(function(w){return t.indexOf(w)>-1})})},lit=hit();
   if(lit.length>=12){show(lit,'');pickLink();return}
   loadConcept(function(){var keys=conceptKeys(ws);loadCats(keys,function(){if(my!==seq)return;var all=pool(),lit2=hit();
    var rel=all.filter(function(d){if(lit2.indexOf(d)>-1)return false;var t=nrm(d.title),s=0;ws.forEach(function(w){if(t.indexOf(stem(w))>-1)s++});
     var inCat=keys.some(function(k){var p=k.split(':');return d.category===p[0]&&(!p[1]||d.subcategory===p[1])});return inCat&&s>0||(!keys.length&&s>0)});
    var list=lit2.concat(rel);
    if(list.length)show(list,lit2.length?'Few exact matches for “'+st.q+'” — showing related deals too.':'No exact matches for “'+st.q+'” — showing related deals.');
    else show(all.slice().sort(function(a,b){return b.discount_pct-a.discount_pct}),'We don’t have anything for “'+st.q+'” yet — here are today’s best deals.');pickLink()})})})}
 var picks=null;function pickLink(){var ws=words();(picks?Promise.resolve(picks):fetch('/picks-search.json').then(function(r){return r.json()}).catch(function(){return []})).then(function(l){picks=l;
  var n=l.filter(function(t){var x=nrm(t);return ws.every(function(w){return x.indexOf(w)>-1})}).length;pl.hidden=!n;if(n)pl.innerHTML="<a href='/amazon-picks.html?q="+encodeURIComponent(ws.join(' '))+"'>"+n+' Amazon Pick'+(n===1?'':'s')+' match “'+esc(ws.join(' '))+'” →</a>'})}
 function set(q){st.q=q.trim();st.n=20;if(history.replaceState)history.replaceState(null,'','/search.html'+(st.q?'?q='+encodeURIComponent(st.q):''));run()}
 var t;if(search)search.addEventListener('input',function(){clearTimeout(t);t=setTimeout(function(){set(search.value)},250)});
 fg.addEventListener('change',function(){st.gender=fg.value;st.n=20;run()});fs.addEventListener('change',function(){st.sort=fs.value;st.n=20;run()});
 more.addEventListener('click',function(){st.n+=20;run()});
 var u=new URLSearchParams(location.search).get('q')||'';if(search)search.value=u;st.q=u.trim();run()})();

/* mobile menu button: toggles #navLinks.open (same ids/classes as interaction.js, which handles it on wrapped pages) */
(function(){var b=$('#navBtn'),n=$('#navLinks');if(!b||!n)return;
 function close(){n.classList.remove('open');b.setAttribute('aria-expanded','false')}
 b.addEventListener('click',function(e){e.stopPropagation();var o=n.classList.toggle('open');b.setAttribute('aria-expanded',String(o))});
 document.addEventListener('click',function(e){if(!n.contains(e.target))close()});
 document.addEventListener('keydown',function(e){if(e.key==='Escape')close()})})();

/* ---- stories: topic chips + carousel ---- */
(function(){var j=$('.journal');if(!j)return;var t=$('.stories',j),btns=$$('[data-jtopic]',j),cards=$$('.story',t),prev=$('.j-prev',j),next=$('.j-next',j);
 function step(){var c=cards.filter(function(x){return !x.hidden})[0];return c?c.getBoundingClientRect().width+14:300}
 function upd(){prev.disabled=t.scrollLeft<4;next.disabled=t.scrollLeft+t.clientWidth>=t.scrollWidth-4}
 prev.onclick=function(){t.scrollBy({left:-step()})};next.onclick=function(){t.scrollBy({left:step()})};t.addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);
 btns.forEach(function(b){b.addEventListener('click',function(){var c=b.getAttribute('data-jtopic');cards.forEach(function(x){x.hidden=!(c==='all'||x.getAttribute('data-topic')===c)});setOn(btns,b);t.scrollTo({left:0,behavior:'auto'});upd()})});upd()})();
/* ---- WEB 1 stories carousel ---- */
(function(){var w=$('.wb1');if(!w)return;var t=$('.story-cards',w),p=$('.story-prev',w),n=$('.story-next',w);if(!t||!p||!n)return;
 function upd(){p.disabled=t.scrollLeft<=2;n.disabled=t.scrollLeft+t.clientWidth>=t.scrollWidth-2}
 var tb=$$('[data-jtopic]',w),sc=$$('.story-card',t),ge=$('.j-empty',w);
 tb.forEach(function(b){b.addEventListener('click',function(){var c=b.getAttribute('data-jtopic'),k=0;sc.forEach(function(x){var m=c==='all'||x.getAttribute('data-topic')===c;x.hidden=!m;if(m)k++});setOn(tb,b);ge.hidden=k>0;t.scrollTo({left:0,behavior:'auto'});upd()})});
 p.addEventListener('click',function(){t.scrollBy({left:-(t.clientWidth+18)});setTimeout(upd,600)});n.addEventListener('click',function(){t.scrollBy({left:t.clientWidth+18});setTimeout(upd,600)});
 t.addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);upd()})();
})();
