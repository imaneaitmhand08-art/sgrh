"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API = 'http://localhost:8080/api';
const COLORS = ['#4F46E5','#0891B2','#059669','#D97706','#DC2626','#7C3AED','#DB2777'];

function getInitials(nom, prenom) { return ((nom?.[0]||'')+(prenom?.[0]||'')).toUpperCase(); }
function getColor(str) { let h=0; for(let c of(str||'')) h=c.charCodeAt(0)+((h<<5)-h); return COLORS[Math.abs(h)%COLORS.length]; }

function Avatar({ nom, prenom, size=36 }) {
  return <div style={{ width:size, height:size, borderRadius:'50%', background:getColor((nom||'')+(prenom||'')), color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.36, fontWeight:600, flexShrink:0, fontFamily:'inherit' }}>{getInitials(nom,prenom)}</div>;
}
function RoleBadge({ role }) {
  const cfg = { ADMIN:{label:'Admin',bg:'#EEF2FF',color:'#4338CA',border:'#C7D2FE'}, RH:{label:'RH',bg:'#ECFDF5',color:'#065F46',border:'#A7F3D0'}, EMPLOYE:{label:'Employé',bg:'#FFF7ED',color:'#9A3412',border:'#FED7AA'} };
  const c = cfg[(role||'').toUpperCase()]||cfg['RH'];
  return <span style={{ background:c.bg, color:c.color, border:`1px solid ${c.border}`, borderRadius:20, padding:'2px 10px', fontSize:11, fontWeight:600 }}>{c.label}</span>;
}
function PointageBadge({ statut }) {
  const cfg = { present:{label:'Présent',bg:'#ECFDF5',color:'#065F46',border:'#A7F3D0'}, retard:{label:'Retard',bg:'#FFFBEB',color:'#92400E',border:'#FDE68A'}, absent:{label:'Absent',bg:'#FEF2F2',color:'#991B1B',border:'#FECACA'} };
  const c = cfg[statut]||{label:statut||'—',bg:'#F9FAFB',color:'#374151',border:'#E5E7EB'};
  return <span style={{ background:c.bg, color:c.color, border:`1px solid ${c.border}`, borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:600 }}>{c.label}</span>;
}
function CongeStatut({ statut }) {
  const cfg = { APPROUVE:{label:'Approuvé',bg:'#ECFDF5',color:'#065F46',border:'#A7F3D0'}, REFUSE:{label:'Refusé',bg:'#FEF2F2',color:'#991B1B',border:'#FECACA'}, EN_ATTENTE:{label:'En attente',bg:'#FFFBEB',color:'#92400E',border:'#FDE68A'} };
  const c = cfg[statut]||cfg['EN_ATTENTE'];
  return <span style={{ background:c.bg, color:c.color, border:`1px solid ${c.border}`, borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:600 }}>{c.label}</span>;
}

// ═══ STATISTIQUES (TABLEAU DE BORD) ═══
const CHART_COLORS = ['#6366F1','#10B981','#F59E0B','#DC2626','#0891B2','#7C3AED','#DB2777','#059669'];

