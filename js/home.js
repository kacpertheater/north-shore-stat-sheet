(function(){
  /* date */
  const d=new Date();
  const ws=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const ms=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  document.getElementById('ns-date').textContent=`${ws[d.getDay()]} · ${ms[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;


  /* nav functions */
  const BMAP={
    'baseball-trends':'nsbtn-baseball','baseball':'nsbtn-baseball',
    'mlb-standings':'nsbtn-baseball','sluggers':'nsbtn-baseball',
    'basketball-trends':'nsbtn-basketball','hoopers':'nsbtn-basketball',
    'nba-standings':'nsbtn-basketball',
    'worldcup':'nsbtn-worldcup','archive':'nsbtn-archive'
  };
  function nsResetBtns(){
    document.querySelectorAll('.ns-btn').forEach(b=>b.classList.remove('ns-active'));
  }
  function nsHighlight(tab){
    const btn=document.getElementById(BMAP[tab]);
    if(btn) btn.classList.add('ns-active');
  }
  window.nsGo=function(tab){
    nsResetBtns();
    nsHighlight(tab);
    localStorage.setItem('nsss-sport',tab);
    setTimeout(()=>{
      nsDismiss();
      if(window.dataLoaded){
        const tabs=document.querySelectorAll('.tab');
        tabs.forEach(t=>{if(t.getAttribute('onclick')?.includes("'"+tab+"'"))t.click();});
      } else {
        window._nsTarget=tab;
      }
    },150);
  };

  window.nsDismiss=function(){
    const el=document.getElementById('ns-home');
    el.classList.add('out');
    setTimeout(()=>el.classList.add('gone'),520);
  };

  window.nsShow=function(){
    nsResetBtns();
    const cur=localStorage.getItem('nsss-sport');
    if(cur) nsHighlight(cur);
    const el=document.getElementById('ns-home');
    el.classList.remove('gone');
    requestAnimationFrame(()=>el.classList.remove('out'));
    nsLoadScores();
  };

  /* scores */
  function nsLoadScores(){
    const wrap=document.getElementById('ns-scores');
    if(!wrap) return;
    const today=new Date().toISOString().slice(0,10);
    function fmt(s){return new Date(s).toLocaleDateString('en-US',{month:'short',day:'numeric'});}
    function fmtT(s){return new Date(s).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});}
    function sub(d,n){const x=new Date(d);x.setDate(x.getDate()-n);return x.toISOString().slice(0,10);}
    function add(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x.toISOString().slice(0,10);}

    const items=[];

    const apiFn = typeof apiFetch==='function' ? apiFetch
      : async(url)=>{
          const proxies=[u=>u,
            u=>`https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`];
          for(const p of proxies){
            try{const r=await fetch(p(url),{signal:AbortSignal.timeout(7000)});if(r.ok)return r.json();}catch(e){}
          }
          return null;
        };

    Promise.all([
      apiFn(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=111&startDate=${sub(today,7)}&endDate=${add(today,14)}&gameType=R&hydrate=team,linescore`).catch(()=>null),
      apiFn(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${selectedNbaTeamId}/schedule?season=2026`).catch(()=>null),
    ]).then(([mlb,nba])=>{
      /* MLB */
      if(mlb){
        const all=(mlb.dates||[]).flatMap(d=>d.games||[]);
        const fin=all.filter(g=>g.status?.abstractGameState==='Final');
        const liv=all.filter(g=>g.status?.abstractGameState==='Live');
        const pre=all.filter(g=>g.status?.abstractGameState==='Preview'&&g.gameDate>new Date().toISOString());
        const last=fin[fin.length-1];
        if(last){
          const away=last.teams?.away,home=last.teams?.home;
          const bh=home?.team?.id===111;
          const bs=bh?home?.score:away?.score,os=bh?away?.score:home?.score;
          const oa=bh?away?.team?.abbreviation:home?.team?.abbreviation;
          const w=bs>os;
          items.push({tag:'MLB · Last',live:false,target:'mlb-standings',
            matchup:`<span class="${w?'w':''}">BOS ${bs}</span> vs <span class="${!w?'w':''}"> ${oa} ${os}</span>`,
            detail:`${w?'W':'L'} · ${fmt(last.gameDate)}`});
        }
        for(const g of liv){
          const away=g.teams?.away,home=g.teams?.home;
          const bh=home?.team?.id===111;
          const bs=bh?home?.score??0:away?.score??0,os=bh?away?.score??0:home?.score??0;
          const oa=bh?away?.team?.abbreviation:home?.team?.abbreviation;
          const inn=g.linescore?.currentInning?(g.linescore.inningHalf==='Top'?'▲':'▼')+g.linescore.currentInning:'';
          items.push({tag:'MLB · Live',live:true,target:'baseball-trends',
            matchup:`<span class="${bs>os?'w':''}">BOS ${bs}</span> <span>${oa} ${os}</span>`,
            detail:inn||'In progress'});
        }
        if(!liv.length&&pre.length){
          const g=pre[0];
          const away=g.teams?.away,home=g.teams?.home;
          const bh=home?.team?.id===111;
          const oa=bh?away?.team?.abbreviation:home?.team?.abbreviation;
          items.push({tag:'MLB · Next',live:false,target:'baseball-trends',
            matchup:`<span>BOS ${bh?'vs':'@'} ${oa}</span>`,
            detail:`${fmt(g.gameDate)} ${fmtT(g.gameDate)}`});
        }
      }
      /* NBA */
      if(nba){
        const all=nba.events||[];
        const fin=all.filter(e=>e.competitions?.[0]?.status?.type?.completed);
        const liv=all.filter(e=>e.competitions?.[0]?.status?.type?.state==='in');
        const pre=all.filter(e=>e.competitions?.[0]?.status?.type?.state==='pre'&&e.date>new Date().toISOString());
        function cel(ev){
          const t=ev.competitions?.[0]?.competitors||[];
          const b=t.find(x=>x.team?.abbreviation==='BOS');
          const o=t.find(x=>x.team?.abbreviation!=='BOS');
          // score can be a string "105" or object {value:105,displayValue:"105"}
          const sc = x => {
            const s = x?.score;
            if (!s) return 0;
            if (typeof s === 'object') return parseInt(s.value||s.displayValue||0);
            return parseInt(s)||0;
          };
          return{b,o,comp:ev.competitions?.[0],bs:sc(b),os:sc(o)};
        }
        const lastNba=fin[fin.length-1];
        if(lastNba){
          const{b,o,bs,os}=cel(lastNba);
          const w=bs>os;
          items.push({tag:'NBA · Last',live:false,target:'basketball-trends',
            matchup:`<span class="${w?'w':''}">BOS ${bs}</span> vs <span class="${!w?'w':''}"> ${o?.team?.abbreviation||'?'} ${os}</span>`,
            detail:`${w?'W':'L'} · ${fmt(lastNba.date)}`});
        }
        for(const ev of liv){
          const{b,o,comp,bs,os}=cel(ev);
          const q=comp?.status?.period?`Q${comp.status.period} ${comp.status.displayClock||''}`.trim():'Live';
          items.push({tag:'NBA · Live',live:true,target:'basketball-trends',
            matchup:`<span class="${bs>os?'w':''}">BOS ${bs}</span> <span>${o?.team?.abbreviation||'?'} ${os}</span>`,
            detail:q});
        }
        if(!liv.length&&pre.length){
          const{b,o}=cel(pre[0]);
          items.push({tag:'NBA · Next',live:false,target:'basketball-trends',
            matchup:`<span>BOS vs ${o?.team?.abbreviation||'?'}</span>`,
            detail:fmtT(pre[0].date)});
        }
      }

      if(!items.length){wrap.innerHTML='<span class="ns-score-loading">No games found</span>';return;}
      wrap.innerHTML=items.map((it,i)=>`
        ${i>0?'<div class="ns-score-sep"></div>':''}
        <div class="ns-score-item" onclick="nsGo('${it.target}')">
          <div class="ns-score-tag">${it.live?'<span class="ns-pip"></span>':''}${it.tag}</div>
          <div class="ns-score-matchup">${it.matchup}</div>
          <div class="ns-score-detail">${it.detail}</div>
        </div>`).join('');
    });
  }

  setTimeout(nsLoadScores,300);
})();
