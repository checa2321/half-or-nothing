(function(){
 function carousel(t,p,n,gap,frac){if(!t||!p||!n)return;var step=function(){return frac?t.clientWidth*frac:t.clientWidth+gap};var upd=function(){p.disabled=t.scrollLeft<=2;n.disabled=t.scrollLeft+t.clientWidth>=t.scrollWidth-2};
  p.addEventListener('click',function(){t.scrollBy({left:-step()});setTimeout(upd,600)});n.addEventListener('click',function(){t.scrollBy({left:step()});setTimeout(upd,600)});t.addEventListener('scroll',upd,{passive:true});window.addEventListener('resize',upd);upd()}
 carousel(document.querySelector('.category-grid'),document.querySelector('.cat-prev'),document.querySelector('.cat-next'),10);
 carousel(document.querySelector('.story-cards'),document.querySelector('.story-prev'),document.querySelector('.story-next'),18);
 document.querySelectorAll('.chips-carousel').forEach(function(w){carousel(w.querySelector('.feed-chips'),w.querySelector('.chip-prev'),w.querySelector('.chip-next'),0,.8)});
 document.addEventListener('error',function(e){var img=e.target;if(!img||img.tagName!=='IMG'||!img.closest('.card-img,.category,.story-card-photo,.story-band-photo,.mosaic-photo'))return;img.style.display='none';var p=img.parentElement;p.style.background='#e4d6c6';p.style.position='relative';if(!p.querySelector('.missing-art')){var s=document.createElement('span');s.className='missing-art';s.textContent='HALF OR NOTHING';s.style.cssText='position:absolute;inset:0;display:grid;place-items:center;font:500 10px DM Mono,monospace;letter-spacing:.12em;color:#76695c';p.appendChild(s)}},true);
 var grid=document.getElementById('ebayGrid');if(!grid)return;
 var foot=document.getElementById('ebayCount'),more=document.getElementById('ebayMore'),box=document.getElementById('siteSearch'),data=null,st={cat:'',n:5};
 function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
 function fmt(v){return '$'+Number(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
 function tier(p){return p>=80?4:p>=70?3:p>=60?2:1}
 var LAB={"anime": "Anime", "kids": "Baby & Kids", "beauty": "Beauty & Health", "media": "Books, Music & Movies", "collectibles": "Collectibles & Art", "electronics": "Electronics & Tech", "fashion": "Fashion & Accessories", "fragrances": "Fragrances", "home": "Home & Kitchen", "jewelry": "Jewelry & Watches", "music_gear": "Musical Instruments & Gear", "office": "Office & More", "other": "Other Finds", "outdoor": "Outdoor & Sports", "pets": "Pets", "tools_auto": "Tools & Auto", "travel": "Travel & Experiences", "watches": "Watches"};
 function card(d){var pct=Math.round(d.discount_pct),lab=(d.subcategory||'').indexOf('fragrance')===0?'Fragrances':(LAB[d.category]||'Deal');
  return "<article class='card' id='"+esc(d.id)+"'><a class='card-link' href='"+esc(d.url)+"' target='_blank' rel='noopener sponsored nofollow'><div class='card-img'><img src='"+esc(d.image_url||'')+"' alt='"+esc(d.title.slice(0,90))+"' loading='lazy' decoding='async'></div><div class='card-copy'><span class='product-type'>"+esc(lab)+"</span><h3>"+esc(d.title.slice(0,80))+"</h3><div class='price'><del>"+fmt(d.original_price)+"</del>"+fmt(d.price)+"</div><span class='pill t"+tier(pct)+"'>"+pct+"% OFF</span><span class='seen'>Seen "+esc(d.seen_text||'now')+"</span></div></a></article>"}
 function match(d){if(st.cat==='fragrances')return (d.subcategory||'').indexOf('fragrance')===0;return !st.cat||d.category===st.cat}
 function list(){return data.filter(function(d){return match(d)})}
 function render(){var l=list();grid.innerHTML=l.length?l.slice(0,st.n).map(card).join(''):"<p class='feed-empty'>No deals match that search or category.</p>";foot.textContent='SHOWING '+Math.min(st.n,l.length).toLocaleString('en-US')+' OF '+l.length.toLocaleString('en-US');more.style.display=st.n>=l.length?'none':''}
 function load(cb){if(data)return cb();fetch('/deals.json').then(function(r){return r.json()}).then(function(j){data=j.deals||[];cb()}).catch(function(){})}
 document.querySelectorAll('#ebay .feed-chips a').forEach(function(a){a.addEventListener('click',function(e){if(a.getAttribute('data-cat')===null)return;e.preventDefault();document.querySelectorAll('#ebay .feed-chips a').forEach(function(x){x.classList.remove('on')});a.classList.add('on');st.cat=a.getAttribute('data-cat');st.n=5;load(render)})});
 more.addEventListener('click',function(e){e.preventDefault();st.n+=5;load(render)});
 function go(q){q=(q||'').trim();if(q)location.href='/search.html?q='+encodeURIComponent(q)}
 if(box){box.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();go(box.value)}});var f=box.closest('form');if(f)f.addEventListener('submit',function(e){e.preventDefault();go(box.value)})}
 var u=new URLSearchParams(location.search),dd=u.get('deal')||(location.hash.indexOf('#d-')===0?location.hash.slice(1):'');
 if(dd){load(function(){var d=data.filter(function(x){return x.id===dd})[0];if(d){grid.insertAdjacentHTML('afterbegin',card(d).replace("class='card'","class='card shared'"));document.getElementById('ebay').scrollIntoView()}})}
})();