function StatistiquesDashboard({ employes, pointages }) {
  // Répartition par département
  const deptCounts = {};
  employes.forEach(e => {
    const dept = e.departement || 'Non défini';
    deptCounts[dept] = (deptCounts[dept]||0) + 1;
  });
  const dataDept = Object.entries(deptCounts).map(([name, value]) => ({ name, value }));

  // Évolution des pointages sur les 7 derniers jours
  const aujourdHui = new Date();
  const jours7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(aujourdHui);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit' });
    const pointagesDuJour = pointages.filter(p => p.date === dateStr);
    jours7.push({
      date: label,
      Présents: pointagesDuJour.filter(p => p.statut === 'present').length,
      Retards: pointagesDuJour.filter(p => p.statut === 'retard').length,
      Absents: pointagesDuJour.filter(p => p.statut === 'absent').length,
    });
  }

  const totalPointagesSemaine = jours7.reduce((acc,j) => acc + j.Présents + j.Retards + j.Absents, 0);

  return (
    <div>
      {/* Cartes résumé */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
        {[
          { icon:'🏢', label:'Départements actifs', value:dataDept.length, accent:'#6366F1' },
          { icon:'📊', label:'Pointages (7 derniers jours)', value:totalPointagesSemaine, accent:'#10B981' },
          { icon:'👥', label:'Effectif total', value:employes.length, accent:'#F59E0B' },
        ].map(s=>(
          <div key={s.label} style={{ background:'#fff', borderRadius:14, border:'1px solid #F1F5F9', padding:'18px 20px', display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:s.accent+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{s.icon}</div>
            <div><div style={{ fontSize:11, color:'#94A3B8', fontWeight:500 }}>{s.label}</div><div style={{ fontSize:24, fontWeight:700, color:'#1E293B' }}>{s.value}</div></div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.3fr', gap:24 }}>
        {/* Camembert départements */}
        <div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', padding:24 }}>
          <div style={{ fontSize:15, fontWeight:700, color:'#1E293B', marginBottom:4 }}>🏢 Répartition par département</div>
          <div style={{ fontSize:12, color:'#94A3B8', marginBottom:16 }}>Distribution des employés</div>
          {dataDept.length === 0 ? (
            <div style={{ padding:48, textAlign:'center', color:'#CBD5E1' }}>Aucune donnée</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={dataDept}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {dataDept.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Courbe pointages 7 jours */}
        <div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', padding:24 }}>
          <div style={{ fontSize:15, fontWeight:700, color:'#1E293B', marginBottom:4 }}>📈 Pointages sur 7 jours</div>
          <div style={{ fontSize:12, color:'#94A3B8', marginBottom:16 }}>Présents, retards et absences par jour</div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={jours7}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize:12, fill:'#94A3B8' }} />
              <YAxis allowDecimals={false} tick={{ fontSize:12, fill:'#94A3B8' }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize:12 }} />
              <Line type="monotone" dataKey="Présents" stroke="#10B981" strokeWidth={2} dot={{ r:3 }} />
              <Line type="monotone" dataKey="Retards" stroke="#F59E0B" strokeWidth={2} dot={{ r:3 }} />
              <Line type="monotone" dataKey="Absents" stroke="#DC2626" strokeWidth={2} dot={{ r:3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ═══ ORGANIGRAMME ═══
function OrganigrammeNode({ user, children, level=0 }) {
  const [expanded, setExpanded] = useState(true);
  const roleColors = {
  ADMIN:   { bg:'linear-gradient(135deg,#6366F1,#8B5CF6)', border:'#6366F1' },
  EMPLOYE: { bg:'linear-gradient(135deg,#F59E0B,#D97706)', border:'#F59E0B' },
  RH:      { bg:'linear-gradient(135deg,#10B981,#059669)', border:'#10B981' },
};
  const rc = roleColors[(user.role||'').toUpperCase()] || roleColors['RH'];

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
      {/* Carte */}
      <div style={{ position:'relative' }}>
        <div style={{
          background:'#fff', borderRadius:14, border:`2px solid ${rc.border}`,
          padding:'14px 18px', minWidth:180, maxWidth:220,
          boxShadow:'0 4px 16px rgba(0,0,0,0.08)',
          cursor:children&&children.length>0?'pointer':'default',
          transition:'transform .15s, box-shadow .15s',
          textAlign:'center'
        }}
          onClick={() => children&&children.length>0&&setExpanded(!expanded)}
          onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.12)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'; }}>
          {/* Avatar */}
          <div style={{ display:'flex', justifyContent:'center', marginBottom:8 }}>
            <div style={{ width:48, height:48, borderRadius:'50%', background:rc.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:'#fff', boxShadow:`0 2px 8px ${rc.border}40` }}>
              {getInitials(user.nom, user.prenom)}
            </div>
          </div>
          <div style={{ fontSize:13, fontWeight:700, color:'#1E293B', marginBottom:3 }}>{user.nom} {user.prenom}</div>
          <div style={{ fontSize:11, color:'#64748B', marginBottom:6 }}>{user.poste||'—'}</div>
          <div style={{ display:'flex', justifyContent:'center' }}>
            <RoleBadge role={user.role} />
          </div>
          {children&&children.length>0&&(
            <div style={{ position:'absolute', bottom:-10, left:'50%', transform:'translateX(-50%)', width:20, height:20, borderRadius:'50%', background:rc.border, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:'#fff', fontWeight:700, boxShadow:'0 2px 6px rgba(0,0,0,0.2)' }}>
              {expanded?'−':'+'}
            </div>
          )}
        </div>
      </div>

      {/* Enfants */}
      {expanded && children && children.length > 0 && (
        <div style={{ marginTop:24, display:'flex', gap:20, position:'relative' }}>
          {/* Ligne verticale du parent */}
          <div style={{ position:'absolute', top:-14, left:'50%', width:2, height:14, background:'#E2E8F0' }} />
          {/* Ligne horizontale reliant les enfants */}
          {children.length > 1 && (
            <div style={{ position:'absolute', top:0, left:`calc(50% / ${children.length})`, right:`calc(50% / ${children.length})`, height:2, background:'#E2E8F0' }} />
          )}
          {children.map((child, i) => (
            <div key={child.user.id} style={{ display:'flex', flexDirection:'column', alignItems:'center', position:'relative' }}>
              {/* Ligne verticale vers enfant */}
              <div style={{ width:2, height:16, background:'#E2E8F0', marginBottom:8 }} />
              <OrganigrammeNode user={child.user} children={child.children} level={level+1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Organigramme({ employes }) {
  // Construire l'arbre hiérarchique
  const buildTree = (employees) => {
    const map = {};
    employees.forEach(e => { map[e.id] = { user:e, children:[] }; });

    const roots = [];
    employees.forEach(e => {
      if (e.managerId && map[e.managerId]) {
        map[e.managerId].children.push(map[e.id]);
      } else if (!e.managerId || !map[e.managerId]) {
        roots.push(map[e.id]);
      }
    });
    return roots;
  };

  const admins = employes.filter(e => (e.role||'').toUpperCase() === 'ADMIN');
  const others = employes.filter(e => (e.role||'').toUpperCase() !== 'ADMIN');
  const tree = buildTree(employes);

  const nbDepts = new Set(employes.filter(e=>e.departement).map(e=>e.departement)).size;

  return (
    <div>
      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
        {[
          { icon:'👥', label:'Total employés', value:employes.length, color:'#6366F1', bg:'#EEF2FF' },
          { icon:'⚙️', label:'Administrateurs', value:admins.length, color:'#4338CA', bg:'#EEF2FF' },
          { icon:'📊', label:'Employés', value:employes.filter(e=>(e.role||'').toUpperCase()==='EMPLOYE').length, color:'#9A3412', bg:'#FFF7ED' },
          { icon:'🏢', label:'Départements', value:nbDepts, color:'#065F46', bg:'#ECFDF5' },
        ].map(s => (
          <div key={s.label} style={{ background:'#fff', borderRadius:14, border:'1px solid #F1F5F9', padding:'16px 20px', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{s.icon}</div>
            <div><div style={{ fontSize:22, fontWeight:700, color:s.color }}>{s.value}</div><div style={{ fontSize:11, color:'#94A3B8' }}>{s.label}</div></div>
          </div>
        ))}
      </div>

      {/* Légende */}
      <div style={{ display:'flex', gap:16, marginBottom:24, padding:'12px 20px', background:'#fff', borderRadius:12, border:'1px solid #F1F5F9', width:'fit-content' }}>
        <span style={{ fontSize:12, fontWeight:600, color:'#64748B', marginRight:4 }}>Légende :</span>
        {[
          { color:'#6366F1', label:'Administrateur' },
          { color:'#F59E0B', label:'Employé' },
          { color:'#10B981', label:'RH' },
        ].map(l => (
          <div key={l.label} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:12, height:12, borderRadius:3, background:l.color }} />
            <span style={{ fontSize:12, color:'#475569' }}>{l.label}</span>
          </div>
        ))}
        <span style={{ fontSize:11, color:'#94A3B8', marginLeft:8 }}>· Cliquer sur une carte pour replier/déplier</span>
      </div>

      {/* Organigramme */}
      <div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', padding:40, overflowX:'auto', boxShadow:'0 1px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ minWidth:600, display:'flex', flexDirection:'column', alignItems:'center', gap:0 }}>
          {tree.length === 0 ? (
            <div style={{ padding:48, textAlign:'center', color:'#CBD5E1' }}>Chargement de l'organigramme...</div>
          ) : (
            <div style={{ display:'flex', gap:40, alignItems:'flex-start' }}>
              {tree.map(node => (
                <OrganigrammeNode key={node.user.id} user={node.user} children={node.children} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Liste par département */}
      <div style={{ marginTop:24, background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', overflow:'hidden' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #F8FAFC' }}>
          <span style={{ fontSize:14, fontWeight:700, color:'#1E293B' }}>📋 Liste par département</span>
        </div>
        {Array.from(new Set(employes.map(e=>e.departement||'Non défini'))).map(dept => {
          const membres = employes.filter(e=>(e.departement||'Non défini')===dept);
          return (
            <div key={dept} style={{ padding:'14px 20px', borderBottom:'1px solid #F8FAFC' }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#1E293B', marginBottom:10 }}>🏢 {dept} <span style={{ fontSize:11, color:'#94A3B8', fontWeight:400 }}>({membres.length} membre(s))</span></div>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                {membres.map(m => (
                  <div key={m.id} style={{ display:'flex', alignItems:'center', gap:8, background:'#F8FAFC', borderRadius:10, padding:'8px 12px', border:'1px solid #F1F5F9' }}>
                    <Avatar nom={m.nom} prenom={m.prenom} size={28} />
                    <div>
                      <div style={{ fontSize:12, fontWeight:600, color:'#1E293B' }}>{m.nom} {m.prenom}</div>
                      <div style={{ fontSize:10, color:'#94A3B8' }}>{m.poste||m.role}</div>
                    </div>
                    <RoleBadge role={m.role} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══ CONFIGURATION SYSTÈME ═══
function ConfigSysteme() {
  const [config, setConfig] = useState({
    nomEntreprise: 'SGRH Corp',
    adresse: 'Rabat, Maroc',
    email: 'contact@sgrh.com',
    telephone: '+212 5XX-XXXXXX',
    heureDebut: '09:00',
    heureFin: '18:00',
    heureRetard: '09:00',
    joursCongeParAn: 21,
    joursPreavais: 30,
    devise: 'MAD',
    langue: 'Français',
  });
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('entreprise');

  const handleSave = () => {
    // Sauvegarder en localStorage pour la démo
    localStorage.setItem('sgrh_config', JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  useEffect(() => {
    const saved = localStorage.getItem('sgrh_config');
    if (saved) setConfig(JSON.parse(saved));
  }, []);

  const iStyle = { width:'100%', padding:'10px 12px', border:'1.5px solid #E2E8F0', borderRadius:10, fontSize:14, color:'#1E293B', outline:'none', background:'#F8FAFC', fontFamily:'inherit', boxSizing:'border-box' };
  const lStyle = { fontSize:12, fontWeight:600, color:'#64748B', marginBottom:5, display:'block' };

  const sections = [
    { key:'entreprise', icon:'🏢', label:"Informations de l'entreprise" },
    { key:'pointage',   icon:'⏱️', label:'Règles de pointage' },
    { key:'conges',     icon:'📅', label:'Politique des congés' },
    { key:'systeme',    icon:'⚙️', label:'Paramètres système' },
  ];

  return (
    <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', gap:20 }}>
      {/* Menu config */}
      <div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', padding:12, height:'fit-content' }}>
        {sections.map(s => (
          <button key={s.key} onClick={() => setActiveSection(s.key)} style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 12px', borderRadius:10, border:'none', cursor:'pointer', textAlign:'left', marginBottom:4, background:activeSection===s.key?'#EEF2FF':'transparent', color:activeSection===s.key?'#4338CA':'#64748B', fontWeight:activeSection===s.key?600:400, fontSize:13, fontFamily:'inherit' }}>
            <span>{s.icon}</span>{s.label}
          </button>
        ))}
      </div>

      {/* Contenu config */}
      <div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', padding:28 }}>

        {/* Entreprise */}
        {activeSection==='entreprise' && (
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:'#1E293B', marginBottom:20 }}>🏢 Informations de l'entreprise</div>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <label style={lStyle}>Nom de l'entreprise</label>
                <input style={iStyle} value={config.nomEntreprise} onChange={e=>setConfig({...config,nomEntreprise:e.target.value})} />
              </div>
              <div>
                <label style={lStyle}>Adresse</label>
                <input style={iStyle} value={config.adresse} onChange={e=>setConfig({...config,adresse:e.target.value})} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={lStyle}>Email de contact</label>
                  <input style={iStyle} type="email" value={config.email} onChange={e=>setConfig({...config,email:e.target.value})} />
                </div>
                <div>
                  <label style={lStyle}>Téléphone</label>
                  <input style={iStyle} value={config.telephone} onChange={e=>setConfig({...config,telephone:e.target.value})} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pointage */}
        {activeSection==='pointage' && (
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:'#1E293B', marginBottom:20 }}>⏱️ Règles de pointage</div>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ padding:14, background:'#FFFBEB', borderRadius:10, border:'1px solid #FDE68A', fontSize:13, color:'#92400E' }}>
                ⚠️ Ces paramètres affectent le calcul automatique des retards et des absences.
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={lStyle}>Heure de début de travail</label>
                  <input type="time" style={iStyle} value={config.heureDebut} onChange={e=>setConfig({...config,heureDebut:e.target.value})} />
                </div>
                <div>
                  <label style={lStyle}>Heure de fin de travail</label>
                  <input type="time" style={iStyle} value={config.heureFin} onChange={e=>setConfig({...config,heureFin:e.target.value})} />
                </div>
              </div>
              <div>
                <label style={lStyle}>Heure limite (après = retard)</label>
                <input type="time" style={iStyle} value={config.heureRetard} onChange={e=>setConfig({...config,heureRetard:e.target.value})} />
                <div style={{ fontSize:11, color:'#94A3B8', marginTop:4 }}>Actuellement réglé sur {config.heureRetard} — tout pointage après cette heure est marqué "Retard"</div>
              </div>
              <div style={{ background:'#F8FAFC', borderRadius:10, padding:14, border:'1px solid #F1F5F9' }}>
                <div style={{ fontSize:13, fontWeight:600, color:'#1E293B', marginBottom:8 }}>📋 Récapitulatif horaires</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                  {[{l:'Début',v:config.heureDebut,c:'#10B981'},{l:'Limite retard',v:config.heureRetard,c:'#F59E0B'},{l:'Fin',v:config.heureFin,c:'#6366F1'}].map(h=>(
                    <div key={h.l} style={{ textAlign:'center', padding:'10px', background:'#fff', borderRadius:8, border:`2px solid ${h.c}20` }}>
                      <div style={{ fontSize:18, fontWeight:800, color:h.c }}>{h.v}</div>
                      <div style={{ fontSize:11, color:'#94A3B8' }}>{h.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Congés */}
        {activeSection==='conges' && (
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:'#1E293B', marginBottom:20 }}>📅 Politique des congés</div>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={lStyle}>Jours de congé annuels</label>
                  <input type="number" style={iStyle} value={config.joursCongeParAn} onChange={e=>setConfig({...config,joursCongeParAn:parseInt(e.target.value)})} min={0} max={60} />
                  <div style={{ fontSize:11, color:'#94A3B8', marginTop:4 }}>Nombre de jours ouvrables par an</div>
                </div>
                <div>
                  <label style={lStyle}>Délai de préavis (jours)</label>
                  <input type="number" style={iStyle} value={config.joursPreavais} onChange={e=>setConfig({...config,joursPreavais:parseInt(e.target.value)})} min={0} max={90} />
                  <div style={{ fontSize:11, color:'#94A3B8', marginTop:4 }}>Délai minimum avant le début du congé</div>
                </div>
              </div>
              <div style={{ background:'#ECFDF5', borderRadius:10, padding:16, border:'1px solid #A7F3D0' }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#065F46', marginBottom:8 }}>✅ Types de congés disponibles</div>
                {['Congé annuel','Congé maladie','Congé exceptionnel','Congé maternité'].map(t=>(
                  <div key={t} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:'#10B981' }}/>
                    <span style={{ fontSize:13, color:'#065F46' }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Système */}
        {activeSection==='systeme' && (
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:'#1E293B', marginBottom:20 }}>⚙️ Paramètres système</div>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={lStyle}>Devise</label>
                  <select style={iStyle} value={config.devise} onChange={e=>setConfig({...config,devise:e.target.value})}>
                    <option value="MAD">MAD — Dirham marocain</option>
                    <option value="EUR">EUR — Euro</option>
                    <option value="USD">USD — Dollar</option>
                  </select>
                </div>
                <div>
                  <label style={lStyle}>Langue</label>
                  <select style={iStyle} value={config.langue} onChange={e=>setConfig({...config,langue:e.target.value})}>
                    <option value="Français">Français</option>
                    <option value="العربية">العربية</option>
                    <option value="English">English</option>
                  </select>
                </div>
              </div>
              <div style={{ background:'#F8FAFC', borderRadius:10, padding:16, border:'1px solid #F1F5F9' }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#1E293B', marginBottom:12 }}>ℹ️ Informations système</div>
                {[
                  { label:'Version', value:'SGRH v1.0.0' },
                  { label:'Backend', value:'Spring Boot 3.4.1' },
                  { label:'Frontend', value:'Next.js 15' },
                  { label:'Base de données', value:'MySQL 8' },
                  { label:'Dernière mise à jour', value:new Date().toLocaleDateString('fr-FR') },
                ].map(r=>(
                  <div key={r.label} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #F1F5F9' }}>
                    <span style={{ fontSize:13, color:'#94A3B8' }}>{r.label}</span>
                    <span style={{ fontSize:13, color:'#1E293B', fontWeight:600 }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bouton sauvegarder */}
        <div style={{ marginTop:24, display:'flex', justifyContent:'flex-end', gap:10 }}>
          {saved && <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'#065F46', background:'#ECFDF5', padding:'8px 16px', borderRadius:8, border:'1px solid #A7F3D0' }}>✅ Configuration sauvegardée !</div>}
          <button onClick={handleSave} style={{ padding:'10px 24px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#6366F1,#8B5CF6)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>
            💾 Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══ CALENDRIER GLOBAL ═══
function CalendrierGlobal({ tousConges, employes }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [hoveredDay, setHoveredDay] = useState(null);
  const [filtreStatut, setFiltreStatut] = useState('');
  const mois = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  const jours = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
  const CAL_COLORS = ['#6366F1','#10B981','#F59E0B','#EF4444','#8B5CF6','#0891B2','#DB2777','#059669'];
  const empColors = {};
  employes.forEach((e,i) => { empColors[e.id] = CAL_COLORS[i%CAL_COLORS.length]; });
  const congesFiltres = filtreStatut?tousConges.filter(c=>c.statut===filtreStatut):tousConges;
  const firstDay = new Date(currentYear,currentMonth,1).getDay();
  const daysInMonth = new Date(currentYear,currentMonth+1,0).getDate();
  const startOffset = firstDay===0?6:firstDay-1;
  const getCongesForDay = (day) => {
    const date = new Date(currentYear,currentMonth,day); date.setHours(0,0,0,0);
    return congesFiltres.filter(c => { if(!c.dateDebut||!c.dateFin) return false; const d=new Date(c.dateDebut); d.setHours(0,0,0,0); const f=new Date(c.dateFin); f.setHours(23,59,59,999); return date>=d&&date<=f; });
  };
  const congesDuMois = congesFiltres.filter(c => { if(!c.dateDebut) return false; const d=new Date(c.dateDebut); const f=new Date(c.dateFin||c.dateDebut); return d<=new Date(currentYear,currentMonth+1,0)&&f>=new Date(currentYear,currentMonth,1); });
  const cells = []; for(let i=0;i<startOffset;i++) cells.push(null); for(let d=1;d<=daysInMonth;d++) cells.push(d);
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
        {[{icon:'📅',label:'Ce mois',value:congesDuMois.length,color:'#6366F1'},{icon:'✅',label:'Approuvés',value:congesDuMois.filter(c=>c.statut==='APPROUVE').length,color:'#10B981'},{icon:'⏳',label:'En attente',value:congesDuMois.filter(c=>c.statut==='EN_ATTENTE').length,color:'#F59E0B'},{icon:'❌',label:'Refusés',value:congesDuMois.filter(c=>c.statut==='REFUSE').length,color:'#EF4444'}].map(s=>(
          <div key={s.label} style={{ background:'#fff', borderRadius:14, border:'1px solid #F1F5F9', padding:'16px 18px', display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:22 }}>{s.icon}</span>
            <div><div style={{ fontSize:22, fontWeight:700, color:s.color }}>{s.value}</div><div style={{ fontSize:11, color:'#94A3B8' }}>{s.label}</div></div>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {[{v:'',l:'Tous'},{v:'APPROUVE',l:'✅ Approuvés'},{v:'EN_ATTENTE',l:'⏳ En attente'},{v:'REFUSE',l:'❌ Refusés'}].map(f=>(
          <button key={f.v} onClick={()=>setFiltreStatut(f.v)} style={{ padding:'6px 14px', borderRadius:20, border:`1.5px solid ${filtreStatut===f.v?'#6366F1':'#E2E8F0'}`, background:filtreStatut===f.v?'#EEF2FF':'#fff', color:filtreStatut===f.v?'#4338CA':'#64748B', fontSize:12, fontWeight:filtreStatut===f.v?700:500, cursor:'pointer' }}>{f.l}</button>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1.3fr 1fr', gap:20 }}>
        <div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', padding:22 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
            <button onClick={()=>currentMonth===0?(setCurrentMonth(11),setCurrentYear(y=>y-1)):setCurrentMonth(m=>m-1)} style={{ background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:8, padding:'6px 14px', cursor:'pointer', fontSize:16, fontWeight:700, color:'#64748B' }}>‹</button>
            <div style={{ textAlign:'center' }}><div style={{ fontSize:17, fontWeight:800, color:'#1E293B' }}>{mois[currentMonth]} {currentYear}</div><div style={{ fontSize:11, color:'#94A3B8' }}>{congesDuMois.length} congé(s)</div></div>
            <button onClick={()=>currentMonth===11?(setCurrentMonth(0),setCurrentYear(y=>y+1)):setCurrentMonth(m=>m+1)} style={{ background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:8, padding:'6px 14px', cursor:'pointer', fontSize:16, fontWeight:700, color:'#64748B' }}>›</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3, marginBottom:6 }}>
            {jours.map(j=><div key={j} style={{ textAlign:'center', fontSize:11, fontWeight:700, color:'#94A3B8', padding:'5px 0', background:'#F8FAFC', borderRadius:6 }}>{j}</div>)}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3 }}>
            {cells.map((day,i) => {
              if(!day) return <div key={i}/>;
              const cj=getCongesForDay(day);
              const isToday=day===today.getDate()&&currentMonth===today.getMonth()&&currentYear===today.getFullYear();
              const isWeekend=(i%7===5)||(i%7===6);
              const hasConge=cj.length>0;
              const hasApprouve=cj.some(c=>c.statut==='APPROUVE');
              const dayKey=`${currentYear}-${currentMonth}-${day}`;
              let bg=isToday?'#EEF2FF':hasApprouve?'#FEF3C7':hasConge?'#FEF9EC':'transparent';
              let border=isToday?'#6366F1':hasApprouve?'#F59E0B':hasConge?'#FCD34D':'transparent';
              return (
                <div key={i} style={{ position:'relative' }} onMouseEnter={()=>setHoveredDay(dayKey)} onMouseLeave={()=>setHoveredDay(null)}>
                  <div style={{ textAlign:'center', padding:'7px 2px 9px', borderRadius:9, cursor:hasConge?'pointer':'default', background:bg, border:`2px solid ${border}` }}>
                    <div style={{ fontSize:12, fontWeight:isToday?800:400, color:isToday?'#4338CA':isWeekend?'#CBD5E1':'#475569' }}>{day}</div>
                    {hasConge&&<div style={{ display:'flex', justifyContent:'center', gap:2, marginTop:3 }}>{cj.slice(0,3).map((c,ci)=><div key={ci} style={{ width:5, height:5, borderRadius:'50%', background:empColors[c.employe?.id]||'#6366F1' }}/>)}</div>}
                  </div>
                  {hoveredDay===dayKey&&hasConge&&(
                    <div style={{ position:'absolute', bottom:'calc(100% + 8px)', left:'50%', transform:'translateX(-50%)', background:'#1E293B', color:'#fff', borderRadius:10, padding:'10px 12px', zIndex:100, minWidth:180, boxShadow:'0 8px 24px rgba(0,0,0,0.25)', pointerEvents:'none' }}>
                      {cj.map((c,ci)=>(
                        <div key={ci} style={{ display:'flex', alignItems:'center', gap:7, marginBottom:ci<cj.length-1?5:0 }}>
                          <div style={{ width:9, height:9, borderRadius:'50%', background:empColors[c.employe?.id]||'#6366F1', flexShrink:0 }}/>
                          <div style={{ flex:1 }}><div style={{ fontSize:12, fontWeight:600 }}>{c.employe?.nom} {c.employe?.prenom}</div><div style={{ fontSize:10, color:'#94A3B8' }}>{c.type}</div></div>
                          <span style={{ fontSize:10, fontWeight:700, color:c.statut==='APPROUVE'?'#34D399':c.statut==='EN_ATTENTE'?'#FCD34D':'#F87171' }}>{c.statut==='APPROUVE'?'✓':c.statut==='EN_ATTENTE'?'⏳':'✗'}</span>
                        </div>
                      ))}
                      <div style={{ position:'absolute', top:'100%', left:'50%', transform:'translateX(-50%)', width:0, height:0, borderLeft:'6px solid transparent', borderRight:'6px solid transparent', borderTop:'6px solid #1E293B' }}/>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop:14, paddingTop:12, borderTop:'1px solid #F1F5F9', display:'flex', gap:10, flexWrap:'wrap' }}>
            {employes.map((e,i)=><div key={e.id} style={{ display:'flex', alignItems:'center', gap:5 }}><div style={{ width:9, height:9, borderRadius:'50%', background:CAL_COLORS[i%CAL_COLORS.length] }}/><span style={{ fontSize:11, color:'#475569' }}>{e.nom} {e.prenom}</span></div>)}
          </div>
        </div>
        <div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', overflow:'hidden' }}>
          <div style={{ padding:'16px 18px', borderBottom:'1px solid #F8FAFC', display:'flex', justifyContent:'space-between' }}>
            <span style={{ fontSize:14, fontWeight:700, color:'#1E293B' }}>📋 {mois[currentMonth]}</span>
            <span style={{ background:'#EEF2FF', color:'#4338CA', borderRadius:20, padding:'3px 10px', fontSize:12, fontWeight:600 }}>{congesDuMois.length} congé(s)</span>
          </div>
          <div style={{ maxHeight:520, overflowY:'auto' }}>
            {congesDuMois.length===0?<div style={{ padding:48, textAlign:'center', color:'#CBD5E1' }}><div style={{ fontSize:40, marginBottom:10 }}>📭</div>Aucun congé</div>
            :congesDuMois.map((c,i)=>{
              const empIdx=employes.findIndex(e=>e.id===c.employe?.id);
              const color=CAL_COLORS[empIdx>=0?empIdx%CAL_COLORS.length:i%CAL_COLORS.length];
              return (
                <div key={i} style={{ display:'flex', gap:12, padding:'14px 16px', borderBottom:'1px solid #F8FAFC', alignItems:'flex-start' }}>
                  <div style={{ width:4, minHeight:44, borderRadius:4, background:color, flexShrink:0 }}/>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}><Avatar nom={c.employe?.nom||'?'} prenom={c.employe?.prenom||''} size={26}/><div><div style={{ fontSize:13, fontWeight:600, color:'#1E293B' }}>{c.employe?.nom} {c.employe?.prenom}</div><div style={{ fontSize:11, color:'#94A3B8' }}>{c.employe?.poste||''}</div></div></div>
                      <CongeStatut statut={c.statut}/>
                    </div>
                    <div style={{ fontSize:11, color:'#94A3B8', marginLeft:34 }}>{c.type} · {c.dateDebut} → {c.dateFin}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('statistiques');
  const [employes, setEmployes] = useState([]);
  const [demandes, setDemandes] = useState([]);
  const [pointages, setPointages] = useState([]);
  const [tousConges, setTousConges] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filtreDate, setFiltreDate] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');
  const [formData, setFormData] = useState({ nom:'', prenom:'', email:'', role:'RH', departement:'', poste:'', equipe:'' });

  useEffect(() => { refreshData(); }, []);
  const refreshData = () => { fetchEmployes(); fetchDemandes(); fetchPointages(); };
  const fetchEmployes = async () => { try { const r=await axios.get(`${API}/utilisateurs`); setEmployes(r.data); chargerTousConges(r.data); } catch(e){} };
  const fetchDemandes  = async () => { try { const r=await axios.get(`${API}/conges/en-attente`); setDemandes(r.data); } catch(e){} };
  const fetchPointages = async () => { try { const r=await axios.get(`${API}/pointages`); setPointages(Array.isArray(r.data)?r.data:[]); } catch(e){} };
  const chargerTousConges = async (emps) => {
    try { const all=[]; for(const emp of emps){ const r=await axios.get(`${API}/conges/mon-suivi/${emp.id}`); if(Array.isArray(r.data)) r.data.forEach(c=>all.push({...c,employe:emp})); } setTousConges(all); } catch(e){}
  };
  const openModal = (emp=null) => {
    if(emp){setEditingEmp(emp);setFormData({nom:emp.nom||'',prenom:emp.prenom||'',email:emp.email||'',role:(emp.role||'RH').toUpperCase(),departement:emp.departement||'',poste:emp.poste||'',equipe:emp.equipe||''});}
    else{setEditingEmp(null);setFormData({nom:'',prenom:'',email:'',role:'RH',departement:'',poste:'',equipe:''});}
    setShowModal(true);
  };
  const handleSubmit = async () => {
    if(!formData.nom||!formData.email){alert('Nom et email obligatoires.');return;}
    setLoading(true);
    try {
      if(editingEmp) await axios.put(`${API}/utilisateurs/${editingEmp.id}`,{...formData,role:formData.role.toUpperCase()});
      else await axios.post(`${API}/utilisateurs`,{...formData,role:formData.role.toUpperCase(),prenom:formData.prenom||formData.nom});
      setShowModal(false);refreshData();
    } catch(e){alert('Erreur: '+(e.response?.data||e.message));}
    finally{setLoading(false);}
  };
  const handleArchive = async (id) => {
    if(!confirm('Archiver cet employé ?')) return;
    try{await axios.put(`${API}/utilisateurs/${id}/archiver`);refreshData();}catch(e){alert('Erreur: '+(e.response?.data||e.message));}
  };
  const handleConge = async (id,action) => {
    try{await axios.put(`${API}/conges/${id}/${action}`);fetchDemandes();chargerTousConges(employes);}catch(e){alert('Erreur: '+(e.response?.data||e.message));}
  };

  const iStyle={width:'100%',padding:'10px 12px',border:'1.5px solid #E2E8F0',borderRadius:10,fontSize:14,color:'#1E293B',outline:'none',background:'#F8FAFC',fontFamily:'inherit',boxSizing:'border-box'};
  const lStyle={fontSize:12,fontWeight:600,color:'#64748B',marginBottom:4,display:'block'};
  const filtered=employes.filter(e=>((e.nom||'')+' '+(e.prenom||'')+' '+(e.email||'')).toLowerCase().includes(search.toLowerCase()));
  const pointagesFiltres=pointages.filter(p=>{if(filtreDate&&p.date!==filtreDate)return false;if(filtreStatut&&p.statut!==filtreStatut)return false;return true;});
  const nbPresents=pointages.filter(p=>p.statut==='present').length;
  const nbRetards=pointages.filter(p=>p.statut==='retard').length;
  const nbAbsents=pointages.filter(p=>p.statut==='absent').length;

  const navItems = [
    { key:'statistiques',icon:'📈', label:'Statistiques',      badge:null },
    { key:'employes',    icon:'👥', label:'Employés',          badge:null },
    { key:'pointages',   icon:'⏱️', label:'Pointages',         badge:null },
    { key:'conges',      icon:'📅', label:'Congés',            badge:demandes.length||null },
    { key:'calendrier',  icon:'🗓️', label:'Calendrier global', badge:null },
    { key:'organigramme',icon:'🏗️', label:'Organigramme',      badge:null },
    { key:'config',      icon:'⚙️', label:'Configuration',     badge:null },
  ];

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#F8FAFC',fontFamily:"'DM Sans','Segoe UI',sans-serif"}}>
      <aside style={{width:240,minWidth:240,background:'#0F172A',display:'flex',flexDirection:'column',position:'fixed',top:0,left:0,bottom:0,zIndex:100}}>
        <div style={{padding:'24px 20px 16px',borderBottom:'1px solid #1E293B'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#6366F1,#8B5CF6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>🏢</div>
            <div><div style={{color:'#F1F5F9',fontWeight:700,fontSize:15}}>SGRH</div><div style={{color:'#64748B',fontSize:11}}>Administration</div></div>
          </div>
        </div>
        <nav style={{flex:1,padding:'16px 10px',overflowY:'auto'}}>
          <div style={{fontSize:10,fontWeight:700,color:'#475569',letterSpacing:'.1em',padding:'0 10px',marginBottom:6}}>PRINCIPAL</div>
          {navItems.slice(0,5).map(item=>(
            <button key={item.key} onClick={()=>setActiveTab(item.key)} style={{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'10px 12px',borderRadius:10,border:'none',cursor:'pointer',textAlign:'left',marginBottom:2,background:activeTab===item.key?'rgba(99,102,241,0.15)':'transparent',color:activeTab===item.key?'#818CF8':'#94A3B8',fontWeight:activeTab===item.key?600:400,fontSize:13,fontFamily:'inherit'}}>
              <span style={{fontSize:16}}>{item.icon}</span>{item.label}
              {item.badge?<span style={{marginLeft:'auto',background:'#EF4444',color:'#fff',borderRadius:20,padding:'1px 7px',fontSize:10,fontWeight:700}}>{item.badge}</span>:null}
            </button>
          ))}
          <div style={{fontSize:10,fontWeight:700,color:'#475569',letterSpacing:'.1em',padding:'12px 10px 6px',marginTop:8}}>SYSTÈME</div>
          {navItems.slice(5).map(item=>(
            <button key={item.key} onClick={()=>setActiveTab(item.key)} style={{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'10px 12px',borderRadius:10,border:'none',cursor:'pointer',textAlign:'left',marginBottom:2,background:activeTab===item.key?'rgba(99,102,241,0.15)':'transparent',color:activeTab===item.key?'#818CF8':'#94A3B8',fontWeight:activeTab===item.key?600:400,fontSize:13,fontFamily:'inherit'}}>
              <span style={{fontSize:16}}>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div style={{padding:'16px 10px',borderTop:'1px solid #1E293B'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:10,background:'#1E293B'}}>
            <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#6366F1,#8B5CF6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:'#fff'}}>AS</div>
            <div><div style={{color:'#F1F5F9',fontSize:12,fontWeight:600}}>Admin Système</div><div style={{color:'#64748B',fontSize:10}}>Administrateur</div></div>
          </div>
        </div>
      </aside>

      <div style={{marginLeft:240,flex:1,display:'flex',flexDirection:'column'}}>
        <header style={{background:'#fff',borderBottom:'1px solid #F1F5F9',padding:'0 32px',height:64,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:50}}>
          <div>
            <div style={{fontSize:18,fontWeight:700,color:'#1E293B'}}>
              {activeTab==='statistiques'&& 'Tableau de bord'}
              {activeTab==='employes'    && 'Gestion des employés'}
              {activeTab==='pointages'   && 'Tous les pointages'}
              {activeTab==='conges'      && 'Demandes de congés'}
              {activeTab==='calendrier'  && 'Calendrier global des congés'}
              {activeTab==='organigramme'&& 'Organigramme de l\'entreprise'}
              {activeTab==='config'      && 'Configuration du système'}
            </div>
            <div style={{fontSize:12,color:'#94A3B8'}}>
              {activeTab==='statistiques'&&'Vue d\'ensemble de l\'activité RH'}
              {activeTab==='employes'   &&`${employes.length} membres`}
              {activeTab==='pointages'  &&`${pointages.length} pointage(s) · ${nbRetards} retard(s)`}
              {activeTab==='conges'     &&`${demandes.length} en attente`}
              {activeTab==='calendrier' &&`${tousConges.length} congé(s) au total`}
              {activeTab==='organigramme'&&`${employes.length} employés · ${new Set(employes.filter(e=>e.departement).map(e=>e.departement)).size} départements`}
              {activeTab==='config'     &&'Paramètres globaux du système'}
            </div>
          </div>
          {activeTab==='employes'&&<button onClick={()=>openModal()} style={{background:'linear-gradient(135deg,#6366F1,#8B5CF6)',color:'#fff',border:'none',padding:'10px 20px',borderRadius:10,fontSize:13,fontWeight:600,cursor:'pointer'}}>＋ Nouvel employé</button>}
        </header>

        <main style={{flex:1,padding:32}}>

          {/* STATISTIQUES */}
          {activeTab==='statistiques'&&<StatistiquesDashboard employes={employes} pointages={pointages}/>}

          {/* EMPLOYÉS */}
          {activeTab==='employes'&&(
            <div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:24}}>
                {[{icon:'👥',label:'Total',value:employes.length,accent:'#6366F1'},{icon:'✅',label:'Actifs',value:employes.filter(e=>e.estActif).length,accent:'#10B981'},{icon:'📅',label:'Congés en attente',value:demandes.length,accent:'#F59E0B'}].map(s=>(
                  <div key={s.label} style={{background:'#fff',borderRadius:14,border:'1px solid #F1F5F9',padding:'18px 20px',display:'flex',alignItems:'center',gap:14}}>
                    <div style={{width:44,height:44,borderRadius:12,background:s.accent+'18',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{s.icon}</div>
                    <div><div style={{fontSize:11,color:'#94A3B8',fontWeight:500}}>{s.label}</div><div style={{fontSize:24,fontWeight:700,color:'#1E293B'}}>{s.value}</div></div>
                  </div>
                ))}
              </div>
              <div style={{background:'#fff',borderRadius:16,border:'1px solid #F1F5F9',overflow:'hidden'}}>
                <div style={{padding:'16px 20px',borderBottom:'1px solid #F8FAFC',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:14,fontWeight:600,color:'#1E293B'}}>Liste du personnel</span>
                  <input placeholder="🔍 Rechercher..." value={search} onChange={e=>setSearch(e.target.value)} style={{padding:'7px 14px',borderRadius:8,border:'1px solid #E2E8F0',fontSize:13,background:'#F8FAFC',outline:'none',width:220}}/>
                </div>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead><tr style={{background:'#F8FAFC'}}>{['Employé','Département','Poste','Rôle','Statut','Actions'].map(h=><th key={h} style={{padding:'10px 16px',textAlign:'left',fontSize:11,fontWeight:700,color:'#94A3B8',textTransform:'uppercase'}}>{h}</th>)}</tr></thead>
                  <tbody>
                    {filtered.map(emp=>(
                      <tr key={emp.id} style={{borderTop:'1px solid #F8FAFC'}} onMouseEnter={e=>e.currentTarget.style.background='#FAFBFF'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <td style={{padding:'12px 16px'}}><div style={{display:'flex',alignItems:'center',gap:10}}><Avatar nom={emp.nom} prenom={emp.prenom} size={36}/><div><div style={{fontSize:13,fontWeight:600,color:'#1E293B'}}>{emp.nom} {emp.prenom}</div><div style={{fontSize:11,color:'#94A3B8'}}>{emp.email}</div></div></div></td>
                        <td style={{padding:'12px 16px',fontSize:13,color:'#475569'}}>{emp.departement||'—'}</td>
                        <td style={{padding:'12px 16px',fontSize:13,color:'#475569'}}>{emp.poste||'—'}</td>
                        <td style={{padding:'12px 16px'}}><RoleBadge role={emp.role}/></td>
                        <td style={{padding:'12px 16px'}}><span style={{display:'flex',alignItems:'center',gap:5,fontSize:12}}><span style={{width:7,height:7,borderRadius:'50%',background:emp.estActif?'#10B981':'#94A3B8',display:'inline-block'}}></span><span style={{color:emp.estActif?'#065F46':'#94A3B8',fontWeight:500}}>{emp.estActif?'Actif':'Archivé'}</span></span></td>
                        <td style={{padding:'12px 16px'}}><div style={{display:'flex',gap:6}}><button onClick={()=>openModal(emp)} style={{padding:'5px 12px',borderRadius:7,border:'1px solid #E2E8F0',background:'#fff',color:'#6366F1',fontSize:12,fontWeight:600,cursor:'pointer'}}>✏️ Modifier</button><button onClick={()=>handleArchive(emp.id)} style={{padding:'5px 12px',borderRadius:7,border:'1px solid #FEE2E2',background:'#FFF5F5',color:'#EF4444',fontSize:12,fontWeight:600,cursor:'pointer'}}>📦 Archiver</button></div></td>
                      </tr>
                    ))}
                    {filtered.length===0&&<tr><td colSpan={6} style={{padding:48,textAlign:'center',color:'#CBD5E1'}}>Aucun employé</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* POINTAGES */}
          {activeTab==='pointages'&&(
            <div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
                {[{icon:'📊',label:'Total',value:pointages.length,accent:'#6366F1'},{icon:'✅',label:'Présents',value:nbPresents,accent:'#10B981'},{icon:'⚠️',label:'Retards',value:nbRetards,accent:'#F59E0B'},{icon:'❌',label:'Absents',value:nbAbsents,accent:'#EF4444'}].map(s=>(
                  <div key={s.label} style={{background:'#fff',borderRadius:14,border:'1px solid #F1F5F9',padding:'16px 18px',display:'flex',alignItems:'center',gap:12}}>
                    <div style={{width:40,height:40,borderRadius:10,background:s.accent+'18',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{s.icon}</div>
                    <div><div style={{fontSize:11,color:'#94A3B8',fontWeight:500}}>{s.label}</div><div style={{fontSize:22,fontWeight:700,color:'#1E293B'}}>{s.value}</div></div>
                  </div>
                ))}
              </div>
              <div style={{background:'#fff',borderRadius:16,border:'1px solid #F1F5F9',overflow:'hidden'}}>
                <div style={{padding:'16px 20px',borderBottom:'1px solid #F8FAFC',display:'flex',alignItems:'center',gap:12}}>
                  <span style={{fontSize:14,fontWeight:600,color:'#1E293B',flex:1}}>Tous les pointages</span>
                  <input type="date" value={filtreDate} onChange={e=>setFiltreDate(e.target.value)} style={{padding:'7px 12px',borderRadius:8,border:'1px solid #E2E8F0',fontSize:13,outline:'none',background:'#F8FAFC'}}/>
                  <select value={filtreStatut} onChange={e=>setFiltreStatut(e.target.value)} style={{padding:'7px 12px',borderRadius:8,border:'1px solid #E2E8F0',fontSize:13,outline:'none',background:'#F8FAFC'}}>
                    <option value="">Tous</option><option value="present">Présent</option><option value="retard">Retard</option><option value="absent">Absent</option>
                  </select>
                  {(filtreDate||filtreStatut)&&<button onClick={()=>{setFiltreDate('');setFiltreStatut('');}} style={{padding:'7px 12px',borderRadius:8,border:'1px solid #E2E8F0',background:'#fff',fontSize:12,cursor:'pointer',color:'#64748B'}}>✕</button>}
                </div>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead><tr style={{background:'#F8FAFC'}}>{['Employé','Date','Entrée','Sortie','Statut'].map(h=><th key={h} style={{padding:'10px 16px',textAlign:'left',fontSize:11,fontWeight:700,color:'#94A3B8',textTransform:'uppercase'}}>{h}</th>)}</tr></thead>
                  <tbody>
                    {pointagesFiltres.length===0?<tr><td colSpan={5} style={{padding:48,textAlign:'center',color:'#CBD5E1'}}>Aucun pointage</td></tr>
                    :pointagesFiltres.map(p=>(
                      <tr key={p.id} style={{borderTop:'1px solid #F8FAFC'}} onMouseEnter={e=>e.currentTarget.style.background='#FAFBFF'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <td style={{padding:'12px 16px'}}><div style={{display:'flex',alignItems:'center',gap:8}}><Avatar nom={p.employe?.nom} prenom={p.employe?.prenom} size={30}/><div><div style={{fontSize:13,fontWeight:600,color:'#1E293B'}}>{p.employe?.nom} {p.employe?.prenom}</div><div style={{fontSize:11,color:'#94A3B8'}}>{p.employe?.poste||''}</div></div></div></td>
                        <td style={{padding:'12px 16px',fontSize:13,color:'#475569'}}>{p.date}</td>
                        <td style={{padding:'12px 16px',fontSize:13,color:'#10B981',fontWeight:600}}>{p.heureEntree?.substring(0,5)||'—'}</td>
                        <td style={{padding:'12px 16px',fontSize:13,color:'#6366F1',fontWeight:600}}>{p.heureSortie?.substring(0,5)||'—'}</td>
                        <td style={{padding:'12px 16px'}}><PointageBadge statut={p.statut}/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CONGÉS */}
          {activeTab==='conges'&&(
            <div>
              {demandes.length===0?(
                <div style={{background:'#fff',borderRadius:16,border:'1px solid #F1F5F9',padding:64,textAlign:'center'}}>
                  <div style={{fontSize:48,marginBottom:12}}>🎉</div>
                  <div style={{fontSize:16,fontWeight:600,color:'#1E293B'}}>Aucune demande en attente</div>
                </div>
              ):demandes.map(d=>(
                <div key={d.id} style={{background:'#fff',borderRadius:14,border:'1px solid #F1F5F9',padding:'18px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                  <div style={{display:'flex',alignItems:'center',gap:14}}>
                    <Avatar nom={d.employe?.nom||d.utilisateur?.nom||'?'} prenom={d.employe?.prenom||d.utilisateur?.prenom||''} size={44}/>
                    <div>
                      <div style={{fontSize:14,fontWeight:600,color:'#1E293B',marginBottom:4}}>{d.employe?.nom||d.utilisateur?.nom||'Employé'} {d.employe?.prenom||d.utilisateur?.prenom||''}</div>
                      <div style={{display:'flex',gap:8,fontSize:12,color:'#64748B'}}>
                        <span style={{background:'#EEF2FF',color:'#4338CA',padding:'2px 9px',borderRadius:20,fontSize:11,fontWeight:600}}>{d.type||'Congé'}</span>
                        <span>📆 {d.dateDebut} → {d.dateFin}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <button onClick={()=>handleConge(d.id,'approuver')} style={{padding:'8px 16px',borderRadius:9,background:'#ECFDF5',color:'#065F46',border:'1px solid #A7F3D0',fontSize:13,fontWeight:600,cursor:'pointer'}}>✅ Accepter</button>
                    <button onClick={()=>handleConge(d.id,'refuser')} style={{padding:'8px 16px',borderRadius:9,background:'#FEF2F2',color:'#991B1B',border:'1px solid #FECACA',fontSize:13,fontWeight:600,cursor:'pointer'}}>❌ Refuser</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CALENDRIER */}
          {activeTab==='calendrier'&&<CalendrierGlobal tousConges={tousConges} employes={employes}/>}

          {/* ORGANIGRAMME */}
          {activeTab==='organigramme'&&<Organigramme employes={employes}/>}

          {/* CONFIGURATION */}
          {activeTab==='config'&&<ConfigSysteme/>}

        </main>
      </div>

      {/* MODAL */}
      {showModal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(15,23,42,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200,backdropFilter:'blur(4px)'}}>
          <div style={{background:'#fff',borderRadius:20,width:'100%',maxWidth:480,maxHeight:'90vh',overflowY:'auto',padding:32,margin:16,boxShadow:'0 24px 64px rgba(0,0,0,0.18)'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
              <div><div style={{fontSize:18,fontWeight:700,color:'#1E293B'}}>{editingEmp?"✏️ Modifier l'employé":'➕ Nouvel employé'}</div><div style={{fontSize:12,color:'#94A3B8',marginTop:2}}>{editingEmp?`${editingEmp.nom} ${editingEmp.prenom}`:'Remplir les informations'}</div></div>
              <button onClick={()=>setShowModal(false)} style={{background:'#F1F5F9',border:'none',width:32,height:32,borderRadius:8,cursor:'pointer',fontSize:16,color:'#64748B'}}>✕</button>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div><label style={lStyle}>Nom *</label><input style={iStyle} placeholder="Nom" value={formData.nom} onChange={e=>setFormData({...formData,nom:e.target.value})}/></div>
                <div><label style={lStyle}>Prénom</label><input style={iStyle} placeholder="Prénom" value={formData.prenom} onChange={e=>setFormData({...formData,prenom:e.target.value})}/></div>
              </div>
              <div><label style={lStyle}>Email *</label><input style={iStyle} type="email" placeholder="email@sgrh.com" value={formData.email} onChange={e=>setFormData({...formData,email:e.target.value})}/></div>
              <div><label style={lStyle}>Rôle</label><select style={iStyle} value={formData.role} onChange={e=>setFormData({...formData,role:e.target.value})}><option value="RH">RH</option><option value="EMPLOYE">Employé</option><option value="ADMIN">Administrateur</option></select></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div><label style={lStyle}>Département</label><input style={iStyle} placeholder="ex: RH, IT..." value={formData.departement} onChange={e=>setFormData({...formData,departement:e.target.value})}/></div>
                <div><label style={lStyle}>Équipe</label><input style={iStyle} placeholder="ex: Equipe A..." value={formData.equipe} onChange={e=>setFormData({...formData,equipe:e.target.value})}/></div>
              </div>
              <div><label style={lStyle}>Poste</label><input style={iStyle} placeholder="ex: Développeur..." value={formData.poste} onChange={e=>setFormData({...formData,poste:e.target.value})}/></div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:28,justifyContent:'flex-end'}}>
              <button onClick={()=>setShowModal(false)} style={{padding:'10px 20px',borderRadius:10,border:'1.5px solid #E2E8F0',background:'#fff',color:'#64748B',fontSize:13,fontWeight:600,cursor:'pointer'}}>Annuler</button>
              <button onClick={handleSubmit} disabled={loading} style={{padding:'10px 24px',borderRadius:10,border:'none',background:loading?'#A5B4FC':'linear-gradient(135deg,#6366F1,#8B5CF6)',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer'}}>{loading?'⏳...':(editingEmp?'✅ Enregistrer':'✅ Créer')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}