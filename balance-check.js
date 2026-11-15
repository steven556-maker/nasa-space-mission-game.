#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const src = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');
const generatorSrc = fs.readFileSync(path.join(__dirname, 'scenario-generator.js'), 'utf8');
function literal(name, openChar, source = src) {
  const re = new RegExp('(?:var|let|const)\\s+' + name + '\\s*=\\s*');
  const m = re.exec(source);
  if (!m) throw new Error('Could not find ' + name);
  const start = m.index + m[0].length;
  if (source[start] !== openChar) throw new Error('Unexpected literal type for ' + name);
  const closeChar = openChar === '[' ? ']' : '}';
  let depth = 0, quote = '', escaped = false;
  for (let i = start; i < source.length; i++) {
    const c = source[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (c === '\\') escaped = true;
      else if (c === quote) quote = '';
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
    if (c === openChar) depth++;
    else if (c === closeChar && --depth === 0) return Function('return (' + source.slice(start, i + 1) + ')')();
  }
  throw new Error('Unclosed literal: ' + name);
}
const qs = literal('questions', '['), profiles = literal('profileOptions', '{'), routes = literal('trajectoryOptions', '{'), sites = literal('SITES', '['), objectivesByMission = literal('missionObjectives', '{'), challenges = literal('challenges', '['), objectives = literal('objectives', '[');
const byId = x => Object.fromEntries(x.map(v => [v.id, v]));
const question = byId(qs);
const ranges = {budget:[88,126], massLimit:[48,76], powerNeed:[12,25], fuelLimit:[20,39], commsFactor:[.68,1], maxDays:[17,31]};
const scenarioPlans = literal('plans', '{', generatorSrc);
const bands = {budget:[116,126],massLimit:[60,76],powerNeed:[12,16],fuelLimit:[34,39],commsFactor:[.92,1],maxDays:[26,31]};
const mainScenarioBandsMatch = Object.values(scenarioPlans).every(plan => Object.entries(bands).every(([key,[min,max]]) => plan[key] >= min && plan[key] <= max));
function makeRng(seed) { let s=seed>>>0; return ()=>((s=(1664525*s+1013904223)>>>0)/4294967296); }
function nrand(rng, min, max) { return min + Math.floor(rng()*(max-min+1)); }
function evaluateType(type, site, objective, trials, rng) {
  const choices=[];
  const ql=question.launcher.options, qp=question.power.options, qi=question.instrument.options, qc=question.comms.options;
  for(const l of ql) for(const p of qp) for(const i of qi) for(const c of qc) for(const f of profiles[type]) for(const route of routes[type]) {
    const add=(x,key)=>x.reduce((a,o)=>a+(o[key]||0),0);
    const d={cost:add([l,p,i,c,f,route],'cost')+site.cost,mass:add([l,p,i,c,f,route],'mass'),fuel:add([l,p,i,c,f,route],'fuel')+site.fuel,
      science:add([l,p,i,c,f,route],'science')+(i.targets.includes(objective.id)?14:0),neededPower:(objective.powerNeed||0)+(i.power||0)+(f.power||0),instrumentPower:i.power||0,profilePower:f.power||0,powerOut:p.power||0,
      generatedData:(i.data||0)*(f.days||0)*(route.observation||1)*(f.observation||1),bandwidth:c.bandwidth||0,days:(f.days||0)+(route.days||0),comms:route.comms||1,
      reliability:Math.max(45,Math.min(99,Math.round(((l.reliability||100)+(p.reliability||100)+(c.reliability||100))/3-(f.risk||0)-site.risk+(i.targets.includes(objective.id)?5:0)))),payload:l.payload};
    choices.push(d);
  }
  let pass=0,failures=0,examples=[];
  for(let t=0;t<trials;t++){
    const ch=challenges[nrand(rng,0,challenges.length-1)];
    const s={budget:nrand(rng,...ranges.budget),massLimit:nrand(rng,...ranges.massLimit),powerNeed:nrand(rng,...ranges.powerNeed),fuelLimit:nrand(rng,...ranges.fuelLimit),commsFactor:Math.round((.68+rng()*.32)*100)/100,maxDays:nrand(rng,...ranges.maxDays)};
    let winner=null;
    for(const d of choices){if(d.cost<=s.budget&&d.mass<=Math.min(s.massLimit,d.payload)&&s.powerNeed+d.instrumentPower+d.profilePower<=d.powerOut*ch.solar*site.solar&&d.fuel<=s.fuelLimit&&d.generatedData<=d.bandwidth*10.8*d.days*s.commsFactor*ch.comm*d.comms&&d.days<=s.maxDays&&d.reliability>=60){winner=d;break;}}
    if(winner)pass++;else {failures++;if(examples.length<3)examples.push(s);}
  }
  const pareto=choices.filter((a,idx)=>!choices.some((b,j)=>j!==idx&&b.cost<=a.cost&&b.mass<=a.mass&&b.fuel<=a.fuel&&b.science>=a.science&&(b.cost<a.cost||b.mass<a.mass||b.fuel<a.fuel||b.science>a.science))).length;
  return {type,site:site.id,combinations:choices.length,scenarios:trials,winnable:pass,unwinnable:failures,pareto,examples};
}
function fits(type,site,objective,s,ch){
  const choices=[];
  for(const l of question.launcher.options)for(const p of question.power.options)for(const i of question.instrument.options)for(const c of question.comms.options)for(const f of profiles[type])for(const rt of routes[type]){
    const sum=(xs,k)=>xs.reduce((a,x)=>a+(x[k]||0),0),aligned=i.targets.includes(objective.id);
    const cost=sum([l,p,i,c,f,rt],'cost')+site.cost,mass=sum([l,p,i,c,f,rt],'mass'),fuel=sum([l,p,i,c,f,rt],'fuel')+site.fuel;
    const science=sum([l,p,i,c,f,rt],'science')+(aligned?14:0),needed=s.powerNeed+(i.power||0)+(f.power||0);
    const days=(f.days||0)+(rt.days||0),data=(i.data||0)*(f.days||0)*(rt.observation||1)*(f.observation||1);
    const down=(c.bandwidth||0)*10.8*days*s.commsFactor*ch.comm*(rt.comms||1),available=(p.power||0)*ch.solar*site.solar;
    const reliability=Math.max(45,Math.min(99,Math.round(((l.reliability||100)+(p.reliability||100)+(c.reliability||100))/3-(f.risk||0)-site.risk+(aligned?5:0))));
    if(cost<=s.budget&&mass<=Math.min(s.massLimit,l.payload)&&fuel<=s.fuelLimit&&needed<=available&&data<=down&&days<=s.maxDays&&reliability>=60){choices.push({cost,science});}
  }
  return choices.length?choices.reduce((best,x)=>x.cost/Math.max(x.science,1)<best.cost/Math.max(best.science,1)?x:best):null;
}
const rng=makeRng(20261113),trials=Number(process.argv[2]||1000),out=[];
for(const type of Object.keys(profiles)){
  const site=sites.find(s=>s.mission===type),objective=objectives.find(o=>o.id===site.objective);
  if(!site||!objective)throw new Error('No matching site/objective for '+type);
  out.push(evaluateType(type,site,objective,trials,rng));
}
(async()=>{
  global.window={NOVA_RESOURCE_CATALOG:{sources:[],guardrails:[]}};
  require(path.join(__dirname,'scenario-generator.js'));
  const priorRandom=Math.random;Math.random=makeRng(20261113);
  const generated=[];
  for(const type of Object.keys(profiles)){
    const site=sites.find(s=>s.mission===type),eligible=objectives.filter(o=>site.objective?o.id===site.objective:objectivesByMission[type].includes(o.id));
    let wins=0,failures=0;
    for(let k=0;k<trials;k++){
      const got=await window.NOVA_SCENARIO_GENERATOR.generate({missionType:type,site,objectives:eligible,challenges});
      const item=got.scenario,objective=objectives.find(o=>o.id===item.objectiveId),challenge=challenges.find(c=>c.id===item.challengeId);
      if(fits(type,site,objective,item,challenge))wins++;else failures++;
    }
    generated.push({type,generatedScenarios:trials,winnable:wins,unwinnable:failures});
  }
  Math.random=priorRandom;
  const report={source:'option literals parsed from script.js and scenarios produced by scenario-generator.js',classification:'SIMPLIFIED game model only',seed:20261113,mainScenarioBandsMatch,rawConstraintStressTest:{label:'Broad parameter envelope; intentionally not used for generated missions',trialsPerMission:trials,combinationsPerMission:out[0].combinations,totalCombinations:out.reduce((a,x)=>a+x.combinations,0),totalCases:out.reduce((a,x)=>a+x.scenarios,0),unwinnableCases:out.reduce((a,x)=>a+x.unwinnable,0),results:out},generatedScenarioAudit:{trialsPerMission:trials,totalCases:generated.reduce((a,x)=>a+x.generatedScenarios,0),unwinnableCases:generated.reduce((a,x)=>a+x.unwinnable,0),results:generated},paretoByMission:out.map(({type,pareto})=>({type,pareto}))};
  console.log(JSON.stringify(report,null,2));
  if(!mainScenarioBandsMatch||generated.some(x=>x.unwinnable))process.exitCode=1;
})();
