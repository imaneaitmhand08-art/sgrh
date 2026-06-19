"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';

const API = 'http://localhost:8080/api';
const COLORS = ['#4F46E5','#0891B2','#059669','#D97706','#DC2626','#7C3AED','#DB2777'];
const CAL_COLORS = ['#6366F1','#10B981','#F59E0B','#EF4444','#8B5CF6','#0891B2','#DB2777'];

function getInitials(nom, prenom) { return ((nom?.[0]||'')+(prenom?.[0]||'')).toUpperCase(); }
function getColor(str) { let h=0; for(let c of(str||'')) h=c.charCodeAt(0)+((h<<5)-h); return COLORS[Math.abs(h)%COLORS.length]; }

function Avatar({ nom, prenom, size=36 }) {
  return <div style={{ width:size, height:size, borderRadius:'50%', background:getColor((nom||'')+(prenom||'')), color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.36, fontWeight:600, flexShrink:0, fontFamily:'inherit' }}>{getInitials(nom,prenom)}</div>;
}
function PointageBadge({ statut }) {
  const cfg = { present:{label:'Présent',bg:'#ECFDF5',color:'#065F46',border:'#A7F3D0'}, retard:{label:'Retard',bg:'#FFFBEB',color:'#92400E',border:'#FDE68A'}, absent:{label:'Absent',bg:'#FEF2F2',color:'#991B1B',border:'#FECACA'} };
  const c = cfg[statut]||{label:statut||'—',bg:'#F9FAFB',color:'#374151',border:'#E5E7EB'};
  return <span style={{ background:c.bg, color:c.color, border:`1px solid ${c.border}`, borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:600 }}>{c.label}</span>;
}
function StatutConge({ statut }) {
  const cfg = { APPROUVE:{label:'Approuvé',bg:'#ECFDF5',color:'#065F46',border:'#A7F3D0'}, REFUSE:{label:'Refusé',bg:'#FEF2F2',color:'#991B1B',border:'#FECACA'}, EN_ATTENTE:{label:'En attente',bg:'#FFFBEB',color:'#92400E',border:'#FDE68A'} };
  const c = cfg[statut]||cfg['EN_ATTENTE'];
  return <span style={{ background:c.bg, color:c.color, border:`1px solid ${c.border}`, borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:600 }}>{c.label}</span>;
}

