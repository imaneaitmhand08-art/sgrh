"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';

const API = 'http://localhost:8080/api';
const COLORS = ['#4F46E5','#0891B2','#059669','#D97706','#DC2626','#7C3AED','#DB2777'];

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
function StatutEval({ statut }) {
  const cfg = { EN_COURS:{label:'En cours',bg:'#EEF2FF',color:'#4338CA',border:'#C7D2FE'}, TERMINE:{label:'Terminé',bg:'#ECFDF5',color:'#065F46',border:'#A7F3D0'} };
  const c = cfg[statut]||{label:statut||'—',bg:'#F9FAFB',color:'#374151',border:'#E5E7EB'};
  return <span style={{ background:c.bg, color:c.color, border:`1px solid ${c.border}`, borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:600 }}>{c.label}</span>;
}
function BadgeContrat({ type }) {
  const cfg = { CDI:{label:'CDI',bg:'#ECFDF5',color:'#065F46',border:'#A7F3D0'}, CDD:{label:'CDD',bg:'#FFFBEB',color:'#92400E',border:'#FDE68A'}, Stage:{label:'Stage',bg:'#EEF2FF',color:'#4338CA',border:'#C7D2FE'} };
  const c = cfg[type]||{label:type||'—',bg:'#F9FAFB',color:'#374151',border:'#E5E7EB'};
  return <span style={{ background:c.bg, color:c.color, border:`1px solid ${c.border}`, borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:600 }}>{c.label}</span>;
}
function BadgeFormation({ statut }) {
  const cfg = { PLANIFIE:{label:'Planifié',bg:'#EEF2FF',color:'#4338CA',border:'#C7D2FE'}, TERMINE:{label:'Terminé',bg:'#ECFDF5',color:'#065F46',border:'#A7F3D0'}, EN_COURS:{label:'En cours',bg:'#FFFBEB',color:'#92400E',border:'#FDE68A'} };
  const c = cfg[statut]||{label:statut||'—',bg:'#F9FAFB',color:'#374151',border:'#E5E7EB'};
  return <span style={{ background:c.bg, color:c.color, border:`1px solid ${c.border}`, borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:600 }}>{c.label}</span>;
}
function BadgeSanction({ type }) {
  const cfg = {
    Avertissement: { label:'Avertissement', bg:'#FFFBEB', color:'#92400E', border:'#FDE68A' },
    'Mise à pied': { label:'Mise à pied', bg:'#FEF2F2', color:'#991B1B', border:'#FECACA' },
    Blâme: { label:'Blâme', bg:'#FEF2F2', color:'#991B1B', border:'#FECACA' },
  };
  const c = cfg[type] || { label:type||'—', bg:'#F9FAFB', color:'#374151', border:'#E5E7EB' };
  return <span style={{ background:c.bg, color:c.color, border:`1px solid ${c.border}`, borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:600 }}>{c.label}</span>;
}
function BadgeDepart({ statut }) {
  const cfg = {
    EN_COURS: { label:'En cours', bg:'#FFFBEB', color:'#92400E', border:'#FDE68A' },
    VALIDE:   { label:'Validée', bg:'#ECFDF5', color:'#065F46', border:'#A7F3D0' },
    ANNULE:   { label:'Annulée', bg:'#F9FAFB', color:'#374151', border:'#E5E7EB' },
  };
  const c = cfg[statut] || { label:statut||'—', bg:'#F9FAFB', color:'#374151', border:'#E5E7EB' };
  return <span style={{ background:c.bg, color:c.color, border:`1px solid ${c.border}`, borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:600 }}>{c.label}</span>;
}
function StarRating({ note, max=10 }) {
  const pct = Math.round((note/max)*100);
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <div style={{ flex:1, height:8, background:'#F1F5F9', borderRadius:8 }}>
        <div style={{ height:'100%', width:`${pct}%`, background:pct>=70?'#10B981':pct>=40?'#F59E0B':'#EF4444', borderRadius:8 }}/>
      </div>
      <span style={{ fontSize:13, fontWeight:700, color:'#1E293B', minWidth:36 }}>{note}/10</span>
    </div>
  );
}
function formatNotifDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('fr-FR', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });
}

