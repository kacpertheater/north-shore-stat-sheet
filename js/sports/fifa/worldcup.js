// ════════════════════════════════════════
//  WORLD CUP
// ════════════════════════════════════════
let wcYear = 2026;
let wcView = 'schedule';
let wcInitDone = false;

const WC_DATA = {
  2026: {
    title:'2026 FIFA World Cup', hosts:'USA / Mexico / Canada', dates:'Jun 11 – Jul 19, 2026', past:false,
    groups:{
      A:{teams:['Mexico 🇲🇽','South Africa 🇿🇦','South Korea 🇰🇷','UEFA PO-D'],venue:'Mexico City / Guadalajara'},
      B:{teams:['Canada 🇨🇦','Switzerland 🇨🇭','Qatar 🇶🇦','UEFA PO-A'],venue:'Toronto / Vancouver'},
      C:{teams:['Brazil 🇧🇷','Morocco 🇲🇦','Scotland 🏴󠁧󠁢󠁳󠁣󠁴󠁿','Haiti 🇭🇹'],venue:'New York / Boston / Atlanta'},
      D:{teams:['USA 🇺🇸','Paraguay 🇵🇾','Australia 🇦🇺','UEFA PO-C'],venue:'Los Angeles / Seattle',highlight:true},
      E:{teams:['Germany 🇩🇪','Curaçao 🇨🇼','Ivory Coast 🇨🇮','Ecuador 🇪🇨'],venue:'Houston / Toronto / Philadelphia',highlight:true},
      F:{teams:['Netherlands 🇳🇱','Japan 🇯🇵','Tunisia 🇹🇳','UEFA PO-B'],venue:'Dallas / Houston / Monterrey'},
      G:{teams:['Belgium 🇧🇪','Egypt 🇪🇬','Iran 🇮🇷','New Zealand 🇳🇿'],venue:'Los Angeles / Seattle / Vancouver'},
      H:{teams:['Spain 🇪🇸','Cape Verde 🇨🇻','Saudi Arabia 🇸🇦','Uruguay 🇺🇾'],venue:'Atlanta / Miami'},
      I:{teams:['France 🇫🇷','Senegal 🇸🇳','Norway 🇳🇴','IC PO-2'],venue:'New York / Philadelphia / Boston'},
      J:{teams:['Argentina 🇦🇷','Algeria 🇩🇿','Austria 🇦🇹','Jordan 🇯🇴'],venue:'Dallas / San Francisco / Kansas City'},
      K:{teams:['Portugal 🇵🇹','Uzbekistan 🇺🇿','Colombia 🇨🇴','IC PO-1'],venue:'Houston / Guadalajara'},
      L:{teams:['England 🏴󠁧󠁢󠁥󠁮󠁧󠁿','Croatia 🇭🇷','Ghana 🇬🇭','Panama 🇵🇦'],venue:'Dallas / Boston / Toronto'},
    },
    schedule:[
      {date:'Jun 11',time:'3pm ET',group:'A',home:'Mexico 🇲🇽',away:'South Africa 🇿🇦',venue:'Mexico City'},
      {date:'Jun 11',time:'10pm ET',group:'A',home:'South Korea 🇰🇷',away:'UEFA PO-D',venue:'Guadalajara'},
      {date:'Jun 12',time:'3pm ET',group:'B',home:'Canada 🇨🇦',away:'UEFA PO-A',venue:'Toronto'},
      {date:'Jun 12',time:'9pm ET',group:'D',home:'USA 🇺🇸',away:'Paraguay 🇵🇾',venue:'Los Angeles',usa:true},
      {date:'Jun 13',time:'3pm ET',group:'B',home:'Qatar 🇶🇦',away:'Switzerland 🇨🇭',venue:'San Francisco'},
      {date:'Jun 13',time:'6pm ET',group:'C',home:'Brazil 🇧🇷',away:'Morocco 🇲🇦',venue:'New York'},
      {date:'Jun 13',time:'9pm ET',group:'C',home:'Haiti 🇭🇹',away:'Scotland 🏴󠁧󠁢󠁳󠁣󠁴󠁿',venue:'Boston'},
      {date:'Jun 14',time:'1pm ET',group:'E',home:'Germany 🇩🇪',away:'Curaçao 🇨🇼',venue:'Houston',ger:true},
      {date:'Jun 14',time:'4pm ET',group:'F',home:'Netherlands 🇳🇱',away:'UEFA PO-B',venue:'Dallas'},
      {date:'Jun 14',time:'7pm ET',group:'E',home:'Ivory Coast 🇨🇮',away:'Ecuador 🇪🇨',venue:'Philadelphia'},
      {date:'Jun 14',time:'10pm ET',group:'F',home:'Tunisia 🇹🇳',away:'Japan 🇯🇵',venue:'Monterrey'},
      {date:'Jun 15',time:'12pm ET',group:'H',home:'Spain 🇪🇸',away:'Cape Verde 🇨🇻',venue:'Atlanta'},
      {date:'Jun 15',time:'3pm ET',group:'G',home:'Belgium 🇧🇪',away:'Egypt 🇪🇬',venue:'Seattle'},
      {date:'Jun 15',time:'6pm ET',group:'H',home:'Saudi Arabia 🇸🇦',away:'Uruguay 🇺🇾',venue:'Miami'},
      {date:'Jun 15',time:'9pm ET',group:'G',home:'Iran 🇮🇷',away:'New Zealand 🇳🇿',venue:'Los Angeles'},
      {date:'Jun 16',time:'3pm ET',group:'I',home:'France 🇫🇷',away:'Senegal 🇸🇳',venue:'New York'},
      {date:'Jun 16',time:'6pm ET',group:'I',home:'Norway 🇳🇴',away:'IC PO-2',venue:'Boston'},
      {date:'Jun 16',time:'9pm ET',group:'J',home:'Argentina 🇦🇷',away:'Algeria 🇩🇿',venue:'Kansas City'},
      {date:'Jun 16',time:'12am ET',group:'J',home:'Austria 🇦🇹',away:'Jordan 🇯🇴',venue:'Santa Clara'},
      {date:'Jun 17',time:'1pm ET',group:'K',home:'Portugal 🇵🇹',away:'IC PO-1',venue:'Houston'},
      {date:'Jun 17',time:'4pm ET',group:'L',home:'England 🏴󠁧󠁢󠁥󠁮󠁧󠁿',away:'Croatia 🇭🇷',venue:'Dallas'},
      {date:'Jun 17',time:'7pm ET',group:'L',home:'Ghana 🇬🇭',away:'Panama 🇵🇦',venue:'Toronto'},
      {date:'Jun 17',time:'10pm ET',group:'K',home:'Uzbekistan 🇺🇿',away:'Colombia 🇨🇴',venue:'Mexico City'},
      {date:'Jun 18',time:'12pm ET',group:'A',home:'UEFA PO-D',away:'South Africa 🇿🇦',venue:'Atlanta'},
      {date:'Jun 18',time:'3pm ET',group:'B',home:'Switzerland 🇨🇭',away:'UEFA PO-A',venue:'Los Angeles'},
      {date:'Jun 18',time:'6pm ET',group:'B',home:'Canada 🇨🇦',away:'Qatar 🇶🇦',venue:'Vancouver'},
      {date:'Jun 18',time:'9pm ET',group:'A',home:'Mexico 🇲🇽',away:'South Korea 🇰🇷',venue:'Guadalajara'},
      {date:'Jun 19',time:'12pm ET',group:'C',home:'Scotland 🏴󠁧󠁢󠁳󠁣󠁴󠁿',away:'Morocco 🇲🇦',venue:'Miami'},
      {date:'Jun 19',time:'3pm ET',group:'D',home:'USA 🇺🇸',away:'Australia 🇦🇺',venue:'Seattle',usa:true},
      {date:'Jun 19',time:'6pm ET',group:'C',home:'Brazil 🇧🇷',away:'Haiti 🇭🇹',venue:'Miami'},
      {date:'Jun 19',time:'9pm ET',group:'D',home:'Paraguay 🇵🇾',away:'UEFA PO-C',venue:'Kansas City'},
      {date:'Jun 20',time:'1pm ET',group:'F',home:'Netherlands 🇳🇱',away:'UEFA PO-B',venue:'Houston'},
      {date:'Jun 20',time:'4pm ET',group:'E',home:'Germany 🇩🇪',away:'Ivory Coast 🇨🇮',venue:'Toronto',ger:true},
      {date:'Jun 20',time:'8pm ET',group:'E',home:'Ecuador 🇪🇨',away:'Curaçao 🇨🇼',venue:'Kansas City'},
      {date:'Jun 21',time:'12pm ET',group:'H',home:'Spain 🇪🇸',away:'Saudi Arabia 🇸🇦',venue:'Atlanta'},
      {date:'Jun 21',time:'3pm ET',group:'G',home:'Belgium 🇧🇪',away:'Iran 🇮🇷',venue:'Los Angeles'},
      {date:'Jun 21',time:'6pm ET',group:'H',home:'Uruguay 🇺🇾',away:'Cape Verde 🇨🇻',venue:'Miami'},
      {date:'Jun 21',time:'9pm ET',group:'G',home:'New Zealand 🇳🇿',away:'Egypt 🇪🇬',venue:'Vancouver'},
      {date:'Jun 22',time:'1pm ET',group:'J',home:'Argentina 🇦🇷',away:'Austria 🇦🇹',venue:'Dallas'},
      {date:'Jun 22',time:'5pm ET',group:'I',home:'France 🇫🇷',away:'IC PO-2',venue:'Philadelphia'},
      {date:'Jun 22',time:'8pm ET',group:'I',home:'Norway 🇳🇴',away:'Senegal 🇸🇳',venue:'New York'},
      {date:'Jun 22',time:'11pm ET',group:'J',home:'Jordan 🇯🇴',away:'Algeria 🇩🇿',venue:'Santa Clara'},
      {date:'Jun 23',time:'1pm ET',group:'K',home:'Portugal 🇵🇹',away:'Uzbekistan 🇺🇿',venue:'Houston'},
      {date:'Jun 23',time:'4pm ET',group:'L',home:'England 🏴󠁧󠁢󠁥󠁮󠁧󠁿',away:'Ghana 🇬🇭',venue:'Boston'},
      {date:'Jun 23',time:'7pm ET',group:'L',home:'Panama 🇵🇦',away:'Croatia 🇭🇷',venue:'Toronto'},
      {date:'Jun 23',time:'10pm ET',group:'K',home:'Colombia 🇨🇴',away:'IC PO-1',venue:'Guadalajara'},
      {date:'Jun 24',time:'3pm ET',group:'B',home:'Switzerland 🇨🇭',away:'Canada 🇨🇦',venue:'Vancouver'},
      {date:'Jun 24',time:'6pm ET',group:'C',home:'Scotland 🏴󠁧󠁢󠁳󠁣󠁴󠁿',away:'Brazil 🇧🇷',venue:'Miami'},
      {date:'Jun 25',time:'3pm ET',group:'A',home:'Mexico 🇲🇽',away:'UEFA PO-D',venue:'Mexico City'},
      {date:'Jun 25',time:'6pm ET',group:'E',home:'Germany 🇩🇪',away:'Ecuador 🇪🇨',venue:'New York',ger:true},
      {date:'Jun 25',time:'10pm ET',group:'D',home:'USA 🇺🇸',away:'UEFA PO-C',venue:'Los Angeles',usa:true},
      {date:'Jun 26',time:'3pm ET',group:'H',home:'Spain 🇪🇸',away:'Uruguay 🇺🇾',venue:'Atlanta'},
      {date:'Jun 26',time:'6pm ET',group:'F',home:'Netherlands 🇳🇱',away:'Japan 🇯🇵',venue:'Dallas'},
      {date:'Jun 26',time:'6pm ET',group:'I',home:'France 🇫🇷',away:'Norway 🇳🇴',venue:'Philadelphia'},
      {date:'Jun 27',time:'3pm ET',group:'G',home:'Belgium 🇧🇪',away:'New Zealand 🇳🇿',venue:'Vancouver'},
      {date:'Jun 27',time:'3pm ET',group:'J',home:'Argentina 🇦🇷',away:'Jordan 🇯🇴',venue:'Dallas'},
      {date:'Jun 27',time:'6pm ET',group:'K',home:'Portugal 🇵🇹',away:'Colombia 🇨🇴',venue:'Houston'},
      {date:'Jun 27',time:'6pm ET',group:'L',home:'England 🏴󠁧󠁢󠁥󠁮󠁧󠁿',away:'Panama 🇵🇦',venue:'New York'},
      {date:'Jun 28',time:'3pm ET',round:'R32',label:'2nd A vs 2nd B',venue:'Los Angeles'},
      {date:'Jun 29',time:'1pm ET',round:'R32',label:'1st C vs 2nd F',venue:'Houston'},
      {date:'Jun 29',time:'4:30pm ET',round:'R32',label:'1st E vs Best 3rd',venue:'Boston'},
      {date:'Jun 29',time:'9pm ET',round:'R32',label:'1st F vs 2nd C',venue:'Monterrey'},
      {date:'Jun 30',time:'1pm ET',round:'R32',label:'2nd E vs 2nd I',venue:'Dallas'},
      {date:'Jun 30',time:'5pm ET',round:'R32',label:'1st I vs Best 3rd',venue:'New York'},
      {date:'Jun 30',time:'9pm ET',round:'R32',label:'1st A vs Best 3rd',venue:'Mexico City'},
      {date:'Jul 1',time:'12pm ET',round:'R32',label:'1st L vs Best 3rd',venue:'Atlanta'},
      {date:'Jul 1',time:'4pm ET',round:'R32',label:'1st G vs Best 3rd',venue:'Seattle'},
      {date:'Jul 1',time:'8pm ET',round:'R32',label:'1st D vs Best 3rd',venue:'San Francisco',usapath:true},
      {date:'Jul 2',time:'3pm ET',round:'R32',label:'1st H vs 2nd J',venue:'Los Angeles'},
      {date:'Jul 2',time:'7pm ET',round:'R32',label:'2nd K vs 2nd L',venue:'Toronto'},
      {date:'Jul 2',time:'11pm ET',round:'R32',label:'1st B vs Best 3rd',venue:'Vancouver'},
      {date:'Jul 3',time:'2pm ET',round:'R32',label:'2nd D vs 2nd G',venue:'Dallas'},
      {date:'Jul 3',time:'6pm ET',round:'R32',label:'1st J vs 2nd H',venue:'Miami'},
      {date:'Jul 3',time:'9:30pm ET',round:'R32',label:'1st K vs Best 3rd',venue:'Kansas City'},
      {date:'Jul 4',time:'1pm ET',round:'R16',label:'R16 Match 1',venue:'Houston'},
      {date:'Jul 4',time:'5pm ET',round:'R16',label:'R16 Match 2',venue:'Philadelphia'},
      {date:'Jul 5',time:'1pm ET',round:'R16',label:'R16 Match 3',venue:'Houston'},
      {date:'Jul 5',time:'5pm ET',round:'R16',label:'R16 Match 4',venue:'Mexico City'},
      {date:'Jul 6',time:'2pm ET',round:'R16',label:'R16 Match 5',venue:'San Francisco'},
      {date:'Jul 6',time:'6pm ET',round:'R16',label:'R16 Match 6',venue:'Los Angeles'},
      {date:'Jul 7',time:'2pm ET',round:'R16',label:'R16 Match 7',venue:'Vancouver'},
      {date:'Jul 7',time:'6pm ET',round:'R16',label:'R16 Match 8',venue:'Kansas City'},
      {date:'Jul 10',time:'2pm ET',round:'QF',label:'Quarterfinal 1',venue:'Boston'},
      {date:'Jul 10',time:'6pm ET',round:'QF',label:'Quarterfinal 2',venue:'Atlanta'},
      {date:'Jul 11',time:'2pm ET',round:'QF',label:'Quarterfinal 3',venue:'Dallas'},
      {date:'Jul 11',time:'6pm ET',round:'QF',label:'Quarterfinal 4',venue:'Los Angeles'},
      {date:'Jul 14',time:'4pm ET',round:'SF',label:'Semifinal 1',venue:'Dallas'},
      {date:'Jul 15',time:'4pm ET',round:'SF',label:'Semifinal 2',venue:'Atlanta'},
      {date:'Jul 18',time:'4pm ET',round:'3RD',label:'3rd Place Match',venue:'Miami'},
      {date:'Jul 19',time:'4pm ET',round:'Final',label:'⚽ FINAL',venue:'East Rutherford NJ'},
    ]
  },
  2022:{
    title:'2022 FIFA World Cup',hosts:'Qatar',dates:'Nov 20 – Dec 18, 2022',past:true,
    result:'🏆 Argentina def. France 4-2 (pens) — 3-3 AET',
    groups:{
      A:{teams:['Qatar 🇶🇦','Ecuador 🇪🇨','Senegal 🇸🇳','Netherlands 🇳🇱']},
      B:{teams:['England 🏴󠁧󠁢󠁥󠁮󠁧󠁿','Iran 🇮🇷','USA 🇺🇸','Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿'],highlight:true},
      C:{teams:['Argentina 🇦🇷','Saudi Arabia 🇸🇦','Mexico 🇲🇽','Poland 🇵🇱']},
      D:{teams:['France 🇫🇷','Australia 🇦🇺','Denmark 🇩🇰','Tunisia 🇹🇳']},
      E:{teams:['Spain 🇪🇸','Costa Rica 🇨🇷','Germany 🇩🇪','Japan 🇯🇵'],highlight:true},
      F:{teams:['Belgium 🇧🇪','Canada 🇨🇦','Morocco 🇲🇦','Croatia 🇭🇷']},
      G:{teams:['Brazil 🇧🇷','Serbia 🇷🇸','Switzerland 🇨🇭','Cameroon 🇨🇲']},
      H:{teams:['Portugal 🇵🇹','Ghana 🇬🇭','Uruguay 🇺🇾','South Korea 🇰🇷']},
    }
  },
  2018:{
    title:'2018 FIFA World Cup',hosts:'Russia',dates:'Jun 14 – Jul 15, 2018',past:true,
    result:'🏆 France def. Croatia 4-2',
    groups:{
      A:{teams:['Russia 🇷🇺','Saudi Arabia 🇸🇦','Egypt 🇪🇬','Uruguay 🇺🇾']},
      B:{teams:['Portugal 🇵🇹','Spain 🇪🇸','Morocco 🇲🇦','Iran 🇮🇷']},
      C:{teams:['France 🇫🇷','Australia 🇦🇺','Peru 🇵🇪','Denmark 🇩🇰']},
      D:{teams:['Argentina 🇦🇷','Iceland 🇮🇸','Croatia 🇭🇷','Nigeria 🇳🇬']},
      E:{teams:['Brazil 🇧🇷','Switzerland 🇨🇭','Costa Rica 🇨🇷','Serbia 🇷🇸']},
      F:{teams:['Germany 🇩🇪','Mexico 🇲🇽','Sweden 🇸🇪','South Korea 🇰🇷'],highlight:true},
      G:{teams:['Belgium 🇧🇪','Panama 🇵🇦','Tunisia 🇹🇳','England 🏴󠁧󠁢󠁥󠁮󠁧󠁿']},
      H:{teams:['Poland 🇵🇱','Senegal 🇸🇳','Colombia 🇨🇴','Japan 🇯🇵']},
    }
  },
  2014:{
    title:'2014 FIFA World Cup',hosts:'Brazil',dates:'Jun 12 – Jul 13, 2014',past:true,
    result:'🏆 Germany def. Argentina 1-0 (AET)',
    groups:{
      A:{teams:['Brazil 🇧🇷','Croatia 🇭🇷','Mexico 🇲🇽','Cameroon 🇨🇲']},
      B:{teams:['Spain 🇪🇸','Netherlands 🇳🇱','Chile 🇨🇱','Australia 🇦🇺']},
      C:{teams:['Colombia 🇨🇴','Greece 🇬🇷','Ivory Coast 🇨🇮','Japan 🇯🇵']},
      D:{teams:['Uruguay 🇺🇾','Costa Rica 🇨🇷','England 🏴󠁧󠁢󠁥󠁮󠁧󠁿','Italy 🇮🇹']},
      E:{teams:['Switzerland 🇨🇭','Ecuador 🇪🇨','France 🇫🇷','Honduras 🇭🇳']},
      F:{teams:['Argentina 🇦🇷','Bosnia 🇧🇦','Iran 🇮🇷','Nigeria 🇳🇬']},
      G:{teams:['Germany 🇩🇪','Portugal 🇵🇹','Ghana 🇬🇭','USA 🇺🇸'],highlight:true},
      H:{teams:['Belgium 🇧🇪','Algeria 🇩🇿','Russia 🇷🇺','South Korea 🇰🇷']},
    }
  }
};