// Calendrier équipe
function CalendrierEquipe({ congesEquipe, equipe }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [hoveredDay, setHoveredDay] = useState(null);
  const mois = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  const jours = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
  const memberColors = {};
  equipe.forEach((m,i) => { memberColors[m.id] = CAL_COLORS[i%CAL_COLORS.length]; });
  const firstDay = new Date(currentYear,currentMonth,1).getDay();
  const daysInMonth = new Date(currentYear,currentMonth+1,0).getDate();
  const startOffset = firstDay===0?6:firstDay-1;
  const getCongesForDay = (day) => {
    const date = new Date(currentYear,currentMonth,day); date.setHours(0,0,0,0);
    return congesEquipe.filter(c => { if(!c.dateDebut||!c.dateFin) return false; const d=new Date(c.dateDebut); d.setHours(0,0,0,0); const f=new Date(c.dateFin); f.setHours(23,59,59,999); return date>=d&&date<=f; });
  };
  const cells = []; for(let i=0;i<startOffset;i++) cells.push(null); for(let d=1;d<=daysInMonth;d++) cells.push(d);
  const congesDuMois = congesEquipe.filter(c => { if(!c.dateDebut) return false; const d=new Date(c.dateDebut); const f=new Date(c.dateFin||c.dateDebut); return d<=new Date(currentYear,currentMonth+1,0)&&f>=new Date(currentYear,currentMonth,1); });
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:20 }}>
      <div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', padding:20 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <button onClick={()=>currentMonth===0?(setCurrentMonth(11),setCurrentYear(y=>y-1)):setCurrentMonth(m=>m-1)} style={{ background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:8, padding:'6px 14px', cursor:'pointer', fontSize:16, fontWeight:700, color:'#64748B' }}>‹</button>
          <div style={{ textAlign:'center' }}><div style={{ fontSize:16, fontWeight:800, color:'#1E293B' }}>{mois[currentMonth]} {currentYear}</div><div style={{ fontSize:11, color:'#94A3B8' }}>{congesDuMois.length} congé(s)</div></div>
          <button onClick={()=>currentMonth===11?(setCurrentMonth(0),setCurrentYear(y=>y+1)):setCurrentMonth(m=>m+1)} style={{ background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:8, padding:'6px 14px', cursor:'pointer', fontSize:16, fontWeight:700, color:'#64748B' }}>›</button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3, marginBottom:6 }}>
          {jours.map(j=><div key={j} style={{ textAlign:'center', fontSize:11, fontWeight:700, color:'#94A3B8', padding:'4px 0', background:'#F8FAFC', borderRadius:6 }}>{j}</div>)}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3 }}>
          {cells.map((day,i) => {
            if(!day) return <div key={i}/>;
            const cj = getCongesForDay(day);
            const isToday = day===today.getDate()&&currentMonth===today.getMonth()&&currentYear===today.getFullYear();
            const isWeekend = (i%7===5)||(i%7===6);
            const hasConge = cj.length>0;
            const hasApprouve = cj.some(c=>c.statut==='APPROUVE');
            const dayKey = `${currentYear}-${currentMonth}-${day}`;
            let bg = isToday?'#EEF2FF':hasApprouve?'#FEF3C7':hasConge?'#FEF9EC':'transparent';
            let border = isToday?'#6366F1':hasApprouve?'#F59E0B':hasConge?'#FCD34D':'transparent';
            return (
              <div key={i} style={{ position:'relative' }} onMouseEnter={()=>setHoveredDay(dayKey)} onMouseLeave={()=>setHoveredDay(null)}>
                <div style={{ textAlign:'center', padding:'6px 2px 8px', borderRadius:8, cursor:hasConge?'pointer':'default', background:bg, border:`2px solid ${border}` }}>
                  <div style={{ fontSize:12, fontWeight:isToday?800:400, color:isToday?'#4338CA':isWeekend?'#CBD5E1':'#475569' }}>{day}</div>
                  {hasConge && <div style={{ display:'flex', justifyContent:'center', gap:2, marginTop:2 }}>{cj.slice(0,3).map((c,ci)=><div key={ci} style={{ width:5, height:5, borderRadius:'50%', background:memberColors[c.employe?.id]||'#6366F1' }}/>)}</div>}
                </div>
                {hoveredDay===dayKey&&hasConge&&(
                  <div style={{ position:'absolute', bottom:'calc(100% + 6px)', left:'50%', transform:'translateX(-50%)', background:'#1E293B', color:'#fff', borderRadius:10, padding:'10px 12px', zIndex:50, minWidth:160, boxShadow:'0 8px 24px rgba(0,0,0,0.25)', pointerEvents:'none' }}>
                    {cj.map((c,ci)=>(
                      <div key={ci} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:ci<cj.length-1?4:0 }}>
                        <div style={{ width:8, height:8, borderRadius:'50%', background:memberColors[c.employe?.id]||'#6366F1', flexShrink:0 }}/>
                        <span style={{ fontSize:11 }}>{c.employe?.nom} {c.employe?.prenom}</span>
                        <span style={{ fontSize:10, color:c.statut==='APPROUVE'?'#34D399':'#FCD34D', marginLeft:'auto' }}>{c.statut==='APPROUVE'?'✓':'⏳'}</span>
                      </div>
                    ))}
                    <div style={{ position:'absolute', top:'100%', left:'50%', transform:'translateX(-50%)', width:0, height:0, borderLeft:'5px solid transparent', borderRight:'5px solid transparent', borderTop:'5px solid #1E293B' }}/>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop:14, paddingTop:12, borderTop:'1px solid #F1F5F9' }}>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {equipe.map((m,i)=><div key={m.id} style={{ display:'flex', alignItems:'center', gap:5 }}><div style={{ width:9, height:9, borderRadius:'50%', background:CAL_COLORS[i%CAL_COLORS.length] }}/><span style={{ fontSize:11, color:'#475569' }}>{m.nom} {m.prenom}</span></div>)}
          </div>
        </div>
      </div>
      <div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', overflow:'hidden' }}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid #F8FAFC' }}><span style={{ fontSize:14, fontWeight:700, color:'#1E293B' }}>🏖️ Congés équipe</span></div>
        <div style={{ maxHeight:400, overflowY:'auto' }}>
          {congesEquipe.length===0?<div style={{ padding:40, textAlign:'center', color:'#CBD5E1' }}>Aucun congé</div>
          :congesEquipe.map((c,i)=>(
            <div key={i} style={{ display:'flex', gap:10, padding:'12px 16px', borderBottom:'1px solid #F8FAFC', alignItems:'flex-start' }}>
              <div style={{ width:4, minHeight:40, borderRadius:4, background:memberColors[c.employe?.id]||'#6366F1', flexShrink:0 }}/>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}><Avatar nom={c.employe?.nom} prenom={c.employe?.prenom} size={26}/><span style={{ fontSize:13, fontWeight:600, color:'#1E293B' }}>{c.employe?.nom} {c.employe?.prenom}</span></div>
                  <StatutConge statut={c.statut}/>
                </div>
                <div style={{ fontSize:11, color:'#94A3B8', marginLeft:34 }}>{c.type} · {c.dateDebut} → {c.dateFin}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══ STATISTIQUES & GRAPHIQUES ═══
function StatistiquesEquipe({ equipe, pointagesEquipe, congesEquipe }) {
  // Données pour graphique 1 : Présences vs Retards vs Absences par membre
  const dataParMembre = equipe.map(m => {
    const pts = pointagesEquipe.filter(p => p.employe?.id === m.id);
    return {
      name: m.prenom || m.nom,
      Présents: pts.filter(p=>p.statut==='present').length,
      Retards:  pts.filter(p=>p.statut==='retard').length,
      Absents:  pts.filter(p=>p.statut==='absent').length,
    };
  });

  // Données pour graphique 2 : Répartition congés (camembert)
  const approuves = congesEquipe.filter(c=>c.statut==='APPROUVE').length;
  const enAttente = congesEquipe.filter(c=>c.statut==='EN_ATTENTE').length;
  const refuses   = congesEquipe.filter(c=>c.statut==='REFUSE').length;
  const dataCamembert = [
    { name:'Approuvés', value:approuves, color:'#10B981' },
    { name:'En attente', value:enAttente, color:'#F59E0B' },
    { name:'Refusés',    value:refuses,   color:'#EF4444' },
  ].filter(d=>d.value>0);

  // Données pour graphique 3 : Taux de présence par membre
  const dataTaux = equipe.map((m,i) => {
    const pts = pointagesEquipe.filter(p => p.employe?.id === m.id);
    const total = pts.length;
    const presents = pts.filter(p=>p.statut==='present').length;
    const taux = total > 0 ? Math.round((presents/total)*100) : 0;
    return { name: m.prenom||m.nom, taux, fill: CAL_COLORS[i%CAL_COLORS.length] };
  });

  // Données pour graphique 4 : Évolution pointages sur 7 derniers jours
  const last7Days = [];
  for (let i=6; i>=0; i--) {
    const d = new Date(); d.setDate(d.getDate()-i);
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('fr-FR', {weekday:'short', day:'numeric'});
    const pts = pointagesEquipe.filter(p=>p.date===dateStr);
    last7Days.push({
      jour: label,
      Présents: pts.filter(p=>p.statut==='present').length,
      Retards:  pts.filter(p=>p.statut==='retard').length,
      Absents:  pts.filter(p=>p.statut==='absent').length,
    });
  }

  // KPIs de performance
  const totalPointages = pointagesEquipe.length;
  const totalPresents  = pointagesEquipe.filter(p=>p.statut==='present').length;
  const totalRetards   = pointagesEquipe.filter(p=>p.statut==='retard').length;
  const totalAbsents   = pointagesEquipe.filter(p=>p.statut==='absent').length;
  const tauxPresence   = totalPointages > 0 ? Math.round((totalPresents/totalPointages)*100) : 0;
  const tauxPonctualite= totalPointages > 0 ? Math.round(((totalPresents)/(totalPresents+totalRetards||1))*100) : 0;

  const kpis = [
    { label:'Taux de présence',    value:`${tauxPresence}%`,    icon:'✅', color:'#10B981', bg:'#ECFDF5', desc:`${totalPresents}/${totalPointages} jours` },
    { label:'Taux de ponctualité', value:`${tauxPonctualite}%`, icon:'⏰', color:'#6366F1', bg:'#EEF2FF', desc:`${totalRetards} retard(s)` },
    { label:'Absences totales',    value:totalAbsents,           icon:'❌', color:'#EF4444', bg:'#FEF2F2', desc:'sur toute la période' },
    { label:'Congés approuvés',    value:approuves,              icon:'🏖️', color:'#F59E0B', bg:'#FFFBEB', desc:`${enAttente} en attente` },
  ];

  const CHART_TOOLTIP_STYLE = { background:'#1E293B', border:'none', borderRadius:8, color:'#fff', fontSize:12 };

  return (
    <div>
      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background:'#fff', borderRadius:14, border:'1px solid #F1F5F9', padding:'18px 20px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
              <div style={{ width:40, height:40, borderRadius:10, background:k.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{k.icon}</div>
              <div style={{ fontSize:26, fontWeight:800, color:k.color }}>{k.value}</div>
            </div>
            <div style={{ fontSize:13, fontWeight:600, color:'#1E293B', marginBottom:3 }}>{k.label}</div>
            <div style={{ fontSize:11, color:'#94A3B8' }}>{k.desc}</div>
          </div>
        ))}
      </div>

      {/* Graphiques row 1 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>

        {/* Graphique 1 : Présences par membre */}
        <div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', padding:22, boxShadow:'0 1px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize:14, fontWeight:700, color:'#1E293B', marginBottom:4 }}>📊 Présences par membre</div>
          <div style={{ fontSize:12, color:'#94A3B8', marginBottom:18 }}>Présents · Retards · Absences</div>
          {dataParMembre.length === 0 ? (
            <div style={{ height:200, display:'flex', alignItems:'center', justifyContent:'center', color:'#CBD5E1', fontSize:13 }}>Aucune donnée disponible</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dataParMembre} margin={{ top:0, right:0, left:-20, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize:11, fill:'#94A3B8' }} />
                <YAxis tick={{ fontSize:11, fill:'#94A3B8' }} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize:12 }} />
                <Bar dataKey="Présents" fill="#10B981" radius={[4,4,0,0]} />
                <Bar dataKey="Retards"  fill="#F59E0B" radius={[4,4,0,0]} />
                <Bar dataKey="Absents"  fill="#EF4444" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Graphique 2 : Répartition congés */}
        <div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', padding:22, boxShadow:'0 1px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize:14, fontWeight:700, color:'#1E293B', marginBottom:4 }}>🥧 Répartition des congés</div>
          <div style={{ fontSize:12, color:'#94A3B8', marginBottom:18 }}>Statuts de toutes les demandes</div>
          {dataCamembert.length === 0 ? (
            <div style={{ height:220, display:'flex', alignItems:'center', justifyContent:'center', color:'#CBD5E1', fontSize:13 }}>Aucun congé enregistré</div>
          ) : (
            <div style={{ display:'flex', alignItems:'center', gap:20 }}>
              <ResponsiveContainer width="60%" height={220}>
                <PieChart>
                  <Pie data={dataCamembert} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                    {dataCamembert.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex:1 }}>
                {dataCamembert.map(d => (
                  <div key={d.name} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                    <div style={{ width:12, height:12, borderRadius:3, background:d.color, flexShrink:0 }} />
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:'#1E293B' }}>{d.value}</div>
                      <div style={{ fontSize:11, color:'#94A3B8' }}>{d.name}</div>
                    </div>
                  </div>
                ))}
                <div style={{ borderTop:'1px solid #F1F5F9', paddingTop:10, marginTop:4 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#1E293B' }}>{congesEquipe.length} total</div>
                  <div style={{ fontSize:11, color:'#94A3B8' }}>Toutes demandes</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Graphiques row 2 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>

        {/* Graphique 3 : Taux de présence par membre */}
        <div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', padding:22, boxShadow:'0 1px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize:14, fontWeight:700, color:'#1E293B', marginBottom:4 }}>🎯 Taux de présence individuel</div>
          <div style={{ fontSize:12, color:'#94A3B8', marginBottom:18 }}>Performance par employé (%)</div>
          {dataTaux.length === 0 ? (
            <div style={{ height:220, display:'flex', alignItems:'center', justifyContent:'center', color:'#CBD5E1', fontSize:13 }}>Aucune donnée disponible</div>
          ) : (
            <div>
              {dataTaux.map((d, i) => (
                <div key={i} style={{ marginBottom:14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:10, height:10, borderRadius:'50%', background:d.fill }} />
                      <span style={{ fontSize:13, fontWeight:500, color:'#1E293B' }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize:13, fontWeight:700, color:d.taux>=80?'#10B981':d.taux>=60?'#F59E0B':'#EF4444' }}>{d.taux}%</span>
                  </div>
                  <div style={{ height:8, background:'#F1F5F9', borderRadius:8, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${d.taux}%`, background:d.taux>=80?'#10B981':d.taux>=60?'#F59E0B':'#EF4444', borderRadius:8, transition:'width .5s' }} />
                  </div>
                </div>
              ))}
              {/* Légende couleurs */}
              <div style={{ display:'flex', gap:16, marginTop:16, paddingTop:12, borderTop:'1px solid #F1F5F9' }}>
                {[{c:'#10B981',l:'≥80% Excellent'},{c:'#F59E0B',l:'60-80% Moyen'},{c:'#EF4444',l:'<60% Faible'}].map(l=>(
                  <div key={l.l} style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <div style={{ width:10, height:10, borderRadius:3, background:l.c }} />
                    <span style={{ fontSize:10, color:'#94A3B8' }}>{l.l}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Graphique 4 : Évolution 7 derniers jours */}
        <div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', padding:22, boxShadow:'0 1px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize:14, fontWeight:700, color:'#1E293B', marginBottom:4 }}>📈 Évolution sur 7 jours</div>
          <div style={{ fontSize:12, color:'#94A3B8', marginBottom:18 }}>Présences · Retards · Absences / jour</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={last7Days} margin={{ top:0, right:10, left:-20, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="jour" tick={{ fontSize:10, fill:'#94A3B8' }} />
              <YAxis tick={{ fontSize:11, fill:'#94A3B8' }} allowDecimals={false} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize:12 }} />
              <Line type="monotone" dataKey="Présents" stroke="#10B981" strokeWidth={2.5} dot={{ r:4, fill:'#10B981' }} activeDot={{ r:6 }} />
              <Line type="monotone" dataKey="Retards"  stroke="#F59E0B" strokeWidth={2.5} dot={{ r:4, fill:'#F59E0B' }} activeDot={{ r:6 }} />
              <Line type="monotone" dataKey="Absents"  stroke="#EF4444" strokeWidth={2.5} dot={{ r:4, fill:'#EF4444' }} activeDot={{ r:6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tableau récap membres */}
      <div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', overflow:'hidden', marginTop:20, boxShadow:'0 1px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #F8FAFC' }}>
          <span style={{ fontSize:14, fontWeight:700, color:'#1E293B' }}>🏆 Tableau de performance de l'équipe</span>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:'#F8FAFC' }}>
              {['Employé','Total pointages','Présents','Retards','Absences','Taux présence','Performance'].map(h=>(
                <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:700, color:'#94A3B8', textTransform:'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {equipe.length===0?<tr><td colSpan={7} style={{ padding:48, textAlign:'center', color:'#CBD5E1' }}>Aucun membre</td></tr>
            :equipe.map((m,i) => {
              const pts = pointagesEquipe.filter(p=>p.employe?.id===m.id);
              const presents = pts.filter(p=>p.statut==='present').length;
              const retards  = pts.filter(p=>p.statut==='retard').length;
              const absents  = pts.filter(p=>p.statut==='absent').length;
              const taux = pts.length>0?Math.round((presents/pts.length)*100):0;
              const perf = taux>=80?{label:'Excellent',color:'#10B981',bg:'#ECFDF5'}:taux>=60?{label:'Moyen',color:'#92400E',bg:'#FFFBEB'}:{label:'À améliorer',color:'#991B1B',bg:'#FEF2F2'};
              return (
                <tr key={m.id} style={{ borderTop:'1px solid #F8FAFC' }} onMouseEnter={e=>e.currentTarget.style.background='#FAFBFF'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background:CAL_COLORS[i%CAL_COLORS.length] }}/>
                      <Avatar nom={m.nom} prenom={m.prenom} size={30}/>
                      <div><div style={{ fontSize:13, fontWeight:600, color:'#1E293B' }}>{m.nom} {m.prenom}</div><div style={{ fontSize:11, color:'#94A3B8' }}>{m.poste||'—'}</div></div>
                    </div>
                  </td>
                  <td style={{ padding:'12px 16px', fontSize:13, color:'#475569', fontWeight:600 }}>{pts.length}</td>
                  <td style={{ padding:'12px 16px' }}><span style={{ fontSize:13, fontWeight:700, color:'#10B981' }}>{presents}</span></td>
                  <td style={{ padding:'12px 16px' }}><span style={{ fontSize:13, fontWeight:700, color:'#F59E0B' }}>{retards}</span></td>
                  <td style={{ padding:'12px 16px' }}><span style={{ fontSize:13, fontWeight:700, color:'#EF4444' }}>{absents}</span></td>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ flex:1, height:6, background:'#F1F5F9', borderRadius:6 }}>
                        <div style={{ height:'100%', width:`${taux}%`, background:taux>=80?'#10B981':taux>=60?'#F59E0B':'#EF4444', borderRadius:6 }}/>
                      </div>
                      <span style={{ fontSize:12, fontWeight:700, color:'#1E293B', minWidth:35 }}>{taux}%</span>
                    </div>
                  </td>
                  <td style={{ padding:'12px 16px' }}><span style={{ background:perf.bg, color:perf.color, borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:700 }}>{perf.label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState('stats');
  const [equipe, setEquipe] = useState([]);
  const [pointagesEquipe, setPointagesEquipe] = useState([]);
  const [congesEquipe, setCongesEquipe] = useState([]);
  const [mesConges, setMesConges] = useState([]);
  const [ficheSelectee, setFicheSelectee] = useState(null);
  const [managerInfo, setManagerInfo] = useState(null);
  const [managerId, setManagerId] = useState(null);
  const [loadingConge, setLoadingConge] = useState(false);
  const [filtreDate, setFiltreDate] = useState('');
  const [congeForm, setCongeForm] = useState({ type:'Annuel', motif:'', dateDebut:'', dateFin:'' });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user')||'null');
    if (user) { setManagerInfo(user); setManagerId(user.id); chargerEquipe(user.id); chargerPointagesEquipe(user.id); chargerMesConges(user.id); }
  }, []);

  const chargerEquipe = async (id) => {
    try { const r=await axios.get(`${API}/utilisateurs/equipe/${id}`); const m=Array.isArray(r.data)?r.data:[]; setEquipe(m); chargerCongesEquipe(m); } catch(e){}
  };
  const chargerPointagesEquipe = async (id) => { try { const r=await axios.get(`${API}/pointages/equipe/${id}`); setPointagesEquipe(Array.isArray(r.data)?r.data:[]); } catch(e){} };
  const chargerCongesEquipe = async (membres) => {
    try { const all=[]; for(const m of membres){ const r=await axios.get(`${API}/conges/mon-suivi/${m.id}`); if(Array.isArray(r.data)) r.data.forEach(c=>all.push({...c,employe:m})); } setCongesEquipe(all); } catch(e){}
  };
  const chargerMesConges = async (id) => { try { const r=await axios.get(`${API}/conges/mon-suivi/${id}`); setMesConges(Array.isArray(r.data)?r.data:[]); } catch(e){} };
  const marquerRetard = async (id) => { try { await axios.put(`${API}/pointages/${id}/retard`); chargerPointagesEquipe(managerId); } catch(e){ alert('Erreur: '+(e.response?.data||e.message)); } };
  const marquerAbsent = async (id) => { try { await axios.put(`${API}/pointages/${id}/absent`); chargerPointagesEquipe(managerId); } catch(e){ alert('Erreur: '+(e.response?.data||e.message)); } };
  const soumettreConge = async () => {
    if (!congeForm.dateDebut||!congeForm.dateFin) { alert('Dates obligatoires.'); return; }
    setLoadingConge(true);
    try { await axios.post(`${API}/conges`, {...congeForm, employeId:managerId}); setCongeForm({type:'Annuel',motif:'',dateDebut:'',dateFin:''}); chargerMesConges(managerId); }
    catch(e) { alert('Erreur: '+(e.response?.data||e.message)); }
    finally { setLoadingConge(false); }
  };

  const iStyle = { width:'100%', padding:'10px 12px', border:'1.5px solid #E2E8F0', borderRadius:10, fontSize:14, color:'#1E293B', outline:'none', background:'#F8FAFC', fontFamily:'inherit', boxSizing:'border-box' };
  const lStyle = { fontSize:12, fontWeight:600, color:'#64748B', marginBottom:4, display:'block' };
  const filtresPt = filtreDate ? pointagesEquipe.filter(p=>p.date===filtreDate) : pointagesEquipe;
  const nbPresents = pointagesEquipe.filter(p=>p.statut==='present').length;
  const nbRetards  = pointagesEquipe.filter(p=>p.statut==='retard').length;
  const nbAbsents  = pointagesEquipe.filter(p=>p.statut==='absent').length;

  const navItems = [
    { key:'stats',      icon:'📊', label:'Statistiques' },
    { key:'pointages',  icon:'⏱️', label:'Pointages équipe' },
    { key:'equipe',     icon:'👥', label:'Mon équipe' },
    { key:'calendrier', icon:'📅', label:'Calendrier' },
    { key:'conges',     icon:'🏖️', label:'Mes congés' },
  ];

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#F8FAFC', fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      <aside style={{ width:240, minWidth:240, background:'#0F172A', display:'flex', flexDirection:'column', position:'fixed', top:0, left:0, bottom:0, zIndex:100 }}>
        <div style={{ padding:'24px 20px 16px', borderBottom:'1px solid #1E293B' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#F59E0B,#D97706)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>📊</div>
            <div><div style={{ color:'#F1F5F9', fontWeight:700, fontSize:15 }}>SGRH</div><div style={{ color:'#64748B', fontSize:11 }}>Espace Manager</div></div>
          </div>
        </div>
        <nav style={{ flex:1, padding:'16px 10px' }}>
          <div style={{ fontSize:10, fontWeight:700, color:'#475569', letterSpacing:'.1em', padding:'0 10px', marginBottom:6 }}>MENU</div>
          {navItems.map(item => (
            <button key={item.key} onClick={()=>{ setActiveTab(item.key); setFicheSelectee(null); }} style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 12px', borderRadius:10, border:'none', cursor:'pointer', textAlign:'left', marginBottom:2, background:activeTab===item.key?'rgba(245,158,11,0.15)':'transparent', color:activeTab===item.key?'#FCD34D':'#94A3B8', fontWeight:activeTab===item.key?600:400, fontSize:13, fontFamily:'inherit' }}>
              <span style={{ fontSize:16 }}>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding:'16px 10px', borderTop:'1px solid #1E293B' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, background:'#1E293B' }}>
            <Avatar nom={managerInfo?.nom} prenom={managerInfo?.prenom} size={32}/>
            <div><div style={{ color:'#F1F5F9', fontSize:12, fontWeight:600 }}>{managerInfo?.nom} {managerInfo?.prenom}</div><div style={{ color:'#64748B', fontSize:10 }}>{managerInfo?.poste||'Manager'}</div></div>
          </div>
        </div>
      </aside>

      <div style={{ marginLeft:240, flex:1, display:'flex', flexDirection:'column' }}>
        <header style={{ background:'#fff', borderBottom:'1px solid #F1F5F9', padding:'0 32px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
          <div>
            <div style={{ fontSize:18, fontWeight:700, color:'#1E293B' }}>
              {activeTab==='stats'      && 'Statistiques & Performance'}
              {activeTab==='pointages'  && "Pointages de l'équipe"}
              {activeTab==='equipe'     && (ficheSelectee?`Fiche — ${ficheSelectee.nom} ${ficheSelectee.prenom}`:'Mon équipe')}
              {activeTab==='calendrier' && "Calendrier de l'équipe"}
              {activeTab==='conges'     && 'Mes demandes de congé'}
            </div>
            <div style={{ fontSize:12, color:'#94A3B8' }}>
              {activeTab==='stats'     && `${equipe.length} membre(s) · ${pointagesEquipe.length} pointage(s)`}
              {activeTab==='pointages' && `${pointagesEquipe.length} pointage(s) · ${nbRetards} retard(s)`}
              {activeTab==='equipe'    && !ficheSelectee && `${equipe.length} membres`}
            </div>
          </div>
          {ficheSelectee && <button onClick={()=>setFicheSelectee(null)} style={{ background:'#F1F5F9', border:'none', padding:'8px 16px', borderRadius:8, cursor:'pointer', fontSize:13, color:'#64748B', fontWeight:600 }}>← Retour</button>}
        </header>

        <main style={{ flex:1, padding:32 }}>

          {/* ── STATISTIQUES ── */}
          {activeTab==='stats' && (
            <StatistiquesEquipe equipe={equipe} pointagesEquipe={pointagesEquipe} congesEquipe={congesEquipe} />
          )}

          {/* ── POINTAGES ── */}
          {activeTab==='pointages' && (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
                {[{icon:'✅',label:'Présents',value:nbPresents,accent:'#10B981'},{icon:'⚠️',label:'Retards',value:nbRetards,accent:'#F59E0B'},{icon:'❌',label:'Absents',value:nbAbsents,accent:'#EF4444'},{icon:'👥',label:'Équipe',value:equipe.length,accent:'#6366F1'}].map(s=>(
                  <div key={s.label} style={{ background:'#fff', borderRadius:14, border:'1px solid #F1F5F9', padding:'16px 18px', display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:s.accent+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{s.icon}</div>
                    <div><div style={{ fontSize:11, color:'#94A3B8', fontWeight:500 }}>{s.label}</div><div style={{ fontSize:22, fontWeight:700, color:'#1E293B' }}>{s.value}</div></div>
                  </div>
                ))}
              </div>
              <div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', overflow:'hidden' }}>
                <div style={{ padding:'16px 20px', borderBottom:'1px solid #F8FAFC', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontSize:14, fontWeight:600, color:'#1E293B' }}>Tous les pointages</span>
                  <input type="date" value={filtreDate} onChange={e=>setFiltreDate(e.target.value)} style={{ padding:'7px 12px', borderRadius:8, border:'1px solid #E2E8F0', fontSize:13, outline:'none', background:'#F8FAFC' }}/>
                </div>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr style={{ background:'#F8FAFC' }}>{['Employé','Date','Entrée','Sortie','Statut','Actions'].map(h=><th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:700, color:'#94A3B8', textTransform:'uppercase' }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {filtresPt.length===0?<tr><td colSpan={6} style={{ padding:48, textAlign:'center', color:'#CBD5E1' }}>Aucun pointage</td></tr>
                    :filtresPt.map(p=>(
                      <tr key={p.id} style={{ borderTop:'1px solid #F8FAFC' }} onMouseEnter={e=>e.currentTarget.style.background='#FAFBFF'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <td style={{ padding:'12px 16px' }}><div style={{ display:'flex', alignItems:'center', gap:8 }}><Avatar nom={p.employe?.nom} prenom={p.employe?.prenom} size={30}/><div style={{ fontSize:13, fontWeight:600, color:'#1E293B' }}>{p.employe?.nom} {p.employe?.prenom}</div></div></td>
                        <td style={{ padding:'12px 16px', fontSize:13, color:'#475569' }}>{p.date}</td>
                        <td style={{ padding:'12px 16px', fontSize:13, color:'#10B981', fontWeight:600 }}>{p.heureEntree?.substring(0,5)||'—'}</td>
                        <td style={{ padding:'12px 16px', fontSize:13, color:'#6366F1', fontWeight:600 }}>{p.heureSortie?.substring(0,5)||'—'}</td>
                        <td style={{ padding:'12px 16px' }}><PointageBadge statut={p.statut}/></td>
                        <td style={{ padding:'12px 16px' }}>
                          <div style={{ display:'flex', gap:6 }}>
                            {p.statut!=='retard'&&<button onClick={()=>marquerRetard(p.id)} style={{ padding:'4px 10px', borderRadius:6, border:'1px solid #FDE68A', background:'#FFFBEB', color:'#92400E', fontSize:11, fontWeight:600, cursor:'pointer' }}>⚠️ Retard</button>}
                            {p.statut!=='absent'&&<button onClick={()=>marquerAbsent(p.id)} style={{ padding:'4px 10px', borderRadius:6, border:'1px solid #FECACA', background:'#FEF2F2', color:'#991B1B', fontSize:11, fontWeight:600, cursor:'pointer' }}>❌ Absent</button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── ÉQUIPE ── */}
          {activeTab==='equipe' && !ficheSelectee && (
            <div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', overflow:'hidden' }}>
              <div style={{ padding:'16px 20px', borderBottom:'1px solid #F8FAFC' }}><span style={{ fontSize:14, fontWeight:600, color:'#1E293B' }}>Membres de mon équipe</span></div>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead><tr style={{ background:'#F8FAFC' }}>{['Employé','Poste','Département','Statut','Fiche'].map(h=><th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:700, color:'#94A3B8', textTransform:'uppercase' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {equipe.length===0?<tr><td colSpan={5} style={{ padding:48, textAlign:'center', color:'#CBD5E1' }}>Aucun membre</td></tr>
                  :equipe.map(emp=>(
                    <tr key={emp.id} style={{ borderTop:'1px solid #F8FAFC' }} onMouseEnter={e=>e.currentTarget.style.background='#FAFBFF'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{ padding:'12px 16px' }}><div style={{ display:'flex', alignItems:'center', gap:10 }}><Avatar nom={emp.nom} prenom={emp.prenom} size={36}/><div><div style={{ fontSize:13, fontWeight:600, color:'#1E293B' }}>{emp.nom} {emp.prenom}</div><div style={{ fontSize:11, color:'#94A3B8' }}>{emp.email}</div></div></div></td>
                      <td style={{ padding:'12px 16px', fontSize:13, color:'#475569' }}>{emp.poste||'—'}</td>
                      <td style={{ padding:'12px 16px', fontSize:13, color:'#475569' }}>{emp.departement||'—'}</td>
                      <td style={{ padding:'12px 16px' }}><span style={{ display:'flex', alignItems:'center', gap:5, fontSize:12 }}><span style={{ width:7, height:7, borderRadius:'50%', background:emp.estActif?'#10B981':'#94A3B8', display:'inline-block' }}></span><span style={{ color:emp.estActif?'#065F46':'#94A3B8', fontWeight:500 }}>{emp.estActif?'Actif':'Inactif'}</span></span></td>
                      <td style={{ padding:'12px 16px' }}><button onClick={()=>setFicheSelectee(emp)} style={{ padding:'5px 14px', borderRadius:7, border:'1px solid #FED7AA', background:'#FFF7ED', color:'#9A3412', fontSize:12, fontWeight:600, cursor:'pointer' }}>📋 Voir fiche</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── FICHE ── */}
          {activeTab==='equipe' && ficheSelectee && (
            <div style={{ maxWidth:600 }}>
              <div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', padding:28, marginBottom:16 }}>
                <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24, paddingBottom:20, borderBottom:'1px solid #F1F5F9' }}>
                  <Avatar nom={ficheSelectee.nom} prenom={ficheSelectee.prenom} size={60}/>
                  <div><div style={{ fontSize:20, fontWeight:700, color:'#1E293B' }}>{ficheSelectee.nom} {ficheSelectee.prenom}</div><div style={{ fontSize:13, color:'#94A3B8' }}>{ficheSelectee.email}</div></div>
                </div>
                {[{label:'🏢 Département',value:ficheSelectee.departement},{label:'💼 Poste',value:ficheSelectee.poste},{label:'📅 Date embauche',value:ficheSelectee.dateEmbauche}].map(row=>(
                  <div key={row.label} style={{ display:'flex', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid #F8FAFC' }}>
                    <span style={{ fontSize:13, color:'#94A3B8' }}>{row.label}</span>
                    <span style={{ fontSize:13, color:'#1E293B', fontWeight:600 }}>{row.value||'—'}</span>
                  </div>
                ))}
              </div>
              <div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', overflow:'hidden' }}>
                <div style={{ padding:'14px 20px', borderBottom:'1px solid #F8FAFC' }}><span style={{ fontSize:14, fontWeight:600, color:'#1E293B' }}>📜 Historique congés</span></div>
                <div style={{ padding:12 }}>
                  {congesEquipe.filter(c=>c.employe?.id===ficheSelectee.id).length===0
                    ?<div style={{ padding:24, textAlign:'center', color:'#CBD5E1' }}>Aucun congé</div>
                    :congesEquipe.filter(c=>c.employe?.id===ficheSelectee.id).map(c=>(
                      <div key={c.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', borderRadius:8, marginBottom:4, background:'#F8FAFC' }}>
                        <div><div style={{ fontSize:13, fontWeight:600, color:'#1E293B' }}>{c.type}</div><div style={{ fontSize:11, color:'#94A3B8' }}>📆 {c.dateDebut} → {c.dateFin}</div></div>
                        <StatutConge statut={c.statut}/>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ── CALENDRIER ── */}
          {activeTab==='calendrier' && (
            <CalendrierEquipe congesEquipe={congesEquipe} equipe={equipe}/>
          )}

          {/* ── MES CONGÉS ── */}
          {activeTab==='conges' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
              <div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', padding:24 }}>
                <div style={{ fontSize:15, fontWeight:700, color:'#1E293B', marginBottom:20 }}>📋 Nouvelle demande</div>
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  <div><label style={lStyle}>Type</label><select style={iStyle} value={congeForm.type} onChange={e=>setCongeForm({...congeForm,type:e.target.value})}><option value="Annuel">Congé annuel</option><option value="Maladie">Congé maladie</option><option value="Exceptionnel">Congé exceptionnel</option></select></div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    <div><label style={lStyle}>Date début *</label><input type="date" style={iStyle} value={congeForm.dateDebut} onChange={e=>setCongeForm({...congeForm,dateDebut:e.target.value})}/></div>
                    <div><label style={lStyle}>Date fin *</label><input type="date" style={iStyle} value={congeForm.dateFin} onChange={e=>setCongeForm({...congeForm,dateFin:e.target.value})}/></div>
                  </div>
                  <div><label style={lStyle}>Motif</label><textarea style={{...iStyle,height:80,resize:'vertical'}} value={congeForm.motif} onChange={e=>setCongeForm({...congeForm,motif:e.target.value})}/></div>
                  <button onClick={soumettreConge} disabled={loadingConge} style={{ padding:'11px', borderRadius:10, border:'none', background:loadingConge?'#FCD34D':'linear-gradient(135deg,#F59E0B,#D97706)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>{loadingConge?'⏳ Envoi...':'📤 Envoyer'}</button>
                  <div style={{ fontSize:11, color:'#94A3B8', textAlign:'center' }}>ℹ️ Validée par l'administrateur</div>
                </div>
              </div>
              <div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', overflow:'hidden' }}>
                <div style={{ padding:'16px 20px', borderBottom:'1px solid #F8FAFC' }}><span style={{ fontSize:15, fontWeight:700, color:'#1E293B' }}>📜 Mes demandes</span></div>
                <div style={{ padding:8 }}>
                  {mesConges.length===0?<div style={{ padding:40, textAlign:'center', color:'#CBD5E1' }}>Aucune demande</div>
                  :mesConges.map(d=>(
                    <div key={d.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 14px', borderRadius:10, marginBottom:4, background:'#F8FAFC' }}>
                      <div><div style={{ fontSize:13, fontWeight:600, color:'#1E293B' }}>{d.type}</div><div style={{ fontSize:11, color:'#94A3B8' }}>📆 {d.dateDebut} → {d.dateFin}</div></div>
                      <StatutConge statut={d.statut}/>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}