// ═══ GÉNÉRATION PDF DU CONTRAT ═══
function genererPdfContrat(contrat, employe) {
  const doc = new jsPDF({ unit:'mm', format:'a4' });
  const pageWidth = 210;
  const marginX = 20;
  let y = 24;

  // En-tête entreprise
  doc.setFillColor(99,102,241);
  doc.rect(0, 0, pageWidth, 16, 'F');
  doc.setTextColor(255,255,255);
  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  doc.text('SGRH — Système de Gestion des Ressources Humaines', marginX, 10.5);

  y = 30;
  doc.setTextColor(30,41,59);
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('Contrat de travail', marginX, y);

  y += 7;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(148,163,184);
  doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')}`, marginX, y);

  y += 10;
  doc.setDrawColor(226,232,240);
  doc.line(marginX, y, pageWidth - marginX, y);

  // Bloc employé
  y += 10;
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(30,41,59);
  doc.text('Informations employé', marginX, y);

  y += 8;
  doc.setFontSize(10.5);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(71,85,105);
  const infosEmploye = [
    ['Nom et prénom', `${employe?.nom||''} ${employe?.prenom||''}`],
    ['Email', employe?.email || '—'],
    ['Poste', employe?.poste || '—'],
    ['Département', employe?.departement || '—'],
  ];
  infosEmploye.forEach(([label, value]) => {
    doc.setFont(undefined, 'bold');
    doc.text(`${label} :`, marginX, y);
    doc.setFont(undefined, 'normal');
    doc.text(String(value), marginX + 45, y);
    y += 7;
  });

  y += 5;
  doc.setDrawColor(226,232,240);
  doc.line(marginX, y, pageWidth - marginX, y);

  // Bloc contrat
  y += 10;
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(30,41,59);
  doc.text('Détails du contrat', marginX, y);

  y += 8;
  doc.setFontSize(10.5);
  const salaireFmt = contrat?.salaireBrut ? `${Number(contrat.salaireBrut).toLocaleString('fr-FR')} MAD` : '—';
  const infosContrat = [
    ['Type de contrat', contrat?.type || '—'],
    ['Statut', contrat?.statut === 'actif' ? 'Actif' : 'Terminé'],
    ['Date de début', contrat?.dateDebut || '—'],
    ['Date de fin', contrat?.dateFin || 'Indéterminé'],
    ['Salaire brut mensuel', salaireFmt],
  ];
  infosContrat.forEach(([label, value]) => {
    doc.setFont(undefined, 'bold');
    doc.setTextColor(71,85,105);
    doc.text(`${label} :`, marginX, y);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(30,41,59);
    doc.text(String(value), marginX + 55, y);
    y += 7;
  });

  // Pied de page
  y += 20;
  doc.setDrawColor(226,232,240);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 10;
  doc.setFontSize(9);
  doc.setTextColor(148,163,184);
  doc.setFont(undefined, 'italic');
  doc.text('Document généré automatiquement par le système SGRH — Service Ressources Humaines.', marginX, y);

  const nomFichier = `Contrat_${(employe?.nom||'employe').replace(/\s+/g,'_')}_${(contrat?.dateDebut||'').replace(/-/g,'')}.pdf`;
  doc.save(nomFichier);
}

