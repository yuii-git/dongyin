function DongHuaApp() {
  return {
    pageTitle: 'DongHua — Nonton Sub Indo',
    baseUrl: 'https://anichin.moe',
    page: 'home',
    prevPage: '',
    loading: true,
    loadProgress: 0,
    sliderIndex: 0,
    epSort: 'desc',
    apiUrl: 'https://vercel-api-beta-red.vercel.app/api/scraper-web',
    uboyApi: 'https://uboy-api.vercel.app',
    activeUrl: '',
    showSearch: false,
    searchQuery: '',
    suggestions: [],
    showSuggestions: false,
    activeServer: '',
    currentPage: 1,
    hasNextPage: false,
    selectedRecTab: '',
    homeData: { featuredSlider:[], popularToday:[], latestReleases:[], ongoingSidebar:[], recommendations:{genres:[],items:[]} },
    animeDetail: { metadata:{}, genres:[], episodeList:[] },
    streamData: { navigation:{} },
    scheduleData: [],
    allGenres: [
      {name:'Action',slug:'action'},{name:'Adventure',slug:'adventure'},{name:'Comedy',slug:'comedy'},
      {name:'Cultivation',slug:'cultivation'},{name:'Drama',slug:'drama'},{name:'Fantasy',slug:'fantasy'},
      {name:'Historical',slug:'historical'},{name:'Isekai',slug:'isekai'},{name:'Martial Arts',slug:'martial-arts'},
      {name:'Mystery',slug:'mystery'},{name:'Psychological',slug:'psychological'},{name:'Reincarnation',slug:'reincarnation'},
      {name:'Romance',slug:'romance'},{name:'Sci-fi',slug:'sci-fi'},{name:'Supernatural',slug:'supernatural'},
      {name:'Urban Fantasy',slug:'urban-fantasy'}
    ],
    listData: [],
    showComments: false,
    commentsLoading: false,
    commentsList: [],
    commentName: '',
    tempName: '',
    newCommentText: '',
    replyTo: null,
    preferredServerHost: '',
    searchTitle: '',
    adBlocker: false,
    showInfoModal: false,
    showSchedulePanel: false,
    selectedScheduleDay: 'all',
    watchHistory: [],
    trashHistory: [],
    confirmModal: { show:false, title:'', subtitle:'', message:'', confirmText:'Hapus', danger:true, action:()=>{} },
    importToast: { show:false, ok:true, msg:'' },
    navLinks: [
      { view:'home',   label:'Beranda', icon:'fas fa-home',       match:['home'],           mobile:true },
      { view:'genres', label:'Genre',   icon:'fas fa-layer-group', match:['genres','results'], mobile:true },
      { view:'history',label:'History', icon:'fas fa-history',    match:['history','trash'], mobile:true }
    ],

    isActive(m){ return m.includes(this.page) },
    nextSlide(){ if(!this.homeData.featuredSlider)return; this.sliderIndex=(this.sliderIndex+1)%this.homeData.featuredSlider.length },
    prevSlide(){ if(!this.homeData.featuredSlider)return; this.sliderIndex=(this.sliderIndex-1+this.homeData.featuredSlider.length)%this.homeData.featuredSlider.length },
    translateDay(d){ return {Monday:'Senin',Tuesday:'Selasa',Wednesday:'Rabu',Thursday:'Kamis',Friday:'Jumat',Saturday:'Sabtu',Sunday:'Minggu'}[d]||d },
    cleanTitle(t){ return t?t.split(/\t+/)[0].trim().replace(/^Nonton\s+/i,'').replace(/\s+Subtitle\s+Indonesia.*$/i,'').replace(/\s+(?:Episode|Ep|Eps|E)\.?\s?\d+.*$/i,'').replace(/\s+-\s+\d+.*$/i,'').trim():'' },
    formatDate(iso,type='full'){ if(!iso)return'-'; const d=new Date(iso),diff=(Date.now()-d)/60000; if(type==='time')return d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}); if(type==='short'){ if(diff<1)return'Baru saja'; if(diff<60)return`${Math.floor(diff)} mnt lalu`; if(diff<1440)return`${Math.floor(diff/60)} jam lalu`; return d.toLocaleDateString('id-ID',{day:'2-digit',month:'short'}); } return d.toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'}) },
    go(view,param){ if(this.loading)return; if(view==='schedule'){this.showSchedulePanel=true;if(!this.scheduleData.length)this.fetchSchedule();return;} let h=`#/${view}`; if(param)h+=`/${encodeURIComponent(param)}`; window.location.hash=h },
    changePage(n){ if(this.loading)return; const p=window.location.hash.slice(2).split('/'); window.location.hash=`#/${p[0]||'results'}/${p[1]||''}/${n}` },
    async fetchSuggestions(){ if(this.searchQuery.length<2){this.suggestions=[];this.showSuggestions=false;return;} try{ const d=await fetch(`${this.uboyApi}/api/search/suggest?q=${encodeURIComponent(this.searchQuery)}`).then(r=>r.json()); if(d.success){this.suggestions=d.result;this.showSuggestions=true;} }catch(e){} },
    startSearch(){ if(this.searchQuery.length<2)return; const q=this.searchQuery; this.searchQuery='';this.suggestions=[];this.showSuggestions=false; this.go('search',q) },
    async openComments(){ this.showComments=true; this.loadComments() },
    async loadComments(){ if(!this.streamData.title)return; this.commentsLoading=true; const id=btoa(encodeURIComponent(this.cleanTitle(this.streamData.title)).replace(/%([0-9A-F]{2})/g,(m,p)=>String.fromCharCode('0x'+p))).replace(/=/g,''); try{ const res=await fetch(`https://u-tools-default-rtdb.firebaseio.com/tv_comments/${id}.json`); const data=await res.json(); this.commentsList=data?Object.keys(data).map(k=>({id:k,...data[k]})).sort((a,b)=>b.timestamp-a.timestamp):[]; }catch(e){} this.commentsLoading=false },
    async postComment(){ const name=this.commentName||this.tempName.trim(); if(!name||!this.newCommentText.trim())return; if(!this.commentName){this.commentName=name;localStorage.setItem('dH_username',name);} const id=btoa(encodeURIComponent(this.cleanTitle(this.streamData.title)).replace(/%([0-9A-F]{2})/g,(m,p)=>String.fromCharCode('0x'+p))).replace(/=/g,''); const payload={name,text:this.newCommentText.trim(),timestamp:Date.now(),replyTo:this.replyTo?this.replyTo.id:null}; try{ await fetch(`https://u-tools-default-rtdb.firebaseio.com/tv_comments/${id}.json`,{method:'POST',body:JSON.stringify(payload)}); this.newCommentText='';this.replyTo=null;this.loadComments(); }catch(e){this._toast(false,'Gagal mengirim komentar');} },
    _save(){ localStorage.setItem('dH_history',JSON.stringify(this.watchHistory)); localStorage.setItem('dH_trash',JSON.stringify(this.trashHistory)) },
    _purgTrash(){ const limit=3*24*60*60*1000; this.trashHistory=this.trashHistory.filter(i=>i.deletedAt&&(Date.now()-new Date(i.deletedAt).getTime())<limit); localStorage.setItem('dH_trash',JSON.stringify(this.trashHistory)) },
    saveHistory(){ const s=this.streamData; if(!s||!s.title)return; let seriesTitle=this.cleanTitle(s.series); if(!seriesTitle||seriesTitle.length<3)seriesTitle=this.cleanTitle(s.title); const urlParam=this.activeUrl; let epNum=''; const epMatch=urlParam.match(/(?:episode|eps)-(\d+)/i)||s.title.match(/(?:Episode|Ep)\s*(\d+)/i); if(epMatch)epNum='Ep. '+epMatch[1]; const idx=this.watchHistory.findIndex(h=>h.seriesTitle===seriesTitle); if(idx!==-1)this.watchHistory.splice(idx,1); let slug=urlParam; try{const u=new URL(urlParam);slug=u.pathname+u.search;}catch(e){slug=urlParam.replace(this.baseUrl,'');} this.watchHistory.unshift({seriesTitle,episode:s.title||'',epNum,watchedAt:new Date().toISOString(),slug,url:urlParam}); if(this.watchHistory.length>20)this.watchHistory.length=20; this._save() },
    _confirm(opts){ this.confirmModal={show:true,...opts} },
    confirmRemoveHistory(i){ this._confirm({danger:true,title:'Hapus Riwayat?',subtitle:this.watchHistory[i].seriesTitle,message:'History ini akan dipindahkan ke Tong Sampah dan bisa dikembalikan dalam 3 hari.',confirmText:'Pindah ke Sampah',action:()=>this.removeHistory(i)}) },
    confirmClearHistory(){ this._confirm({danger:true,title:'Hapus Semua Riwayat?',subtitle:`${this.watchHistory.length} riwayat akan dihapus`,message:'Semua history akan dipindahkan ke Tong Sampah selama 3 hari.',confirmText:'Hapus Semua',action:()=>this.clearHistory()}) },
    confirmEmptyTrash(){ this._confirm({danger:true,title:'Kosongkan Tong Sampah?',subtitle:`${this.trashHistory.length} item dihapus permanen`,message:'Tindakan ini tidak bisa dibatalkan.',confirmText:'Hapus Permanen',action:()=>this.emptyTrash()}) },
    confirmDeletePermanent(i){ this._confirm({danger:true,title:'Hapus Permanen?',subtitle:this.trashHistory[i].seriesTitle,message:'History ini akan dihapus selamanya dan tidak bisa dikembalikan.',confirmText:'Hapus Permanen',action:()=>{this.trashHistory.splice(i,1);this._save();}}) },
    removeHistory(i){ const[r]=this.watchHistory.splice(i,1); r.deletedAt=new Date().toISOString(); this.trashHistory.unshift(r); this._save() },
    clearHistory(){ const now=new Date().toISOString(); this.trashHistory.unshift(...this.watchHistory.map(h=>({...h,deletedAt:now}))); this.watchHistory=[]; this._save() },
    restoreFromTrash(i){ const item={...this.trashHistory[i]};delete item.deletedAt; this.trashHistory.splice(i,1); const dup=this.watchHistory.findIndex(h=>h.seriesTitle===item.seriesTitle); if(dup!==-1)this.watchHistory.splice(dup,1); this.watchHistory.unshift(item); if(this.watchHistory.length>20)this.watchHistory.length=20; this._save() },
    restoreAllTrash(){ this.trashHistory.forEach(item=>{const c={...item};delete c.deletedAt;const d=this.watchHistory.findIndex(h=>h.seriesTitle===c.seriesTitle);if(d!==-1)this.watchHistory.splice(d,1);this.watchHistory.unshift(c);}); if(this.watchHistory.length>20)this.watchHistory.length=20; this.trashHistory=[]; this._save() },
    emptyTrash(){ this.trashHistory=[]; this._save() },
    exportHistory(){ const blob=new Blob([JSON.stringify({exported:new Date().toISOString(),version:1,history:this.watchHistory},null,2)],{type:'application/json'}); const a=Object.assign(document.createElement('a'),{href:URL.createObjectURL(blob),download:`donghua-history-${new Date().toISOString().slice(0,10)}.json`}); document.body.appendChild(a);a.click();document.body.removeChild(a);setTimeout(()=>URL.revokeObjectURL(a.href),1000) },
    importHistory(event){ const file=event.target.files[0]; if(!file)return; const r=new FileReader(); r.onload=e=>{ try{ const parsed=JSON.parse(e.target.result),items=parsed.history||(Array.isArray(parsed)?parsed:null); if(!items)throw new Error(); let added=0; items.forEach(item=>{if(!item.seriesTitle)return;const d=this.watchHistory.findIndex(h=>h.seriesTitle===item.seriesTitle);if(d!==-1)this.watchHistory.splice(d,1);this.watchHistory.push(item);added++;}); this.watchHistory.sort((a,b)=>new Date(b.watchedAt)-new Date(a.watchedAt)); if(this.watchHistory.length>20)this.watchHistory.length=20; this._save();this._toast(true,`${added} riwayat berhasil diimpor!`); }catch(e){this._toast(false,'File tidak valid atau rusak.');} event.target.value=''; }; r.readAsText(file) },
    _toast(ok,msg){ this.importToast={show:true,ok,msg}; setTimeout(()=>this.importToast.show=false,3000) },
    async loadPage(view,param,pageNum=1){
      window.scrollTo(0,0);
      if((view==='stream'||view==='detail')&&param) view=param.includes('episode')?'stream':'detail';
      this.loading=true; this.loadProgress=0;
      const prog=setInterval(()=>{if(this.loadProgress<90)this.loadProgress+=Math.floor(Math.random()*8)+2;},80);
      this.prevPage=this.page; this.page=view; this.activeUrl=param||''; this.currentPage=pageNum;
      this.activeServer=''; this.streamData={navigation:{}}; this.animeDetail={metadata:{},genres:[],episodeList:[]};
      try{
        if(view==='home')await this.fetchHome();
        else if(view==='detail')await this.fetchDetail(param);
        else if(view==='stream')await this.fetchStream(param);
        else if(view==='genres')await this.fetchGenres();
        else if(view==='history')this.page='history';
        else if(view==='genre'){this.page='results';await this.fetchByGenre(param,pageNum);}
        else if(view==='search'){this.page='results';await this.fetchSearch(param,pageNum);}
        else if(view==='trash'){this.page='trash';this._purgTrash();}
      }catch(e){}
      this.loadProgress=100; clearInterval(prog);
      setTimeout(()=>{this.loading=false;},180);
    },
    handleHash(){
      const hash=window.location.hash.slice(2);
      if(!hash||hash===''){this.loadPage('home');return;}
      const parts=hash.split('/'); const view=parts[0]; const param=parts[1]?decodeURIComponent(parts[1]):''; const pageNum=parts[2]?parseInt(parts[2]):1;
      this.loadPage(view,param,pageNum);
    },
    async init(){
      this.watchHistory=JSON.parse(localStorage.getItem('dH_history')||'[]');
      this.trashHistory=JSON.parse(localStorage.getItem('dH_trash')||'[]');
      this.preferredServerHost=localStorage.getItem('dH_preferredServer')||'';
      this.commentName=localStorage.getItem('dH_username')||'';
      this.adBlocker=localStorage.getItem('dH_adBlocker')==='true';
      this._purgTrash();
      window.addEventListener('hashchange',()=>this.handleHash());
      await this.handleHash();
      this.fetchGenres();
      setTimeout(()=>{const s=document.getElementById('splash');if(s){s.classList.add('fade');setTimeout(()=>s.remove(),500);}},900);
      setInterval(()=>{if(this.page==='home'&&this.homeData.featuredSlider&&this.homeData.featuredSlider.length>1)this.nextSlide();},6000);

      // DETEKSI ROTASI HP (OTOMATIS FULLSCREEN / KELUAR)
      window.addEventListener('orientationchange', () => {
        // Pastikan user sedang berada di halaman streaming video
        if (this.page !== 'stream' || !this.activeServer) return;

        setTimeout(() => {
          const angle = window.orientation;
          if (angle === 90 || angle === -90) {
            // HP Dimiringkan -> Masuk Fullscreen
            this.toggleFullscreen(true);
          } else if (angle === 0 || angle === 180) {
            // HP Diluruskan -> Keluar Fullscreen
            this.toggleFullscreen(false);
          }
        }, 300);
      });
    },
    async fetchHome(){
      const cache=JSON.parse(localStorage.getItem('dH_home_cache')||'null');
      if(cache&&(Date.now()-cache.timestamp<1800000)){this.homeData=cache.data;return;}
      try{
        const donghua=await fetch(this.apiUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:this.baseUrl+'/',output:JSON.stringify({
          featuredSlider:"$('#slidertwo .swiper-slide.item').map((i, el) => ({ title: $(el).find('h2 a').text().trim(), thumbnail: $(el).find('.backdrop').attr('style')?.match(/url\\(['\"]?(.*?)['\"]?\\)/)?.[1] || $(el).find('img').attr('src'), url: $(el).find('h2 a').attr('href'), description: $(el).find('.info p').text().trim() })).get()",
          popularToday:"$('.popularslider article.bs').map((i, el) => ({ title: $(el).find('.tt h2').text().trim(), thumbnail: $(el).find('img').attr('src'), url: $(el).find('a').attr('href'), episode: $(el).find('.epx').text().trim() })).get()",
          latestReleases:"$('.listupd.normal article.bs').map((i, el) => ({ title: $(el).find('.tt h2').text().trim(), thumbnail: $(el).find('img').attr('src'), url: $(el).find('a').attr('href'), episode: $(el).find('.epx').text().trim() })).get()",
          ongoingSidebar:"$('.ongoingseries ul li').map((i, el) => ({ title: $(el).find('.l').text().trim(), url: $(el).find('a').attr('href'), episode: $(el).find('.r').text().trim() })).get()",
          recGenres:"$('.series-gen .nav-tabs li a').map((i, e) => ({ id: $(e).attr('href').replace('#',''), name: $(e).text().trim() })).get()",
          recItems:"$('.series-gen .tab-pane').map((i, e) => ({ id: $(e).attr('id'), list: $(e).find('article.bs').map((j, art) => ({ title: $(art).find('.tt h2').text().trim(), thumbnail: $(art).find('img').attr('src'), url: $(art).find('a').attr('href'), episode: $(art).find('.epx').text().trim() })).get() })).get()"
        })})}).then(r=>r.json());
        if(donghua){
          donghua.featuredSlider=(donghua.featuredSlider||[]).map((s,i)=>({...s,color:['#c9a84c','#8b4513','#1a5276','#196f3d','#6e2f8c'][i%5]}));
          donghua.animePopular=[];
          donghua.recommendations={genres:donghua.recGenres||[],items:donghua.recItems||[]};
          if(donghua.recommendations.genres.length>0&&!this.selectedRecTab)this.selectedRecTab=donghua.recommendations.genres[0].id;
          this.homeData=donghua;
          localStorage.setItem('dH_home_cache',JSON.stringify({timestamp:Date.now(),data:donghua}));
        }
      }catch(e){}
    },
    async fetchGenres(){
      try{
        const res=await fetch(this.apiUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:this.baseUrl+'/anime/',output:JSON.stringify({genres:"$('.filter.genred .genx li').map((i, el) => ({ name: $(el).find('label').text().trim(), slug: $(el).find('input').val() })).get()"})})});
        const d=await res.json(); if(d&&d.genres&&d.genres.length>0)this.allGenres=d.genres.map(g=>({name:g.name,slug:g.slug||g.name.toLowerCase().replace(/\s+/g,'-')}));
      }catch(e){}
    },
    async fetchByGenre(slug,page){
      this.searchTitle=`Genre: ${slug.replace(/-/g,' ')}`;
      const url=`${this.baseUrl.replace(/\/+$/,'')}/anime/?page=${page}&genre[0]=${slug}&status=&type=&sub=&order=update`;
      try{
        const res=await fetch(this.apiUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url,output:JSON.stringify({data:"$('.listupd article.bs').map((i, el) => ({ title: $(el).find('.tt h2').text().trim(), thumbnail: $(el).find('img').attr('src'), url: $(el).find('a').attr('href'), type: $(el).find('.typez').text().trim(), status: $(el).find('.status').text().trim(), episode: $(el).find('.epx').text().trim() })).get()",hasNextPage:"$('.pagination a.next').length > 0"})})}).then(r=>r.json());
        this.listData=res.data||[]; this.hasNextPage=res.hasNextPage||false;
      }catch(e){}
    },
    async fetchSearch(q,page){
      this.searchTitle=`Hasil: "${q}"`;
      const base=this.baseUrl.replace(/\/+$/,'');
      const url=page>1?`${base}/page/${page}/?s=${encodeURIComponent(q)}`:`${base}/?s=${encodeURIComponent(q)}`;
      try{
        const res=await fetch(this.apiUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url,output:JSON.stringify({data:"$('.listupd article.bs').map((i, el) => ({ title: $(el).find('.tt h2').text().trim(), thumbnail: $(el).find('img').attr('src'), url: $(el).find('a').attr('href'), type: $(el).find('.typez').text().trim(), status: $(el).find('.status').text().trim(), episode: $(el).find('.bt .epx').text().trim() })).get()",hasNextPage:"$('.pagination a.next').length > 0"})})}).then(r=>r.json());
        this.listData=res.data||[]; this.hasNextPage=res.hasNextPage||false;
      }catch(e){}
    },
    async fetchDetail(url){
      if(!url){this.go('home');return;}
      let rawUrl=decodeURIComponent(url);
      if(!rawUrl.startsWith('http'))rawUrl=this.baseUrl.replace(/\/$/,'')+(rawUrl.startsWith('/')?'':'/')+rawUrl;
      try{
        const res=await fetch(this.apiUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:rawUrl,output:JSON.stringify({
          title:"$('.entry-title').text().trim()",
          thumbnail:"$('.thumb img').attr('src')",
          rating:"$('.rating strong').text().replace('Rating','').trim()",
          status:"$('.spe span:contains(\"Status\")').text().split(':')[1]?.trim()",
          studio:"$('.spe span:contains(\"Studio\")').text().split(':')[1]?.trim()",
          updated_on:"$('.spe span:contains(\"Updated on\")').text().split(':')[1]?.trim()",
          type:"$('.spe span:contains(\"Type\")').text().split(':')[1]?.trim()",
          genres:"$('.genxed a').map((i, el) => $(el).text().trim()).get()",
          synopsis:"$('.entry-content p').first().text().trim()",
          episodeList:"$('.eplister ul li a').map((i, el) => ({ title: $(el).find('.epl-title').text().trim(), episode: $(el).find('.epl-num').text().trim(), url: $(el).attr('href') })).get()"
        })})});
        const d=await res.json();
        if(d&&d.title)this.animeDetail={...d,metadata:{status:d.status,studio:d.studio,updated_on:d.updated_on,type:d.type},episodeList:(d.episodeList||[]).reverse()};
      }catch(e){this._toast(false,'Gagal memuat detail.')}
    },
    async fetchStream(url){
      let rawUrl=decodeURIComponent(url);
      if(!rawUrl.startsWith('http'))rawUrl=this.baseUrl.replace(/\/$/,'')+(rawUrl.startsWith('/')?'':'/')+rawUrl;
      try{
        const res=await fetch(this.apiUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:rawUrl,output:JSON.stringify({
          title:"$('.entry-title').text().trim()",
          series:"$('.ts-breadcrumb span:nth-child(2) a span').text().trim()||$('.ts-breadcrumb li:nth-child(2) a span').text().trim()",
          series_url:"$('.ts-breadcrumb span:nth-child(2) a').attr('href')||$('.ts-breadcrumb li:nth-child(2) a').attr('href')",
          streamingLinks:"$('.mirror option').map((i,el)=>({server:$(el).text().trim(),link:$(el).val()})).get().filter(x=>x.link&&x.link!=='')",
          defaultIframe:"$('#pembed iframe').attr('src')",
          downloadLinks:"$('.soraddlx.soradlg .soraurlx').map((i,el)=>({quality:$(el).find('strong').text().trim(),links:$(el).find('a').map((j,a)=>({host:$(a).text().trim(),link:$(a).attr('href')})).get()})).get()",
          prevEpisode:"$('.naveps .nvs a[rel=\"prev\"]').attr('href')",
          allEpisodes:"$('.naveps .nvsc a').attr('href')",
          nextEpisode:"$('.naveps .nvs a[rel=\"next\"]').attr('href')"
        })})});
        const d=await res.json();
        if(d){
          let links=d.streamingLinks||[];
          links=links.map(l=>{const s=(l.server||'').toLowerCase();if((l.link||'').includes('ok.ru')||s.includes('ok.ru'))return{...l,server:'TV ok.ru',isProxy:false};return l;});
          if(d.defaultIframe&&!links.some(l=>l.link===d.defaultIframe))links.unshift({server:'Default',link:d.defaultIframe});
          this.streamData={...d,streamingLinks:links,navigation:{prevEpisode:d.prevEpisode,allEpisodes:d.allEpisodes,nextEpisode:d.nextEpisode}};
          const pref=links.findIndex(s=>s.server===this.preferredServerHost);
          const start=pref!==-1?links[pref]:(links[0]||null);
          if(start)this.changeServer(start.link||start,start.server,start.isProxy||false);
          this.saveHistory();
        }
      }catch(e){}
    },
    async fetchSchedule(force=false){
      const cache=JSON.parse(localStorage.getItem('dH_schedule_cache')||'null');
      if(!force&&cache&&cache.data){this.scheduleData=cache.data;return;}
      const wasLoading=this.loading; if(force)this.loading=true;
      try{
        const res=await fetch(this.apiUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:this.baseUrl+'/schedule/',output:JSON.stringify({schedule:"$('.bixbox.schedulepage').map((i,el)=>({day:$(el).find('.releases h3 span').text().trim(),list:$(el).find('.listupd .bs').map((j,item)=>({title:$(item).find('.tt').text().trim(),url:$(item).find('.bsx a').attr('href'),thumbnail:$(item).find('.limit img').attr('src'),releaseTime:$(item).find('.bt .epx').text().trim(),nextEpisode:$(item).find('.bt .sb.Sub').text().trim()})).get()})).get()"})})}).then(r=>r.json()).catch(()=>({}));
        const daysOrder=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
        let merged=[];
        daysOrder.forEach(day=>{
          let list=[];
          if(res?.schedule){const d=res.schedule.find(x=>x.day===day);if(d)list.push(...d.list);}
          if(list.length>0)merged.push({day,list,totalCount:list.length});
        });
        if(merged.length){this.scheduleData=merged;localStorage.setItem('dH_schedule_cache',JSON.stringify({timestamp:Date.now(),data:merged}));}
      }catch(e){this._toast(false,'Gagal memuat jadwal.')} finally{if(force)this.loading=wasLoading;}
    },
    async changeServer(link,serverName,skipConvert=false){
      this.preferredServerHost=serverName; localStorage.setItem('dH_preferredServer',serverName);
      let target=(typeof link==='string'?link:link.link)||'';
      if(target&&!target.startsWith('http')&&target.length>20){try{const dec=atob(target);if(dec.startsWith('http'))target=dec;else{const m=dec.match(/src="([^"]+)"/);if(m)target=m[1];}}catch(e){}}
      const isDirect=u=>u&&/\.(mp4|m3u8|webm)(\?.*)?$/i.test(u)||u.includes('filedon.co/d/')||u.includes('okcdn.ru')||u.includes('vkuser.net');
      this.activeServer=''; this.isDirectVideo=isDirect(target);
      try{
        if(!skipConvert&&target.includes('filedon.co')&&!this.isDirectVideo){
          if(!target.includes('/embed/'))target=target.replace('/view/','/embed/').replace('/v/','/embed/').replace('/d/','/embed/');
          try{const html=await fetch(`https://vercel-api-beta-red.vercel.app/api/fetch?get=${encodeURIComponent(target)}`).then(r=>r.text());const doc=new DOMParser().parseFromString(html,'text/html');const raw=doc.querySelector('#app')?.getAttribute('data-page');if(raw){const{props}=JSON.parse(raw);if(props?.url){target=props.url;this.isDirectVideo=true;}}}catch(e){}
        }
        if(!skipConvert&&target.includes('ok.ru')){
          try{let okUrl=target.includes('videoembed')?target:target.replace('ok.ru/video/','ok.ru/videoembed/');if(okUrl.startsWith('//'))okUrl='https:'+okUrl;const html=await fetch(`https://vercel-api-beta-red.vercel.app/api/fetch?get=${encodeURIComponent(okUrl)}`).then(r=>r.text());const doc=new DOMParser().parseFromString(html,'text/html');const okV=doc.querySelector('div[data-module="OKVideo"]');if(okV){const opts=JSON.parse(okV.getAttribute('data-options'));let meta=opts.flashvars.metadata;if(typeof meta==='string')meta=JSON.parse(meta);if(meta){const qO={full:5,hd:4,sd:3,low:2,lowest:1,mobile:0};const sorted=(meta.videos||[]).sort((a,b)=>(qO[b.name]||0)-(qO[a.name]||0));const best=sorted[0];if(best&&(best.name==='full'||best.name==='hd')){target=best.url;this.isDirectVideo=true;}else if(meta.hlsManifestUrl){target=meta.hlsManifestUrl.startsWith('//')?'https:'+meta.hlsManifestUrl:meta.hlsManifestUrl;this.isDirectVideo=true;}else if(best){target=best.url;this.isDirectVideo=true;}}}}catch(e){}
        }
        if(isDirect(target))this.activeServer=`https://vercel-api-beta-red.vercel.app/api/plyr?url=${encodeURIComponent(target)}`;
        else this.activeServer=target;

        // Otomatis Fullscreen di awal saat server berhasil dimuat (opsional, jika HP sudah dalam posisi miring)
        if(this.activeServer && (window.orientation === 90 || window.orientation === -90)) {
          setTimeout(() => { this.toggleFullscreen(true); }, 500);
        }
      }catch(e){
        this.activeServer=typeof link==='string'?link:'';
        if(this.activeServer && (window.orientation === 90 || window.orientation === -90)) {
          setTimeout(() => { this.toggleFullscreen(true); }, 500);
        }
      }
    },
    toggleFullscreen(forceOpen = null) {
      const playerEl = document.getElementById('main-player') || document.querySelector('.player-wrap');
      if (!playerEl) return;
      const isCurrentFull = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
      
      if (forceOpen === true || (!isCurrentFull && forceOpen === null)) {
        if (playerEl.requestFullscreen) { playerEl.requestFullscreen(); }
        else if (playerEl.webkitRequestFullscreen) { playerEl.webkitRequestFullscreen(); }
        else if (playerEl.msRequestFullscreen) { playerEl.msRequestFullscreen(); }
      } else if (forceOpen === false || (isCurrentFull && forceOpen === null)) {
        if (document.exitFullscreen) { document.exitFullscreen(); }
        else if (document.webkitExitFullscreen) { document.webkitExitFullscreen(); }
        else if (document.msExitFullscreen) { document.msExitFullscreen(); }
      }
    }
  }
}