function setWCYear(yr,el){
  wcYear=yr;
  document.querySelectorAll('#wc-year-btns .wc-year-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  const d=WC_DATA[yr];
  if(d.past&&wcView==='schedule'){wcView='groups';document.querySelectorAll('#wc-view-btns .seg-btn').forEach((b,i)=>b.classList.toggle('active',i===1));}
  renderWC();
}

function setWCView(v,el){
  wcView=v;
  document.querySelectorAll('#wc-view-btns .seg-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  renderWC();
}

function renderWC(){
  const d=WC_DATA[wcYear];
  if(!d)return;
  document.getElementById('wc-src-note').textContent=`${d.title} · ${d.dates} · ${d.hosts}${d.result?' · '+d.result:''}`;
  const el=document.getElementById('wc-content');
  if(wcView==='groups') el.innerHTML=renderWCGroups(d);
  else if(wcView==='bracket') el.innerHTML=renderWCBracket(d);
  else { if(!d.schedule){wcView='groups';renderWC();return;} el.innerHTML=renderWCSchedule(d); }
}

function renderWCGroups(d){
  const cols=Object.keys(d.groups).length>8?'grid-template-columns:repeat(auto-fill,minmax(260px,1fr))':'grid-template-columns:repeat(auto-fill,minmax(280px,1fr))';
  let html=`<div class="wc-groups-grid" style="${cols}">`;
  for(const [letter,g] of Object.entries(d.groups)){
    const hl=g.highlight;
    html+=`<div class="wc-group-card">
      <div class="wc-group-hdr"${hl?' style="background:#8B1A1A"':''}>
        Group ${letter}${hl?' <span style="font-size:9px;opacity:.7;font-weight:400">▲ Featured</span>':''}
        ${g.venue?`<span style="font-size:9px;opacity:.6;font-weight:400;margin-left:auto">${g.venue}</span>`:''}
      </div>
      <table class="wc-group-table">
        <thead><tr><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th></tr></thead>
        <tbody>`;
    for(const t of g.teams){
      const isUSA=t.includes('USA'),isGER=t.includes('Germany');
      const cls=isUSA?'wc-team-usa':isGER?'wc-team-ger':'';
      const badge='';
      html+=`<tr class="${cls}"><td>${t}${badge}</td><td>–</td><td>–</td><td>–</td><td>–</td><td>–</td><td>–</td><td>–</td><td>–</td></tr>`;
    }
    html+=`</tbody></table></div>`;
  }
  return html+'</div>';
}

function renderWCSchedule(d){
  if(!d.schedule)return'<p style="padding:20px;color:var(--muted)">Schedule not available.</p>';
  const featured=d.schedule.filter(m=>m.usa||m.ger||m.usapath);
  const byDate={};
  for(const m of d.schedule){if(!byDate[m.date])byDate[m.date]=[];byDate[m.date].push(m);}
  let html='';
  if(featured.length){
    html+=`<div class="wc-schedule-section"><div class="wc-schedule-date-hdr" style="color:var(--navy);font-weight:700;letter-spacing:.05em">🇺🇸 USA & 🇩🇪 Germany — Featured Matches</div>`;
    for(const m of featured) html+=renderMatchRow(m,true);
    html+=`</div>`;
  }
  html+=`<div class="wc-schedule-section"><div class="wc-schedule-date-hdr">Full Schedule</div>`;
  for(const [date,matches] of Object.entries(byDate)){
    html+=`<div style="font-family:var(--display);font-size:10px;font-weight:800;letter-spacing:.05em;color:var(--muted);padding:6px 0 3px;text-transform:uppercase;border-top:1px solid var(--border);margin-top:4px">${date}</div>`;
    for(const m of matches) html+=renderMatchRow(m,false);
  }
  return html+'</div>';
}

function renderMatchRow(m,alwaysHL){
  const hl=alwaysHL||m.usa||m.ger||m.usapath;
  const roundBadge=m.round?`<span style="font-family:var(--mono);font-size:8px;font-weight:700;padding:1px 5px;border-radius:2px;background:${m.round==='Final'?'#0C1F3F':m.round==='SF'?'#132952':m.round==='QF'?'#1a5c2a':'var(--bg3)'};color:${['Final','SF','QF'].includes(m.round)?'#fff':'var(--muted)'};margin-right:4px">${m.round}</span>`:`<span style="font-family:var(--mono);font-size:8px;color:var(--faint);margin-right:4px">Grp ${m.group}</span>`;
  const teams=m.round?`<span style="font-family:var(--display);font-weight:600;font-size:11px;color:var(--muted)">${m.label}</span>`:`${m.home} <span style="font-family:var(--mono);font-size:9px;color:var(--muted)">vs</span> ${m.away}`;
  const badge='';
  return `<div class="wc-match${hl?' wc-highlight':''}">
    <div class="wc-match-teams">${roundBadge}${teams}${badge}</div>
    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:1px">
      <div class="wc-match-date">${m.date||''} · ${m.time}</div>
      <div class="wc-match-venue">${m.venue}</div>
    </div>
    <div class="wc-match-score">${m.score||'–'}</div>
  </div>`;
}

function renderWCBracket(d){
  if(d.past)return`<div style="padding:30px;text-align:center;color:var(--muted)"><div style="font-family:var(--display);font-size:18px;font-weight:800;margin-bottom:8px">${d.result||''}</div><div style="font-size:11px">${d.title} · ${d.hosts}</div></div>`;
  const rounds=[{label:'Round of 32',count:16},{label:'Round of 16',count:8},{label:'QF',count:4},{label:'SF',count:2},{label:'Final',count:1}];
  let html=`<div style="font-family:var(--mono);font-size:10px;color:var(--muted);margin-bottom:12px">Bracket fills in as teams advance — groups complete Jun 27</div><div style="display:flex;gap:12px;overflow-x:auto;padding-bottom:8px">`;
  for(const r of rounds){
    html+=`<div class="wc-ko-round"><div class="ko-stage-hdr">${r.label}</div>`;
    for(let i=0;i<r.count;i++) html+=`<div class="wc-ko-match"><div class="team tbd">TBD</div><div style="font-family:var(--mono);font-size:8px;color:var(--faint);text-align:center;padding:2px 0">vs</div><div class="team tbd">TBD</div></div>`;
    html+=`</div>`;
  }
  return html+'</div>';
}