export default function EmployeDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('pointage');
  const [employeInfo, setEmployeInfo] = useState(null);
  const [employeId, setEmployeId] = useState(null);
  const [pointageAujourdhui, setPointageAujourdhui] = useState(null);
  const [historiquePointages, setHistoriquePointages] = useState([]);
  const [statsPointage, setStatsPointage] = useState(null);
  const [mesConges, setMesConges] = useState([]);
  const [soldeConges, setSoldeConges] = useState(null);
  const [mesEvaluations, setMesEvaluations] = useState([]);
  const [mesContrats, setMesContrats] = useState([]);
  const [mesFormations, setMesFormations] = useState([]);
  const [mesSanctions, setMesSanctions] = useState([]);
  const [loadingPointage, setLoadingPointage] = useState(false);
  const [loadingConge, setLoadingConge] = useState(false);
  const [congeForm, setCongeForm] = useState({ type:'Annuel', motif:'', dateDebut:'', dateFin:'' });
  const [notifications, setNotifications] = useState([]);
  const [notifNonLues, setNotifNonLues] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);

  const deconnexion = () => { localStorage.removeItem('user'); router.push('/login'); };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user')||'null');
    if (user) {
      setEmployeInfo(user);
      setEmployeId(user.id);
      chargerPointageAujourdhui(user.id);
      chargerHistorique(user.id);
      chargerStats(user.id);
      chargerMesConges(user.id);
      chargerSoldeConges(user.id);
      chargerMesEvaluations(user.id);
      chargerMesContrats(user.id);
      chargerMesFormations(user.id);
      chargerMesSanctions(user.id);
      chargerNotifications(user.id);
      chargerNotifNonLues(user.id);
    }
  }, []);

  const chargerPointageAujourdhui = async (id) => { try { const r=await axios.get(`${API}/pointages/aujourd-hui/${id}`); setPointageAujourdhui(r.data); } catch(e){} };
  const chargerHistorique = async (id) => { try { const r=await axios.get(`${API}/pointages/employe/${id}`); setHistoriquePointages(Array.isArray(r.data)?r.data:[]); } catch(e){} };
  const chargerStats = async (id) => { try { const r=await axios.get(`${API}/pointages/stats/${id}`); setStatsPointage(r.data); } catch(e){} };
  const chargerMesConges = async (id) => { try { const r=await axios.get(`${API}/conges/mon-suivi/${id}`); setMesConges(Array.isArray(r.data)?r.data:[]); } catch(e){} };
  const chargerSoldeConges = async (id) => { try { const r=await axios.get(`${API}/conges/solde/${id}`); setSoldeConges(r.data); } catch(e){} };
  const chargerMesEvaluations = async (id) => { try { const r=await axios.get(`${API}/evaluations/employe/${id}`); setMesEvaluations(Array.isArray(r.data)?r.data:[]); } catch(e){} };
  const chargerMesContrats = async (id) => { try { const r=await axios.get(`${API}/contrats/employe/${id}`); setMesContrats(Array.isArray(r.data)?r.data:[]); } catch(e){} };
  const chargerMesFormations = async (id) => { try { const r=await axios.get(`${API}/formations/employe/${id}`); setMesFormations(Array.isArray(r.data)?r.data:[]); } catch(e){} };
  const chargerMesSanctions = async (id) => { try { const r=await axios.get(`${API}/sanctions/employe/${id}`); setMesSanctions(Array.isArray(r.data)?r.data:[]); } catch(e){} };
  const chargerNotifications = async (id) => { try { const r=await axios.get(`${API}/notifications/employe/${id}`); setNotifications(Array.isArray(r.data)?r.data:[]); } catch(e){} };
  const chargerNotifNonLues = async (id) => { try { const r=await axios.get(`${API}/notifications/non-lues/${id}`); setNotifNonLues(r.data?.nonLues||0); } catch(e){} };

  const pointerEntree = async () => {
    setLoadingPointage(true);
    try { const r=await axios.post(`${API}/pointages/entree/${employeId}`); setPointageAujourdhui(r.data); chargerHistorique(employeId); chargerStats(employeId); }
    catch(e){ alert('Erreur: '+(e.response?.data||e.message)); }
    finally{ setLoadingPointage(false); }
  };
  const pointerSortie = async () => {
    setLoadingPointage(true);
    try { const r=await axios.put(`${API}/pointages/sortie/${employeId}`); setPointageAujourdhui(r.data); chargerHistorique(employeId); }
    catch(e){ alert('Erreur: '+(e.response?.data||e.message)); }
    finally{ setLoadingPointage(false); }
  };
  const soumettreConge = async () => {
    if (!congeForm.dateDebut||!congeForm.dateFin){ alert('Dates obligatoires.'); return; }
    setLoadingConge(true);
    try { await axios.post(`${API}/conges`, {...congeForm, employeId}); setCongeForm({type:'Annuel',motif:'',dateDebut:'',dateFin:''}); chargerMesConges(employeId); chargerSoldeConges(employeId); }
    catch(e){ alert('Erreur: '+(e.response?.data||e.message)); }
    finally{ setLoadingConge(false); }
  };
  const marquerNotifLue = async (notifId) => {
    try { await axios.put(`${API}/notifications/${notifId}/lire`); chargerNotifications(employeId); chargerNotifNonLues(employeId); } catch(e){}
  };
  const marquerToutesLues = async () => {
    try { await axios.put(`${API}/notifications/lire-tout/${employeId}`); chargerNotifications(employeId); chargerNotifNonLues(employeId); } catch(e){}
  };

  const iStyle = { width:'100%', padding:'10px 12px', border:'1.5px solid #E2E8F0', borderRadius:10, fontSize:14, color:'#1E293B', outline:'none', background:'#F8FAFC', fontFamily:'inherit', boxSizing:'border-box' };
  const lStyle = { fontSize:12, fontWeight:600, color:'#64748B', marginBottom:4, display:'block' };
  const now = new Date();
  const timeStr = now.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
  const dateStr = now.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});

  const navItems = [
    { key:'pointage',    icon:'⏱️', label:'Mon pointage' },
    { key:'conges',      icon:'📅', label:'Mes congés' },
    { key:'evaluations', icon:'⭐', label:'Mes évaluations' },
    { key:'contrats',    icon:'📄', label:'Mon contrat' },
    { key:'formations',  icon:'🎓', label:'Mes formations' },
    { key:'sanctions',   icon:'⚠️', label:'Sanctions' },
    { key:'profil',      icon:'👤', label:'Mon profil' },
  ];

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#F8FAFC', fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      <aside style={{ width:240, minWidth:240, background:'#0F172A', display:'flex', flexDirection:'column', position:'fixed', top:0, left:0, bottom:0, zIndex:100 }}>
        <div style={{ padding:'24px 20px 16px', borderBottom:'1px solid #1E293B' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#6366F1,#8B5CF6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>👤</div>
            <div><div style={{ color:'#F1F5F9', fontWeight:700, fontSize:15 }}>SGRH</div><div style={{ color:'#64748B', fontSize:11 }}>Espace Employé</div></div>
          </div>
        </div>
        <nav style={{ flex:1, padding:'16px 10px', overflowY:'auto' }}>
          <div style={{ fontSize:10, fontWeight:700, color:'#475569', letterSpacing:'.1em', padding:'0 10px', marginBottom:6 }}>MENU</div>
          {navItems.map(item => (
            <button key={item.key} onClick={()=>setActiveTab(item.key)} style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 12px', borderRadius:10, border:'none', cursor:'pointer', textAlign:'left', marginBottom:2, background:activeTab===item.key?'rgba(99,102,241,0.15)':'transparent', color:activeTab===item.key?'#818CF8':'#94A3B8', fontWeight:activeTab===item.key?600:400, fontSize:13, fontFamily:'inherit' }}>
              <span style={{ fontSize:16 }}>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding:'16px 10px', borderTop:'1px solid #1E293B' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, background:'#1E293B', marginBottom:8 }}>
            <Avatar nom={employeInfo?.nom} prenom={employeInfo?.prenom} size={32}/>
            <div><div style={{ color:'#F1F5F9', fontSize:12, fontWeight:600 }}>{employeInfo?.nom} {employeInfo?.prenom}</div><div style={{ color:'#64748B', fontSize:10 }}>{employeInfo?.poste||'Employé'}</div></div>
          </div>
          <button onClick={deconnexion} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'10px 12px', borderRadius:10, border:'1px solid #1E293B', background:'transparent', color:'#94A3B8', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}
            onMouseEnter={e=>{e.currentTarget.style.background='#7F1D1D';e.currentTarget.style.color='#FCA5A5';e.currentTarget.style.borderColor='#7F1D1D';}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#94A3B8';e.currentTarget.style.borderColor='#1E293B';}}>
            🚪 Déconnexion
          </button>
        </div>
      </aside>

      <div style={{ marginLeft:240, flex:1, display:'flex', flexDirection:'column' }}>
        <header style={{ background:'#fff', borderBottom:'1px solid #F1F5F9', padding:'0 32px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
          <div>
            <div style={{ fontSize:18, fontWeight:700, color:'#1E293B' }}>
              {activeTab==='pointage'    && 'Mon pointage'}
              {activeTab==='conges'      && 'Mes congés'}
              {activeTab==='evaluations' && 'Mes évaluations'}
              {activeTab==='contrats'    && 'Mon contrat'}
              {activeTab==='formations'  && 'Mes formations'}
              {activeTab==='sanctions'   && 'Sanctions'}
              {activeTab==='profil'      && 'Mon profil'}
            </div>
            <div style={{ fontSize:12, color:'#94A3B8' }}>
              {activeTab==='pointage'    && dateStr}
              {activeTab==='conges'      && `${mesConges.length} demande(s)`}
              {activeTab==='evaluations' && `${mesEvaluations.length} évaluation(s)`}
              {activeTab==='contrats'    && `${mesContrats.length} contrat(s)`}
              {activeTab==='formations'  && `${mesFormations.length} formation(s)`}
              {activeTab==='sanctions'   && `${mesSanctions.length} sanction(s)`}
            </div>
          </div>

          <div style={{ position:'relative' }}>
            <button onClick={()=>setNotifOpen(!notifOpen)} style={{ position:'relative', width:40, height:40, borderRadius:10, border:'1px solid #F1F5F9', background:'#F8FAFC', cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center' }}>
              🔔
              {notifNonLues>0 && <span style={{ position:'absolute', top:-4, right:-4, background:'#EF4444', color:'#fff', borderRadius:'50%', minWidth:18, height:18, fontSize:10, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 4px' }}>{notifNonLues}</span>}
            </button>
            {notifOpen && (
              <div style={{ position:'absolute', top:48, right:0, width:340, background:'#fff', borderRadius:14, border:'1px solid #F1F5F9', boxShadow:'0 8px 24px rgba(0,0,0,0.12)', zIndex:200, maxHeight:420, overflow:'hidden', display:'flex', flexDirection:'column' }}>
                <div style={{ padding:'14px 16px', borderBottom:'1px solid #F8FAFC', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:14, fontWeight:700, color:'#1E293B' }}>Notifications</span>
                  {notifNonLues>0 && <button onClick={marquerToutesLues} style={{ fontSize:11, color:'#6366F1', border:'none', background:'none', cursor:'pointer', fontWeight:600 }}>Tout marquer lu</button>}
                </div>
                <div style={{ overflowY:'auto', flex:1 }}>
                  {notifications.length===0 ? (
                    <div style={{ padding:32, textAlign:'center', color:'#CBD5E1', fontSize:13 }}>Aucune notification</div>
                  ) : notifications.map(n=>(
                    <div key={n.id} onClick={()=>!n.estLue && marquerNotifLue(n.id)} style={{ padding:'12px 16px', borderBottom:'1px solid #F8FAFC', cursor:n.estLue?'default':'pointer', background:n.estLue?'#fff':'#EEF2FF' }}>
                      <div style={{ fontSize:13, color:'#1E293B', marginBottom:4, fontWeight:n.estLue?400:600 }}>{n.message}</div>
                      <div style={{ fontSize:11, color:'#94A3B8' }}>{formatNotifDate(n.creeLe)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        <main style={{ flex:1, padding:32 }}>

          {/* POINTAGE */}
          {activeTab==='pointage' && (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
                {[
                  {icon:'✅',label:'Présents',value:statsPointage?.presents||0,accent:'#10B981'},
                  {icon:'⚠️',label:'Retards',value:statsPointage?.retards||0,accent:'#F59E0B'},
                  {icon:'❌',label:'Absences',value:statsPointage?.absents||0,accent:'#EF4444'},
                  {icon:'📊',label:'Total',value:statsPointage?.total||0,accent:'#6366F1'},
                ].map(s=>(
                  <div key={s.label} style={{ background:'#fff', borderRadius:14, border:'1px solid #F1F5F9', padding:'16px 18px', display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:s.accent+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{s.icon}</div>
                    <div><div style={{ fontSize:11, color:'#94A3B8', fontWeight:500 }}>{s.label}</div><div style={{ fontSize:22, fontWeight:700, color:'#1E293B' }}>{s.value}</div></div>
                  </div>
                ))}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
                <div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', padding:28 }}>
                  <div style={{ fontSize:15, fontWeight:700, color:'#1E293B', marginBottom:6 }}>⏱️ Pointage du jour</div>
                  <div style={{ fontSize:13, color:'#94A3B8', marginBottom:20 }}>{dateStr}</div>
                  <div style={{ fontSize:48, fontWeight:800, color:'#1E293B', textAlign:'center', marginBottom:8 }}>{timeStr}</div>
                  {pointageAujourdhui ? (
                    <div>
                      <div style={{ background:'#F8FAFC', borderRadius:12, padding:16, marginBottom:16 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}><span style={{ fontSize:13, color:'#94A3B8' }}>Entrée</span><span style={{ fontSize:13, fontWeight:700, color:'#10B981' }}>✅ {pointageAujourdhui.heureEntree?.substring(0,5)||'—'}</span></div>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}><span style={{ fontSize:13, color:'#94A3B8' }}>Sortie</span><span style={{ fontSize:13, fontWeight:700, color:pointageAujourdhui.heureSortie?'#6366F1':'#CBD5E1' }}>{pointageAujourdhui.heureSortie?'✅ '+pointageAujourdhui.heureSortie.substring(0,5):'En attente...'}</span></div>
                        <div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ fontSize:13, color:'#94A3B8' }}>Statut</span><PointageBadge statut={pointageAujourdhui.statut}/></div>
                      </div>
                      {!pointageAujourdhui.heureSortie && <button onClick={pointerSortie} disabled={loadingPointage} style={{ width:'100%', padding:'13px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#6366F1,#8B5CF6)', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer' }}>{loadingPointage?'⏳...':'🚪 Pointer la sortie'}</button>}
                      {pointageAujourdhui.heureSortie && <div style={{ textAlign:'center', padding:14, background:'#ECFDF5', borderRadius:10, fontSize:14, fontWeight:600, color:'#065F46' }}>✅ Journée complète</div>}
                    </div>
                  ) : (
                    <div>
                      <div style={{ textAlign:'center', padding:20, background:'#F8FAFC', borderRadius:12, marginBottom:16, color:'#94A3B8', fontSize:13 }}>Pas encore pointé aujourd'hui</div>
                      <button onClick={pointerEntree} disabled={loadingPointage} style={{ width:'100%', padding:'13px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#10B981,#059669)', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer' }}>{loadingPointage?'⏳...':'🟢 Pointer l\'entrée'}</button>
                    </div>
                  )}
                </div>
                <div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', overflow:'hidden' }}>
                  <div style={{ padding:'16px 20px', borderBottom:'1px solid #F8FAFC' }}><span style={{ fontSize:15, fontWeight:700, color:'#1E293B' }}>📜 Historique</span></div>
                  <div style={{ maxHeight:380, overflowY:'auto' }}>
                    {historiquePointages.length===0 ? <div style={{ padding:40, textAlign:'center', color:'#CBD5E1' }}>Aucun pointage</div>
                    : historiquePointages.slice(0,20).map(p=>(
                      <div key={p.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 16px', borderBottom:'1px solid #F8FAFC' }}>
                        <div><div style={{ fontSize:13, fontWeight:600, color:'#1E293B' }}>{p.date}</div><div style={{ fontSize:11, color:'#94A3B8' }}>🟢 {p.heureEntree?.substring(0,5)||'—'} → 🔴 {p.heureSortie?.substring(0,5)||'—'}</div></div>
                        <PointageBadge statut={p.statut}/>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CONGÉS */}
          {activeTab==='conges' && (
            <div>
              {soldeConges && (
                <div style={{ background:'linear-gradient(135deg,#6366F1,#8B5CF6)', borderRadius:16, padding:'24px 28px', marginBottom:24, color:'#fff', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontSize:13, opacity:0.85, marginBottom:4 }}>🗓️ Solde de congés disponible</div>
                    <div style={{ fontSize:32, fontWeight:800 }}>{soldeConges.soldeRestant} jour{soldeConges.soldeRestant!==1?'s':''}</div>
                  </div>
                  <div style={{ textAlign:'right', fontSize:13, opacity:0.85 }}>
                    <div>{soldeConges.joursAlloues} jours alloués</div>
                    <div>{soldeConges.joursPris} jours pris cette année</div>
                  </div>
                </div>
              )}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
                {[
                  {icon:'⏳',label:'En attente',value:mesConges.filter(d=>d.statut==='EN_ATTENTE').length,accent:'#F59E0B'},
                  {icon:'✅',label:'Approuvés',value:mesConges.filter(d=>d.statut==='APPROUVE').length,accent:'#10B981'},
                  {icon:'❌',label:'Refusés',value:mesConges.filter(d=>d.statut==='REFUSE').length,accent:'#EF4444'},
                ].map(s=>(
                  <div key={s.label} style={{ background:'#fff', borderRadius:14, border:'1px solid #F1F5F9', padding:'18px 20px', display:'flex', alignItems:'center', gap:14 }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:s.accent+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{s.icon}</div>
                    <div><div style={{ fontSize:11, color:'#94A3B8', fontWeight:500 }}>{s.label}</div><div style={{ fontSize:24, fontWeight:700, color:'#1E293B' }}>{s.value}</div></div>
                  </div>
                ))}
              </div>
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
                    <button onClick={soumettreConge} disabled={loadingConge} style={{ padding:'11px', borderRadius:10, border:'none', background:loadingConge?'#6EE7B7':'linear-gradient(135deg,#10B981,#059669)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>{loadingConge?'⏳...':'📤 Envoyer'}</button>
                    <div style={{ fontSize:11, color:'#94A3B8', textAlign:'center' }}>ℹ️ Validée par l'administrateur</div>
                  </div>
                </div>
                <div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', overflow:'hidden' }}>
                  <div style={{ padding:'16px 20px', borderBottom:'1px solid #F8FAFC' }}><span style={{ fontSize:15, fontWeight:700, color:'#1E293B' }}>📜 Mes demandes</span></div>
                  <div style={{ padding:8 }}>
                    {mesConges.length===0 ? <div style={{ padding:40, textAlign:'center', color:'#CBD5E1' }}>Aucune demande</div>
                    : mesConges.map(d=>(
                      <div key={d.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 14px', borderRadius:10, marginBottom:4, background:'#F8FAFC' }}>
                        <div><div style={{ fontSize:13, fontWeight:600, color:'#1E293B' }}>{d.type}</div><div style={{ fontSize:11, color:'#94A3B8' }}>📆 {d.dateDebut} → {d.dateFin}</div></div>
                        <StatutConge statut={d.statut}/>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ÉVALUATIONS */}
          {activeTab==='evaluations' && (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
                {[
                  {icon:'⭐',label:'Total',value:mesEvaluations.length,accent:'#6366F1'},
                  {icon:'✅',label:'Terminées',value:mesEvaluations.filter(e=>e.statut==='TERMINE').length,accent:'#10B981'},
                  {icon:'🔄',label:'En cours',value:mesEvaluations.filter(e=>e.statut==='EN_COURS').length,accent:'#F59E0B'},
                ].map(s=>(
                  <div key={s.label} style={{ background:'#fff', borderRadius:14, border:'1px solid #F1F5F9', padding:'18px 20px', display:'flex', alignItems:'center', gap:14 }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:s.accent+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{s.icon}</div>
                    <div><div style={{ fontSize:11, color:'#94A3B8', fontWeight:500 }}>{s.label}</div><div style={{ fontSize:24, fontWeight:700, color:'#1E293B' }}>{s.value}</div></div>
                  </div>
                ))}
              </div>
              {mesEvaluations.length===0 ? (
                <div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', padding:64, textAlign:'center' }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>⭐</div>
                  <div style={{ fontSize:16, fontWeight:600, color:'#1E293B' }}>Aucune évaluation pour le moment</div>
                  <div style={{ fontSize:13, color:'#94A3B8', marginTop:6 }}>Vos évaluations apparaîtront ici une fois créées par le RH</div>
                </div>
              ) : mesEvaluations.map(ev=>(
                <div key={ev.id} style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', padding:24, marginBottom:16, boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                    <div>
                      <div style={{ fontSize:15, fontWeight:700, color:'#1E293B', marginBottom:4 }}>📋 Période : {ev.periode||'—'}</div>
                      <div style={{ fontSize:12, color:'#94A3B8' }}>📅 {ev.dateEvaluation||'—'} · Évaluateur : {ev.evaluateur?.nom||'—'} {ev.evaluateur?.prenom||''}</div>
                    </div>
                    <StatutEval statut={ev.statut}/>
                  </div>
                  {ev.noteGlobale && (
                    <div style={{ marginBottom:16 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:'#64748B', marginBottom:8 }}>🎯 Note globale</div>
                      <StarRating note={ev.noteGlobale}/>
                      <div style={{ marginTop:6, fontSize:12, fontWeight:600, color:ev.noteGlobale>=7?'#065F46':ev.noteGlobale>=4?'#92400E':'#991B1B' }}>
                        {ev.noteGlobale>=7?'✅ Excellent':ev.noteGlobale>=4?'⚠️ Satisfaisant':'❌ À améliorer'}
                      </div>
                    </div>
                  )}
                  {ev.objectifs && <div style={{ marginBottom:12 }}><div style={{ fontSize:12, fontWeight:600, color:'#64748B', marginBottom:6 }}>🎯 Objectifs</div><div style={{ fontSize:13, color:'#475569', background:'#F8FAFC', padding:'10px 14px', borderRadius:10 }}>{ev.objectifs}</div></div>}
                  {ev.commentaire && <div><div style={{ fontSize:12, fontWeight:600, color:'#64748B', marginBottom:6 }}>💬 Commentaire</div><div style={{ fontSize:13, color:'#475569', background:'#F8FAFC', padding:'10px 14px', borderRadius:10, fontStyle:'italic' }}>{ev.commentaire}</div></div>}
                </div>
              ))}
            </div>
          )}

          {/* MON CONTRAT */}
          {activeTab==='contrats' && (
            <div>
              {mesContrats.length===0 ? (
                <div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', padding:64, textAlign:'center' }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>📄</div>
                  <div style={{ fontSize:16, fontWeight:600, color:'#1E293B' }}>Aucun contrat enregistré</div>
                  <div style={{ fontSize:13, color:'#94A3B8', marginTop:6 }}>Votre contrat apparaîtra ici une fois créé par le RH</div>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                  {mesContrats.map(c=>{
                    const isActif = c.statut==='actif';
                    return (
                      <div key={c.id} style={{ background:'#fff', borderRadius:16, border:`1px solid ${isActif?'#A7F3D0':'#F1F5F9'}`, padding:28, boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                            <div style={{ width:48, height:48, borderRadius:12, background:'#EEF2FF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>📄</div>
                            <div>
                              <div style={{ fontSize:16, fontWeight:700, color:'#1E293B' }}>Contrat de travail</div>
                              <div style={{ fontSize:12, color:'#94A3B8', marginTop:2 }}>Créé par le service RH</div>
                            </div>
                          </div>
                          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                            <BadgeContrat type={c.type}/>
                            <span style={{ background:isActif?'#ECFDF5':'#F9FAFB', color:isActif?'#065F46':'#374151', border:`1px solid ${isActif?'#A7F3D0':'#E5E7EB'}`, borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:600 }}>{isActif?'✅ Actif':'Terminé'}</span>
                          </div>
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:20 }}>
                          {[
                            {icon:'📅',label:'Date début',value:c.dateDebut||'—'},
                            {icon:'📅',label:'Date fin',value:c.dateFin||'Indéterminé'},
                            {icon:'💰',label:'Salaire brut',value:c.salaireBrut?`${c.salaireBrut.toLocaleString('fr-FR')} MAD`:'—'},
                          ].map(item=>(
                            <div key={item.label} style={{ background:'#F8FAFC', borderRadius:12, padding:'14px 16px', border:'1px solid #F1F5F9' }}>
                              <div style={{ fontSize:11, color:'#94A3B8', marginBottom:4 }}>{item.icon} {item.label}</div>
                              <div style={{ fontSize:14, fontWeight:700, color:'#1E293B' }}>{item.value}</div>
                            </div>
                          ))}
                        </div>
                        <button onClick={()=>genererPdfContrat(c, employeInfo)} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#6366F1,#8B5CF6)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                          📄 Télécharger en PDF
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* MES FORMATIONS */}
          {activeTab==='formations' && (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
                {[
                  {icon:'🎓',label:'Total',value:mesFormations.length,accent:'#F59E0B'},
                  {icon:'✅',label:'Terminées',value:mesFormations.filter(f=>f.statut==='TERMINE').length,accent:'#10B981'},
                  {icon:'📅',label:'Planifiées',value:mesFormations.filter(f=>f.statut==='PLANIFIE').length,accent:'#6366F1'},
                ].map(s=>(
                  <div key={s.label} style={{ background:'#fff', borderRadius:14, border:'1px solid #F1F5F9', padding:'18px 20px', display:'flex', alignItems:'center', gap:14 }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:s.accent+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{s.icon}</div>
                    <div><div style={{ fontSize:11, color:'#94A3B8', fontWeight:500 }}>{s.label}</div><div style={{ fontSize:24, fontWeight:700, color:'#1E293B' }}>{s.value}</div></div>
                  </div>
                ))}
              </div>
              {mesFormations.length===0 ? (
                <div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', padding:64, textAlign:'center' }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>🎓</div>
                  <div style={{ fontSize:16, fontWeight:600, color:'#1E293B' }}>Aucune formation planifiée</div>
                  <div style={{ fontSize:13, color:'#94A3B8', marginTop:6 }}>Vos formations apparaîtront ici une fois planifiées par le RH</div>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {mesFormations.map(f=>(
                    <div key={f.id} style={{ background:'#fff', borderRadius:14, border:'1px solid #F1F5F9', padding:'18px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                        <div style={{ width:44, height:44, borderRadius:12, background:'#FFFBEB', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🎓</div>
                        <div>
                          <div style={{ fontSize:14, fontWeight:700, color:'#1E293B', marginBottom:4 }}>{f.titre}</div>
                          <div style={{ fontSize:12, color:'#94A3B8' }}>
                            {f.organisme && `🏢 ${f.organisme}`}
                            {f.dateDebut && ` · 📆 ${f.dateDebut} → ${f.dateFin||'—'}`}
                          </div>
                          {f.description && <div style={{ fontSize:12, color:'#64748B', marginTop:4 }}>{f.description}</div>}
                        </div>
                      </div>
                      <BadgeFormation statut={f.statut}/>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SANCTIONS & PROCÉDURE DE DÉPART */}
          {activeTab==='sanctions' && (
            <div>
              {employeInfo?.statutDepart && (
                <div style={{ background:'#fff', borderRadius:16, border:'1px solid #FECACA', padding:24, marginBottom:24 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ width:44, height:44, borderRadius:12, background:'#FEF2F2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🚪</div>
                      <div>
                        <div style={{ fontSize:15, fontWeight:700, color:'#1E293B' }}>Procédure de départ</div>
                        <div style={{ fontSize:12, color:'#94A3B8' }}>Initiée par le service RH</div>
                      </div>
                    </div>
                    <BadgeDepart statut={employeInfo.statutDepart}/>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                    <div style={{ background:'#FEF2F2', borderRadius:12, padding:'14px 16px' }}>
                      <div style={{ fontSize:11, color:'#94A3B8', marginBottom:4 }}>📅 Date de départ prévue</div>
                      <div style={{ fontSize:14, fontWeight:700, color:'#1E293B' }}>{employeInfo.dateDepart || '—'}</div>
                    </div>
                    <div style={{ background:'#FEF2F2', borderRadius:12, padding:'14px 16px' }}>
                      <div style={{ fontSize:11, color:'#94A3B8', marginBottom:4 }}>📝 Motif</div>
                      <div style={{ fontSize:14, fontWeight:700, color:'#1E293B' }}>{employeInfo.motifDepart || '—'}</div>
                    </div>
                  </div>
                </div>
              )}

              {mesSanctions.length===0 ? (
                <div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', padding:64, textAlign:'center' }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
                  <div style={{ fontSize:16, fontWeight:600, color:'#1E293B' }}>Aucune sanction enregistrée</div>
                  <div style={{ fontSize:13, color:'#94A3B8', marginTop:6 }}>Continue comme ça !</div>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {mesSanctions.map(s=>(
                    <div key={s.id} style={{ background:'#fff', borderRadius:14, border:'1px solid #F1F5F9', padding:'18px 20px' }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:36, height:36, borderRadius:10, background:'#FEF2F2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>⚠️</div>
                          <div style={{ fontSize:12, color:'#94A3B8' }}>📅 {s.dateSanction || '—'}</div>
                        </div>
                        <BadgeSanction type={s.typeSanction}/>
                      </div>
                      <div style={{ fontSize:13, fontWeight:600, color:'#1E293B', marginBottom:4 }}>{s.motif}</div>
                      {s.description && <div style={{ fontSize:12, color:'#64748B', background:'#F8FAFC', padding:'10px 14px', borderRadius:10, marginTop:6 }}>{s.description}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PROFIL */}
          {activeTab==='profil' && (
            <div style={{ maxWidth:480 }}>
              <div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', padding:28 }}>
                <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24, paddingBottom:20, borderBottom:'1px solid #F1F5F9' }}>
                  <Avatar nom={employeInfo?.nom} prenom={employeInfo?.prenom} size={56}/>
                  <div>
                    <div style={{ fontSize:18, fontWeight:700, color:'#1E293B' }}>{employeInfo?.nom} {employeInfo?.prenom}</div>
                    <div style={{ fontSize:13, color:'#94A3B8', marginTop:2 }}>{employeInfo?.email}</div>
                    <span style={{ background:'#FFF7ED', color:'#9A3412', border:'1px solid #FED7AA', borderRadius:20, padding:'2px 10px', fontSize:11, fontWeight:600, marginTop:6, display:'inline-block' }}>Employé</span>
                  </div>
                </div>
                {[
                  {label:'Département', value:employeInfo?.departement},
                  {label:'Poste', value:employeInfo?.poste},
                  {label:'Date embauche', value:employeInfo?.dateEmbauche},
                ].filter(r=>r.value).map(row=>(
                  <div key={row.label} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #F8FAFC' }}>
                    <span style={{ fontSize:13, color:'#94A3B8', fontWeight:500 }}>{row.label}</span>
                    <span style={{ fontSize:13, color:'#1E293B', fontWeight:600 }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}