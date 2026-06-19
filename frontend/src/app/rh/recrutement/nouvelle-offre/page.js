"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:8080/api';
const COLORS = ['#4F46E5','#0891B2','#059669','#D97706','#DC2626','#7C3AED','#DB2777'];
function getInitials(nom, prenom) { return ((nom?.[0]||'')+(prenom?.[0]||'')).toUpperCase(); }
function getColor(str) { let h=0; for(let c of(str||'')) h=c.charCodeAt(0)+((h<<5)-h); return COLORS[Math.abs(h)%COLORS.length]; }
function Avatar({ nom, prenom, size=36 }) {
  return <div style={{ width:size, height:size, borderRadius:'50%', background:getColor((nom||'')+(prenom||'')), color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.36, fontWeight:600, flexShrink:0, fontFamily:'inherit' }}>{getInitials(nom,prenom)}</div>;
}
function Badge({ statut }) {
  const cfg = {
    APPROUVE:{label:'Approuvé',bg:'#ECFDF5',color:'#065F46',border:'#A7F3D0'},
    REFUSE:{label:'Refusé',bg:'#FEF2F2',color:'#991B1B',border:'#FECACA'},
    EN_ATTENTE:{label:'En attente',bg:'#FFFBEB',color:'#92400E',border:'#FDE68A'},
    EN_COURS:{label:'En cours',bg:'#EEF2FF',color:'#4338CA',border:'#C7D2FE'},
    TERMINE:{label:'Terminé',bg:'#ECFDF5',color:'#065F46',border:'#A7F3D0'},
    PLANIFIE:{label:'Planifié',bg:'#F0F9FF',color:'#0369A1',border:'#BAE6FD'},
    ACTIVE:{label:'Active',bg:'#FEF2F2',color:'#991B1B',border:'#FECACA'},
    actif:{label:'Actif',bg:'#ECFDF5',color:'#065F46',border:'#A7F3D0'},
    termine:{label:'Terminé',bg:'#F9FAFB',color:'#374151',border:'#E5E7EB'},
    CDD:{label:'CDD',bg:'#FFFBEB',color:'#92400E',border:'#FDE68A'},
    CDI:{label:'CDI',bg:'#ECFDF5',color:'#065F46',border:'#A7F3D0'},
    Stage:{label:'Stage',bg:'#EEF2FF',color:'#4338CA',border:'#C7D2FE'},
  };
  const c = cfg[statut]||{label:statut||'—',bg:'#F9FAFB',color:'#374151',border:'#E5E7EB'};
  return <span style={{ background:c.bg, color:c.color, border:`1px solid ${c.border}`, borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:600 }}>{c.label}</span>;
}
function PointageBadge({ statut }) {
  const cfg = { present:{label:'Présent',bg:'#ECFDF5',color:'#065F46',border:'#A7F3D0'}, retard:{label:'Retard',bg:'#FFFBEB',color:'#92400E',border:'#FDE68A'}, absent:{label:'Absent',bg:'#FEF2F2',color:'#991B1B',border:'#FECACA'} };
  const c = cfg[statut]||{label:statut||'—',bg:'#F9FAFB',color:'#374151',border:'#E5E7EB'};
  return <span style={{ background:c.bg, color:c.color, border:`1px solid ${c.border}`, borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:600 }}>{c.label}</span>;
}
function StarRating({ note, max=10 }) {
  const pct = Math.round((note/max)*100);
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <div style={{ flex:1, height:8, background:'#F1F5F9', borderRadius:8 }}>
        <div style={{ height:'100%', width:`${pct}%`, background:pct>=70?'#10B981':pct>=40?'#F59E0B':'#EF4444', borderRadius:8 }}/>
      </div>
      <span style={{ fontSize:13, fontWeight:700, color:'#1E293B', minWidth:30 }}>{note}/10</span>
    </div>
  );
}

// ═══ GÉNÉRATION PDF COURRIER DE SANCTION ═══
function genererPDFSanction(sanction, config) {
  const entreprise = config?.nomEntreprise || 'SGRH Corp';
  const adresse = config?.adresse || 'Rabat, Maroc';
  const date = new Date().toLocaleDateString('fr-FR', {day:'numeric', month:'long', year:'numeric'});
  const dateS = sanction.dateSanction || new Date().toISOString().split('T')[0];

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<title>Courrier de Sanction</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; font-size: 14px; color: #1a1a1a; padding: 60px; line-height: 1.6; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:40px; padding-bottom:20px; border-bottom:3px solid #1E293B; }
  .company { font-size:22px; font-weight:bold; color:#1E293B; }
  .company-info { font-size:12px; color:#64748B; margin-top:4px; }
  .doc-info { text-align:right; }
  .doc-ref { font-size:12px; color:#64748B; }
  .doc-date { font-size:14px; font-weight:bold; margin-top:4px; }
  .title { text-align:center; font-size:18px; font-weight:bold; text-transform:uppercase; letter-spacing:2px; margin:40px 0 30px; color:#1E293B; border:2px solid #1E293B; padding:12px; }
  .destinataire { margin-bottom:30px; }
  .destinataire p { margin-bottom:4px; }
  .section { margin-bottom:20px; }
  .section-title { font-weight:bold; text-decoration:underline; margin-bottom:8px; }
  .content { text-align:justify; }
  .sanction-box { background:#FEF2F2; border:1px solid #FECACA; border-radius:6px; padding:16px; margin:20px 0; }
  .sanction-type { font-size:16px; font-weight:bold; color:#991B1B; margin-bottom:8px; }
  .signature { margin-top:60px; display:flex; justify-content:space-between; }
  .sig-block { text-align:center; width:45%; }
  .sig-line { border-top:1px solid #1E293B; margin-top:40px; padding-top:8px; font-size:12px; color:#64748B; }
  .footer { margin-top:60px; padding-top:20px; border-top:1px solid #E2E8F0; text-align:center; font-size:11px; color:#94A3B8; }
  @media print { body { padding:40px; } }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company">${entreprise}</div>
      <div class="company-info">${adresse}</div>
      <div class="company-info">Département des Ressources Humaines</div>
    </div>
    <div class="doc-info">
      <div class="doc-ref">Réf : SANC-${Date.now().toString().slice(-6)}</div>
      <div class="doc-date">${date}</div>
    </div>
  </div>

  <div class="title">Courrier de Sanction Disciplinaire</div>

  <div class="destinataire">
    <p><strong>À l'attention de :</strong></p>
    <p>M./Mme <strong>${sanction.employe?.nom || ''} ${sanction.employe?.prenom || ''}</strong></p>
    <p>Poste : ${sanction.employe?.poste || '—'}</p>
    <p>Département : ${sanction.employe?.departement || '—'}</p>
  </div>

  <div class="section">
    <div class="section-title">Objet : Notification de sanction disciplinaire</div>
    <p class="content">
      Par la présente, nous vous informons qu'à la suite des faits constatés et après examen de votre dossier,
      la direction de <strong>${entreprise}</strong> a décidé de prononcer à votre encontre la sanction disciplinaire suivante :
    </p>
  </div>

  <div class="sanction-box">
    <div class="sanction-type">⚠️ Type de sanction : ${sanction.typeSanction || '—'}</div>
    <p><strong>Date de la sanction :</strong> ${dateS}</p>
    <p style="margin-top:8px"><strong>Motif :</strong> ${sanction.motif || '—'}</p>
    ${sanction.description ? `<p style="margin-top:8px"><strong>Description des faits :</strong><br/>${sanction.description}</p>` : ''}
  </div>

  <div class="section">
    <p class="content">
      Nous vous rappelons que cette sanction est prononcée conformément au règlement intérieur de l'entreprise
      et au Code du Travail en vigueur. Vous disposez d'un délai de <strong>8 jours</strong> pour contester
      cette décision auprès de la direction des ressources humaines.
    </p>
  </div>

  <div class="section">
    <p class="content">
      Nous espérons que cette mesure vous permettra de prendre conscience de la gravité des faits reprochés
      et que vous ferez preuve à l'avenir du comportement professionnel attendu au sein de notre entreprise.
    </p>
  </div>

  <div class="signature">
    <div class="sig-block">
      <div class="sig-line">Le/La Responsable RH</div>
    </div>
    <div class="sig-block">
      <div class="sig-line">L'Employé(e) — Lu et approuvé</div>
    </div>
  </div>

  <div class="footer">
    ${entreprise} — ${adresse} — Document confidentiel — ${date}
  </div>
</body>
</html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 500);
}

export default function EspaceRH() {
  const [activeTab, setActiveTab] = useState('pointage');
  const [activeRecrutTab, setActiveRecrutTab] = useState('offres');
  const [mesDemandes, setMesDemandes] = useState([]);
  const [offres, setOffres] = useState([]);
  const [offreSelectee, setOffreSelectee] = useState(null);
  const [candidatures, setCandidatures] = useState([]);
  const [candidatSelectionne, setCandidatSelectionne] = useState(null);
  const [pointageAujourdhui, setPointageAujourdhui] = useState(null);
  const [historiquePointages, setHistoriquePointages] = useState([]);
  const [statsPointage, setStatsPointage] = useState(null);
  const [employes, setEmployes] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [formations, setFormations] = useState([]);
  const [sanctions, setSanctions] = useState([]);
  const [contrats, setContrats] = useState([]);
  const [alertesContrats, setAlertesContrats] = useState([]);
  const [loadingConge, setLoadingConge] = useState(false);
  const [loadingOffre, setLoadingOffre] = useState(false);
  const [loadingPointage, setLoadingPointage] = useState(false);
  const [rhInfo, setRhInfo] = useState(null);
  const [rhId, setRhId] = useState(null);
  const [copiedLink, setCopiedLink] = useState(null);
  const [config, setConfig] = useState(null);

  const [congeForm, setCongeForm] = useState({ type:'Annuel', motif:'', dateDebut:'', dateFin:'' });
  const [offreForm, setOffreForm] = useState({ titre:'', description:'', departement:'' });
  const [evalForm, setEvalForm] = useState({ employeId:'', periode:'', noteGlobale:'', objectifs:'', commentaire:'', dateEvaluation:'' });
  const [formationForm, setFormationForm] = useState({ employeId:'', titre:'', description:'', organisme:'', dateDebut:'', dateFin:'' });
  const [departForm, setDepartForm] = useState({ employeId:'', dateDepart:'', motifDepart:'' });
  const [sanctionForm, setSanctionForm] = useState({ employeId:'', typeSanction:'', motif:'', description:'', dateSanction:'' });
  const [contratForm, setContratForm] = useState({ employeId:'', type:'CDI', dateDebut:'', dateFin:'', salaireBrut:'' });

  const [showEvalForm, setShowEvalForm] = useState(false);
  const [showFormationForm, setShowFormationForm] = useState(false);
  const [showDepartForm, setShowDepartForm] = useState(false);
  const [showSanctionForm, setShowSanctionForm] = useState(false);
  const [showContratForm, setShowContratForm] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user')||'null');
    if (user) {
      setRhId(user.id); setRhInfo(user);
      chargerMesDemandes(user.id);
      chargerPointageAujourdhui(user.id);
      chargerHistorique(user.id);
      chargerStats(user.id);
    }
    const cfg = localStorage.getItem('sgrh_config');
    if (cfg) setConfig(JSON.parse(cfg));
    chargerOffres(); chargerEmployes(); chargerEvaluations();
    chargerFormations(); chargerSanctions(); chargerContrats(); chargerAlertes();
  }, []);

  const chargerMesDemandes = async (id) => { try { const r=await axios.get(`${API}/conges/mon-suivi/${id}`); setMesDemandes(Array.isArray(r.data)?r.data:[]); } catch(e){} };
  const chargerOffres = async () => { try { const r=await axios.get(`${API}/recrutement`); setOffres(Array.isArray(r.data)?r.data:[]); } catch(e){} };
  const chargerCandidatures = async (id) => { try { const r=await axios.get(`${API}/recrutement/${id}/candidatures`); setCandidatures(Array.isArray(r.data)?r.data:[]); } catch(e){} };
  const chargerPointageAujourdhui = async (id) => { try { const r=await axios.get(`${API}/pointages/aujourd-hui/${id}`); setPointageAujourdhui(r.data); } catch(e){} };
  const chargerHistorique = async (id) => { try { const r=await axios.get(`${API}/pointages/employe/${id}`); setHistoriquePointages(Array.isArray(r.data)?r.data:[]); } catch(e){} };
  const chargerStats = async (id) => { try { const r=await axios.get(`${API}/pointages/stats/${id}`); setStatsPointage(r.data); } catch(e){} };
  const chargerEmployes = async () => { try { const r=await axios.get(`${API}/utilisateurs`); setEmployes(Array.isArray(r.data)?r.data:[]); } catch(e){} };
  const chargerEvaluations = async () => { try { const r=await axios.get(`${API}/evaluations`); setEvaluations(Array.isArray(r.data)?r.data:[]); } catch(e){} };
  const chargerFormations = async () => { try { const r=await axios.get(`${API}/formations`); setFormations(Array.isArray(r.data)?r.data:[]); } catch(e){} };
  const chargerSanctions = async () => { try { const r=await axios.get(`${API}/sanctions`); setSanctions(Array.isArray(r.data)?r.data:[]); } catch(e){} };
  const chargerContrats = async () => { try { const r=await axios.get(`${API}/contrats`); setContrats(Array.isArray(r.data)?r.data:[]); } catch(e){} };
  const chargerAlertes = async () => { try { const r=await axios.get(`${API}/contrats/alertes`); setAlertesContrats(Array.isArray(r.data)?r.data:[]); } catch(e){} };

  const pointerEntree = async () => { setLoadingPointage(true); try { const r=await axios.post(`${API}/pointages/entree/${rhId}`); setPointageAujourdhui(r.data); chargerHistorique(rhId); chargerStats(rhId); } catch(e){alert('Erreur: '+(e.response?.data||e.message));} finally{setLoadingPointage(false);} };
  const pointerSortie = async () => { setLoadingPointage(true); try { const r=await axios.put(`${API}/pointages/sortie/${rhId}`); setPointageAujourdhui(r.data); chargerHistorique(rhId); } catch(e){alert('Erreur: '+(e.response?.data||e.message));} finally{setLoadingPointage(false);} };

  const soumettreConge = async () => {
    if (!congeForm.dateDebut||!congeForm.dateFin){alert('Dates obligatoires.');return;}
    setLoadingConge(true);
    try{await axios.post(`${API}/conges`,{...congeForm,employeId:rhId});setCongeForm({type:'Annuel',motif:'',dateDebut:'',dateFin:''});chargerMesDemandes(rhId);}
    catch(e){alert('Erreur: '+(e.response?.data||e.message));}finally{setLoadingConge(false);}
  };
  const soumettreOffre = async () => {
    if (!offreForm.titre||!offreForm.description){alert('Titre et description obligatoires.');return;}
    setLoadingOffre(true);
    try{await axios.post(`${API}/recrutement`,{...offreForm,responsableId:rhId});setOffreForm({titre:'',description:'',departement:''});chargerOffres();setActiveRecrutTab('offres');}
    catch(e){alert('Erreur: '+(e.response?.data||e.message));}finally{setLoadingOffre(false);}
  };
  const soumettreEvaluation = async () => {
    if (!evalForm.employeId||!evalForm.periode){alert('Employé et période obligatoires.');return;}
    try{await axios.post(`${API}/evaluations`,{...evalForm,evaluateurId:rhId});setEvalForm({employeId:'',periode:'',noteGlobale:'',objectifs:'',commentaire:'',dateEvaluation:''});setShowEvalForm(false);chargerEvaluations();}
    catch(e){alert('Erreur: '+(e.response?.data||e.message));}
  };
  const soumettreFormation = async () => {
    if (!formationForm.employeId||!formationForm.titre){alert('Employé et titre obligatoires.');return;}
    try{await axios.post(`${API}/formations`,formationForm);setFormationForm({employeId:'',titre:'',description:'',organisme:'',dateDebut:'',dateFin:''});setShowFormationForm(false);chargerFormations();}
    catch(e){alert('Erreur: '+(e.response?.data||e.message));}
  };
  const soumettreDepart = async () => {
    if (!departForm.employeId||!departForm.dateDepart||!departForm.motifDepart){alert('Tous les champs obligatoires.');return;}
    if (!confirm('Confirmer la procédure de départ ?')) return;
    try{await axios.put(`${API}/utilisateurs/${departForm.employeId}/depart`,{dateDepart:departForm.dateDepart,motifDepart:departForm.motifDepart});setDepartForm({employeId:'',dateDepart:'',motifDepart:''});setShowDepartForm(false);chargerEmployes();alert('✅ Procédure de départ enregistrée.');}
    catch(e){alert('Erreur: '+(e.response?.data||e.message));}
  };
  const soumettreSanction = async () => {
    if (!sanctionForm.employeId||!sanctionForm.typeSanction||!sanctionForm.motif){alert('Employé, type et motif obligatoires.');return;}
    try{await axios.post(`${API}/sanctions`,sanctionForm);setSanctionForm({employeId:'',typeSanction:'',motif:'',description:'',dateSanction:''});setShowSanctionForm(false);chargerSanctions();}
    catch(e){alert('Erreur: '+(e.response?.data||e.message));}
  };
  const soumettreContrat = async () => {
    if (!contratForm.employeId||!contratForm.type||!contratForm.dateDebut){alert('Employé, type et date début obligatoires.');return;}
    try{await axios.post(`${API}/contrats`,contratForm);setContratForm({employeId:'',type:'CDI',dateDebut:'',dateFin:'',salaireBrut:''});setShowContratForm(false);chargerContrats();chargerAlertes();}
    catch(e){alert('Erreur: '+(e.response?.data||e.message));}
  };
  const terminerContrat = async (id) => {
    if (!confirm('Marquer ce contrat comme terminé ?')) return;
    try{await axios.put(`${API}/contrats/${id}/terminer`);chargerContrats();chargerAlertes();}
    catch(e){alert('Erreur: '+(e.response?.data||e.message));}
  };
  const voirCandidatures = async (offre) => { setOffreSelectee(offre); setCandidatSelectionne(null); await chargerCandidatures(offre.id); setActiveRecrutTab('candidatures'); };
  const updateStatutCandidat = async (id,statut) => { try{await axios.put(`${API}/recrutement/candidature/${id}/statut`,{statut});chargerCandidatures(offreSelectee.id);}catch(e){alert('Erreur');} };
  const embaucher = async (id) => { if (!confirm('Confirmer embauche ?')) return; try{await axios.post(`${API}/recrutement/candidature/${id}/embaucher`);alert('✅ Employé créé ! Mot de passe: password123');chargerCandidatures(offreSelectee.id);}catch(e){alert('Erreur');} };
  const copierLien = (id) => { navigator.clipboard.writeText(`http://localhost:3000/offres/${id}`); setCopiedLink(id); setTimeout(()=>setCopiedLink(null),2000); };
  const updateStatutFormation = async (id,statut) => { try{await axios.put(`${API}/formations/${id}/statut`,{statut});chargerFormations();}catch(e){alert('Erreur');} };

  const iStyle = { width:'100%', padding:'10px 12px', border:'1.5px solid #E2E8F0', borderRadius:10, fontSize:14, color:'#1E293B', outline:'none', background:'#F8FAFC', fontFamily:'inherit', boxSizing:'border-box' };
  const lStyle = { fontSize:12, fontWeight:600, color:'#64748B', marginBottom:4, display:'block' };
  const now = new Date();
  const timeStr = now.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
  const dateStr = now.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});
  const employesActifs = employes.filter(e=>e.estActif&&(e.role||'').toUpperCase()!=='ADMIN');

  const getDaysUntilExpiry = (dateFin) => {
    if (!dateFin) return null;
    const diff = new Date(dateFin) - new Date();
    return Math.ceil(diff / (1000*60*60*24));
  };

  const navItems = [
    { key:'pointage',    icon:'⏱️', label:'Mon pointage' },
    { key:'conges',      icon:'📅', label:'Mes congés' },
    { key:'recrutement', icon:'💼', label:'Recrutement' },
    { key:'evaluations', icon:'⭐', label:'Évaluations' },
    { key:'formations',  icon:'🎓', label:'Formations' },
    { key:'sanctions',   icon:'⚠️', label:'Sanctions', badge:sanctions.filter(s=>s.statut==='ACTIVE').length||null },
    { key:'contrats',    icon:'📄', label:'Contrats', badge:alertesContrats.length||null },
    { key:'depart',      icon:'🚪', label:'Procédure départ' },
    { key:'profil',      icon:'👤', label:'Mon profil' },
  ];

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#F8FAFC', fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>

      {/* SIDEBAR */}
      <aside style={{ width:240, minWidth:240, background:'#0F172A', display:'flex', flexDirection:'column', position:'fixed', top:0, left:0, bottom:0, zIndex:100 }}>
        <div style={{ padding:'24px 20px 16px', borderBottom:'1px solid #1E293B' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#10B981,#059669)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🏢</div>
            <div><div style={{ color:'#F1F5F9', fontWeight:700, fontSize:15 }}>SGRH</div><div style={{ color:'#64748B', fontSize:11 }}>Espace RH</div></div>
          </div>
        </div>
        <nav style={{ flex:1, padding:'16px 10px', overflowY:'auto' }}>
          <div style={{ fontSize:10, fontWeight:700, color:'#475569', letterSpacing:'.1em', padding:'0 10px', marginBottom:6 }}>MENU</div>
          {navItems.map(item=>(
            <button key={item.key} onClick={()=>setActiveTab(item.key)} style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 12px', borderRadius:10, border:'none', cursor:'pointer', textAlign:'left', marginBottom:2, background:activeTab===item.key?'rgba(16,185,129,0.15)':'transparent', color:activeTab===item.key?'#34D399':'#94A3B8', fontWeight:activeTab===item.key?600:400, fontSize:13, fontFamily:'inherit' }}>
              <span style={{ fontSize:15 }}>{item.icon}</span>{item.label}
              {item.badge?<span style={{ marginLeft:'auto', background:'#EF4444', color:'#fff', borderRadius:20, padding:'1px 7px', fontSize:10, fontWeight:700 }}>{item.badge}</span>:null}
            </button>
          ))}
        </nav>
        <div style={{ padding:'16px 10px', borderTop:'1px solid #1E293B' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, background:'#1E293B' }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#10B981,#059669)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff' }}>{getInitials(rhInfo?.nom,rhInfo?.prenom)}</div>
            <div><div style={{ color:'#F1F5F9', fontSize:12, fontWeight:600 }}>{rhInfo?.nom} {rhInfo?.prenom}</div><div style={{ color:'#64748B', fontSize:10 }}>Responsable RH</div></div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ marginLeft:240, flex:1, display:'flex', flexDirection:'column' }}>
        <header style={{ background:'#fff', borderBottom:'1px solid #F1F5F9', padding:'0 32px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
          <div>
            <div style={{ fontSize:18, fontWeight:700, color:'#1E293B' }}>
              {activeTab==='pointage'    && 'Mon pointage'}
              {activeTab==='conges'      && 'Mes congés'}
              {activeTab==='recrutement' && (activeRecrutTab==='candidatures'?`Candidatures — ${offreSelectee?.titre}`:activeRecrutTab==='nouvelle'?'Nouvelle offre':"Offres d'emploi")}
              {activeTab==='evaluations' && 'Évaluations & Objectifs'}
              {activeTab==='formations'  && 'Gestion des formations'}
              {activeTab==='sanctions'   && 'Sanctions disciplinaires'}
              {activeTab==='contrats'    && 'Suivi des contrats'}
              {activeTab==='depart'      && 'Procédure de départ'}
              {activeTab==='profil'      && 'Mon profil'}
            </div>
            <div style={{ fontSize:12, color:'#94A3B8' }}>
              {activeTab==='pointage'    && dateStr}
              {activeTab==='sanctions'   && `${sanctions.length} sanction(s) · ${sanctions.filter(s=>s.statut==='ACTIVE').length} active(s)`}
              {activeTab==='contrats'    && `${contrats.length} contrat(s) · ${alertesContrats.length} alerte(s)`}
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {activeTab==='recrutement'&&activeRecrutTab==='offres'&&<button onClick={()=>setActiveRecrutTab('nouvelle')} style={{ background:'linear-gradient(135deg,#10B981,#059669)', color:'#fff', border:'none', padding:'10px 20px', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer' }}>＋ Nouvelle offre</button>}
            {activeTab==='recrutement'&&(activeRecrutTab==='candidatures'||activeRecrutTab==='nouvelle')&&<button onClick={()=>{setActiveRecrutTab('offres');setOffreSelectee(null);setCandidatSelectionne(null);}} style={{ background:'#F1F5F9', border:'none', padding:'8px 16px', borderRadius:8, cursor:'pointer', fontSize:13, color:'#64748B', fontWeight:600 }}>← Retour</button>}
            {activeTab==='evaluations'&&<button onClick={()=>setShowEvalForm(true)} style={{ background:'linear-gradient(135deg,#6366F1,#8B5CF6)', color:'#fff', border:'none', padding:'10px 20px', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer' }}>＋ Nouvelle évaluation</button>}
            {activeTab==='formations'&&<button onClick={()=>setShowFormationForm(true)} style={{ background:'linear-gradient(135deg,#F59E0B,#D97706)', color:'#fff', border:'none', padding:'10px 20px', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer' }}>＋ Nouvelle formation</button>}
            {activeTab==='sanctions'&&<button onClick={()=>setShowSanctionForm(true)} style={{ background:'linear-gradient(135deg,#EF4444,#DC2626)', color:'#fff', border:'none', padding:'10px 20px', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer' }}>＋ Nouvelle sanction</button>}
            {activeTab==='contrats'&&<button onClick={()=>setShowContratForm(true)} style={{ background:'linear-gradient(135deg,#6366F1,#8B5CF6)', color:'#fff', border:'none', padding:'10px 20px', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer' }}>＋ Nouveau contrat</button>}
            {activeTab==='depart'&&<button onClick={()=>setShowDepartForm(true)} style={{ background:'linear-gradient(135deg,#EF4444,#DC2626)', color:'#fff', border:'none', padding:'10px 20px', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer' }}>🚪 Enregistrer départ</button>}
          </div>
        </header>

        <main style={{ flex:1, padding:32 }}>

          {/* POINTAGE */}
          {activeTab==='pointage'&&(
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
                {[{icon:'✅',label:'Présents',value:statsPointage?.presents||0,accent:'#10B981'},{icon:'⚠️',label:'Retards',value:statsPointage?.retards||0,accent:'#F59E0B'},{icon:'❌',label:'Absences',value:statsPointage?.absents||0,accent:'#EF4444'},{icon:'📊',label:'Total',value:statsPointage?.total||0,accent:'#6366F1'}].map(s=>(
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
                  {pointageAujourdhui?(
                    <div>
                      <div style={{ background:'#F8FAFC', borderRadius:12, padding:16, marginBottom:16 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}><span style={{ fontSize:13, color:'#94A3B8' }}>Entrée</span><span style={{ fontSize:13, fontWeight:700, color:'#10B981' }}>✅ {pointageAujourdhui.heureEntree?.substring(0,5)||'—'}</span></div>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}><span style={{ fontSize:13, color:'#94A3B8' }}>Sortie</span><span style={{ fontSize:13, fontWeight:700, color:pointageAujourdhui.heureSortie?'#6366F1':'#CBD5E1' }}>{pointageAujourdhui.heureSortie?'✅ '+pointageAujourdhui.heureSortie.substring(0,5):'En attente...'}</span></div>
                        <div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ fontSize:13, color:'#94A3B8' }}>Statut</span><PointageBadge statut={pointageAujourdhui.statut}/></div>
                      </div>
                      {!pointageAujourdhui.heureSortie&&<button onClick={pointerSortie} disabled={loadingPointage} style={{ width:'100%', padding:'13px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#6366F1,#8B5CF6)', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer' }}>{loadingPointage?'⏳...':'🚪 Pointer la sortie'}</button>}
                      {pointageAujourdhui.heureSortie&&<div style={{ textAlign:'center', padding:14, background:'#ECFDF5', borderRadius:10, fontSize:14, fontWeight:600, color:'#065F46' }}>✅ Journée complète</div>}
                    </div>
                  ):(
                    <div>
                      <div style={{ textAlign:'center', padding:20, background:'#F8FAFC', borderRadius:12, marginBottom:16, color:'#94A3B8', fontSize:13 }}>Pas encore pointé aujourd'hui</div>
                      <button onClick={pointerEntree} disabled={loadingPointage} style={{ width:'100%', padding:'13px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#10B981,#059669)', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer' }}>{loadingPointage?'⏳...':'🟢 Pointer l\'entrée'}</button>
                    </div>
                  )}
                </div>
                <div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', overflow:'hidden' }}>
                  <div style={{ padding:'16px 20px', borderBottom:'1px solid #F8FAFC' }}><span style={{ fontSize:15, fontWeight:700, color:'#1E293B' }}>📜 Historique</span></div>
                  <div style={{ maxHeight:380, overflowY:'auto' }}>
                    {historiquePointages.length===0?<div style={{ padding:40, textAlign:'center', color:'#CBD5E1' }}>Aucun pointage</div>
                    :historiquePointages.slice(0,20).map(p=>(
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
          {activeTab==='conges'&&(
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
                {[{icon:'⏳',label:'En attente',value:mesDemandes.filter(d=>d.statut==='EN_ATTENTE').length,accent:'#F59E0B'},{icon:'✅',label:'Approuvés',value:mesDemandes.filter(d=>d.statut==='APPROUVE').length,accent:'#10B981'},{icon:'❌',label:'Refusés',value:mesDemandes.filter(d=>d.statut==='REFUSE').length,accent:'#EF4444'}].map(s=>(
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
                    <div><label style={lStyle}>Motif</label><textarea style={{...iStyle,height:70,resize:'vertical'}} value={congeForm.motif} onChange={e=>setCongeForm({...congeForm,motif:e.target.value})}/></div>
                    <button onClick={soumettreConge} disabled={loadingConge} style={{ padding:'11px', borderRadius:10, border:'none', background:loadingConge?'#6EE7B7':'linear-gradient(135deg,#10B981,#059669)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>{loadingConge?'⏳...':'📤 Envoyer'}</button>
                  </div>
                </div>
                <div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', overflow:'hidden' }}>
                  <div style={{ padding:'16px 20px', borderBottom:'1px solid #F8FAFC' }}><span style={{ fontSize:15, fontWeight:700, color:'#1E293B' }}>📜 Mes demandes</span></div>
                  <div style={{ padding:8 }}>
                    {mesDemandes.length===0?<div style={{ padding:40, textAlign:'center', color:'#CBD5E1' }}>Aucune demande</div>
                    :mesDemandes.map(d=>(
                      <div key={d.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', borderRadius:8, marginBottom:4, background:'#F8FAFC' }}>
                        <div><div style={{ fontSize:13, fontWeight:600, color:'#1E293B' }}>{d.type}</div><div style={{ fontSize:11, color:'#94A3B8' }}>📆 {d.dateDebut} → {d.dateFin}</div></div>
                        <Badge statut={d.statut}/>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RECRUTEMENT */}
          {activeTab==='recrutement'&&activeRecrutTab==='offres'&&(
            <div>
              {offres.length===0?<div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', padding:64, textAlign:'center' }}><div style={{ fontSize:48, marginBottom:12 }}>💼</div><div style={{ fontSize:16, fontWeight:600, color:'#1E293B', marginBottom:12 }}>Aucune offre</div><button onClick={()=>setActiveRecrutTab('nouvelle')} style={{ background:'linear-gradient(135deg,#10B981,#059669)', color:'#fff', border:'none', padding:'10px 24px', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer' }}>＋ Créer</button></div>
              :offres.map(offre=>(
                <div key={offre.id} style={{ background:'#fff', borderRadius:14, border:'1px solid #F1F5F9', padding:'18px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                  <div><div style={{ fontSize:15, fontWeight:700, color:'#1E293B', marginBottom:4 }}>{offre.titre}</div><div style={{ fontSize:12, color:'#94A3B8' }}>{offre.departement&&`🏢 ${offre.departement} · `}🔗 localhost:3000/offres/{offre.id}</div></div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={()=>copierLien(offre.id)} style={{ padding:'7px 14px', borderRadius:8, border:'1px solid #E2E8F0', background:copiedLink===offre.id?'#ECFDF5':'#fff', color:copiedLink===offre.id?'#065F46':'#64748B', fontSize:12, fontWeight:600, cursor:'pointer' }}>{copiedLink===offre.id?'✅ Copié !':'🔗 Copier lien'}</button>
                    <button onClick={()=>voirCandidatures(offre)} style={{ padding:'7px 14px', borderRadius:8, border:'1px solid #C7D2FE', background:'#EEF2FF', color:'#4338CA', fontSize:12, fontWeight:600, cursor:'pointer' }}>👥 Candidatures</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeTab==='recrutement'&&activeRecrutTab==='nouvelle'&&(
            <div style={{ maxWidth:600 }}><div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', padding:28 }}>
              <div style={{ fontSize:15, fontWeight:700, color:'#1E293B', marginBottom:20 }}>💼 Nouvelle offre</div>
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <div><label style={lStyle}>Titre *</label><input style={iStyle} placeholder="ex: Développeur Java" value={offreForm.titre} onChange={e=>setOffreForm({...offreForm,titre:e.target.value})}/></div>
                <div><label style={lStyle}>Département</label><input style={iStyle} value={offreForm.departement} onChange={e=>setOffreForm({...offreForm,departement:e.target.value})}/></div>
                <div><label style={lStyle}>Description *</label><textarea style={{...iStyle,height:140,resize:'vertical'}} value={offreForm.description} onChange={e=>setOffreForm({...offreForm,description:e.target.value})}/></div>
                <button onClick={soumettreOffre} disabled={loadingOffre} style={{ padding:'11px', borderRadius:10, border:'none', background:loadingOffre?'#A5B4FC':'linear-gradient(135deg,#6366F1,#8B5CF6)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>{loadingOffre?'⏳...':'🚀 Publier'}</button>
              </div>
            </div></div>
          )}
          {activeTab==='recrutement'&&activeRecrutTab==='candidatures'&&(
            <div style={{ display:'grid', gridTemplateColumns:candidatSelectionne?'1fr 1fr':'1fr', gap:24 }}>
              <div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', overflow:'hidden' }}>
                <div style={{ padding:'14px 20px', borderBottom:'1px solid #F8FAFC', background:'#F8FAFC' }}><span style={{ fontSize:14, fontWeight:600, color:'#1E293B' }}>👥 {candidatures.length} candidature(s)</span></div>
                {candidatures.length===0?<div style={{ padding:48, textAlign:'center', color:'#CBD5E1' }}>Aucune candidature</div>
                :candidatures.map(c=>(
                  <div key={c.id} onClick={()=>setCandidatSelectionne(c)} style={{ padding:'14px 20px', borderBottom:'1px solid #F8FAFC', cursor:'pointer', background:candidatSelectionne?.id===c.id?'#F5F3FF':'transparent' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}><div style={{ display:'flex', alignItems:'center', gap:10 }}><Avatar nom={c.nom} prenom={c.prenom} size={34}/><div><div style={{ fontSize:13, fontWeight:600, color:'#1E293B' }}>{c.nom} {c.prenom}</div><div style={{ fontSize:11, color:'#94A3B8' }}>{c.email}</div></div></div><Badge statut={c.statut}/></div>
                  </div>
                ))}
              </div>
              {candidatSelectionne&&(
                <div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', overflow:'hidden' }}>
                  <div style={{ padding:'14px 20px', borderBottom:'1px solid #F8FAFC', display:'flex', justifyContent:'space-between' }}><span style={{ fontSize:14, fontWeight:600, color:'#1E293B' }}>Dossier</span><button onClick={()=>setCandidatSelectionne(null)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:18, color:'#94A3B8' }}>✕</button></div>
                  <div style={{ padding:20 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20, paddingBottom:16, borderBottom:'1px solid #F1F5F9' }}><Avatar nom={candidatSelectionne.nom} prenom={candidatSelectionne.prenom} size={48}/><div><div style={{ fontSize:16, fontWeight:700, color:'#1E293B' }}>{candidatSelectionne.nom} {candidatSelectionne.prenom}</div><div style={{ fontSize:13, color:'#94A3B8' }}>{candidatSelectionne.email}</div><div style={{ marginTop:6 }}><Badge statut={candidatSelectionne.statut}/></div></div></div>
                    {candidatSelectionne.cvUrl&&<div style={{ marginBottom:14, padding:'10px 14px', background:'#F0FDF4', borderRadius:10, border:'1px solid #A7F3D0' }}><a href={candidatSelectionne.cvUrl} target="_blank" rel="noreferrer" style={{ color:'#065F46', fontSize:13, fontWeight:600, textDecoration:'none' }}>📄 Voir le CV →</a></div>}
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      {candidatSelectionne.statut==='EN_ATTENTE'&&<button onClick={()=>updateStatutCandidat(candidatSelectionne.id,'ENTRETIEN')} style={{ padding:'10px', borderRadius:9, border:'none', background:'linear-gradient(135deg,#6366F1,#8B5CF6)', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>📞 Convoquer entretien</button>}
                      {(candidatSelectionne.statut==='EN_ATTENTE'||candidatSelectionne.statut==='ENTRETIEN')&&<><button onClick={()=>embaucher(candidatSelectionne.id)} style={{ padding:'10px', borderRadius:9, border:'none', background:'linear-gradient(135deg,#10B981,#059669)', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>✅ Embaucher</button><button onClick={()=>updateStatutCandidat(candidatSelectionne.id,'REFUSE')} style={{ padding:'10px', borderRadius:9, border:'1px solid #FECACA', background:'#FEF2F2', color:'#991B1B', fontSize:13, fontWeight:600, cursor:'pointer' }}>❌ Refuser</button></>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ÉVALUATIONS */}
          {activeTab==='evaluations'&&(
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
                {[{icon:'⭐',label:'Total',value:evaluations.length,accent:'#6366F1'},{icon:'✅',label:'Terminées',value:evaluations.filter(e=>e.statut==='TERMINE').length,accent:'#10B981'},{icon:'🔄',label:'En cours',value:evaluations.filter(e=>e.statut==='EN_COURS').length,accent:'#F59E0B'}].map(s=>(
                  <div key={s.label} style={{ background:'#fff', borderRadius:14, border:'1px solid #F1F5F9', padding:'18px 20px', display:'flex', alignItems:'center', gap:14 }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:s.accent+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{s.icon}</div>
                    <div><div style={{ fontSize:11, color:'#94A3B8', fontWeight:500 }}>{s.label}</div><div style={{ fontSize:24, fontWeight:700, color:'#1E293B' }}>{s.value}</div></div>
                  </div>
                ))}
              </div>
              {evaluations.length===0?<div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', padding:64, textAlign:'center' }}><div style={{ fontSize:48, marginBottom:12 }}>⭐</div><button onClick={()=>setShowEvalForm(true)} style={{ background:'linear-gradient(135deg,#6366F1,#8B5CF6)', color:'#fff', border:'none', padding:'10px 24px', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', marginTop:12 }}>＋ Créer évaluation</button></div>
              :<div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {evaluations.map(ev=>(
                  <div key={ev.id} style={{ background:'#fff', borderRadius:14, border:'1px solid #F1F5F9', padding:'18px 20px' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}><Avatar nom={ev.employe?.nom||'?'} prenom={ev.employe?.prenom||''} size={40}/><div><div style={{ fontSize:14, fontWeight:700, color:'#1E293B' }}>{ev.employe?.nom} {ev.employe?.prenom}</div><div style={{ fontSize:12, color:'#94A3B8' }}>Période : {ev.periode} · {ev.dateEvaluation||'—'}</div></div></div>
                      <Badge statut={ev.statut}/>
                    </div>
                    {ev.noteGlobale&&<div style={{ marginBottom:10 }}><div style={{ fontSize:12, color:'#64748B', marginBottom:4, fontWeight:600 }}>Note globale</div><StarRating note={ev.noteGlobale}/></div>}
                    {ev.objectifs&&<div style={{ marginBottom:8 }}><div style={{ fontSize:12, color:'#64748B', fontWeight:600, marginBottom:3 }}>🎯 Objectifs</div><div style={{ fontSize:13, color:'#475569', background:'#F8FAFC', padding:'8px 12px', borderRadius:8 }}>{ev.objectifs}</div></div>}
                  </div>
                ))}
              </div>}
            </div>
          )}

          {/* FORMATIONS */}
          {activeTab==='formations'&&(
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
                {[{icon:'🎓',label:'Total',value:formations.length,accent:'#F59E0B'},{icon:'✅',label:'Terminées',value:formations.filter(f=>f.statut==='TERMINE').length,accent:'#10B981'},{icon:'📅',label:'Planifiées',value:formations.filter(f=>f.statut==='PLANIFIE').length,accent:'#6366F1'}].map(s=>(
                  <div key={s.label} style={{ background:'#fff', borderRadius:14, border:'1px solid #F1F5F9', padding:'18px 20px', display:'flex', alignItems:'center', gap:14 }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:s.accent+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{s.icon}</div>
                    <div><div style={{ fontSize:11, color:'#94A3B8', fontWeight:500 }}>{s.label}</div><div style={{ fontSize:24, fontWeight:700, color:'#1E293B' }}>{s.value}</div></div>
                  </div>
                ))}
              </div>
              {formations.length===0?<div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', padding:64, textAlign:'center' }}><div style={{ fontSize:48, marginBottom:12 }}>🎓</div><button onClick={()=>setShowFormationForm(true)} style={{ background:'linear-gradient(135deg,#F59E0B,#D97706)', color:'#fff', border:'none', padding:'10px 24px', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', marginTop:12 }}>＋ Planifier</button></div>
              :<div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {formations.map(f=>(
                  <div key={f.id} style={{ background:'#fff', borderRadius:14, border:'1px solid #F1F5F9', padding:'18px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                      <div style={{ width:44, height:44, borderRadius:12, background:'#FFFBEB', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🎓</div>
                      <div><div style={{ fontSize:14, fontWeight:700, color:'#1E293B', marginBottom:3 }}>{f.titre}</div><div style={{ fontSize:12, color:'#94A3B8' }}>👤 {f.employe?.nom} {f.employe?.prenom}{f.organisme&&` · 🏢 ${f.organisme}`}{f.dateDebut&&` · 📆 ${f.dateDebut} → ${f.dateFin||'—'}`}</div></div>
                    </div>
                    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                      <Badge statut={f.statut}/>
                      {f.statut==='PLANIFIE'&&<button onClick={()=>updateStatutFormation(f.id,'TERMINE')} style={{ padding:'5px 12px', borderRadius:7, border:'1px solid #A7F3D0', background:'#ECFDF5', color:'#065F46', fontSize:11, fontWeight:600, cursor:'pointer' }}>✅ Terminer</button>}
                    </div>
                  </div>
                ))}
              </div>}
            </div>
          )}

          {/* SANCTIONS */}
          {activeTab==='sanctions'&&(
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
                {[{icon:'⚠️',label:'Total sanctions',value:sanctions.length,accent:'#EF4444'},{icon:'🔴',label:'Actives',value:sanctions.filter(s=>s.statut==='ACTIVE').length,accent:'#DC2626'},{icon:'✅',label:'Archivées',value:sanctions.filter(s=>s.statut!=='ACTIVE').length,accent:'#94A3B8'}].map(s=>(
                  <div key={s.label} style={{ background:'#fff', borderRadius:14, border:'1px solid #F1F5F9', padding:'18px 20px', display:'flex', alignItems:'center', gap:14 }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:s.accent+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{s.icon}</div>
                    <div><div style={{ fontSize:11, color:'#94A3B8', fontWeight:500 }}>{s.label}</div><div style={{ fontSize:24, fontWeight:700, color:'#1E293B' }}>{s.value}</div></div>
                  </div>
                ))}
              </div>
              {sanctions.length===0?<div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', padding:64, textAlign:'center' }}><div style={{ fontSize:48, marginBottom:12 }}>⚠️</div><div style={{ fontSize:16, fontWeight:600, color:'#1E293B', marginBottom:6 }}>Aucune sanction enregistrée</div><button onClick={()=>setShowSanctionForm(true)} style={{ background:'linear-gradient(135deg,#EF4444,#DC2626)', color:'#fff', border:'none', padding:'10px 24px', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', marginTop:12 }}>＋ Enregistrer une sanction</button></div>
              :<div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {sanctions.map(s=>(
                  <div key={s.id} style={{ background:'#fff', borderRadius:14, border:'1px solid #F1F5F9', padding:'18px 20px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <Avatar nom={s.employe?.nom||'?'} prenom={s.employe?.prenom||''} size={40}/>
                        <div>
                          <div style={{ fontSize:14, fontWeight:700, color:'#1E293B' }}>{s.employe?.nom} {s.employe?.prenom}</div>
                          <div style={{ fontSize:12, color:'#94A3B8' }}>{s.dateSanction} · {s.employe?.poste||s.employe?.departement||'—'}</div>
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        <span style={{ background:'#FEF2F2', color:'#991B1B', border:'1px solid #FECACA', borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:700 }}>{s.typeSanction}</span>
                        <Badge statut={s.statut}/>
                        <button onClick={()=>genererPDFSanction(s,config)} style={{ padding:'6px 14px', borderRadius:8, border:'1px solid #C7D2FE', background:'#EEF2FF', color:'#4338CA', fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
                          🖨️ Générer PDF
                        </button>
                      </div>
                    </div>
                    {s.motif&&<div style={{ marginBottom:6 }}><span style={{ fontSize:12, fontWeight:600, color:'#64748B' }}>Motif : </span><span style={{ fontSize:13, color:'#475569' }}>{s.motif}</span></div>}
                    {s.description&&<div style={{ fontSize:13, color:'#64748B', background:'#F8FAFC', padding:'8px 12px', borderRadius:8, fontStyle:'italic' }}>{s.description}</div>}
                  </div>
                ))}
              </div>}
            </div>
          )}

          {/* CONTRATS */}
          {activeTab==='contrats'&&(
            <div>
              {/* Alertes */}
              {alertesContrats.length>0&&(
                <div style={{ background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:14, padding:'16px 20px', marginBottom:20 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:'#92400E', marginBottom:10 }}>⚠️ {alertesContrats.length} contrat(s) expirant dans moins de 30 jours</div>
                  {alertesContrats.map(c=>{
                    const days = getDaysUntilExpiry(c.dateFin);
                    return (
                      <div key={c.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', background:'#fff', borderRadius:8, marginBottom:6, border:'1px solid #FDE68A' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}><Avatar nom={c.employe?.nom||'?'} prenom={c.employe?.prenom||''} size={30}/><div><div style={{ fontSize:13, fontWeight:600, color:'#1E293B' }}>{c.employe?.nom} {c.employe?.prenom}</div><div style={{ fontSize:11, color:'#94A3B8' }}>{c.type} · Expire le {c.dateFin}</div></div></div>
                        <span style={{ background:'#FEF3C7', color:'#92400E', border:'1px solid #FDE68A', borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:700 }}>⏰ {days} jour(s)</span>
                      </div>
                    );
                  })}
                </div>
              )}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
                {[{icon:'📄',label:'Total',value:contrats.length,accent:'#6366F1'},{icon:'✅',label:'CDI',value:contrats.filter(c=>c.type==='CDI').length,accent:'#10B981'},{icon:'⏰',label:'CDD',value:contrats.filter(c=>c.type==='CDD').length,accent:'#F59E0B'},{icon:'🎓',label:'Stage',value:contrats.filter(c=>c.type==='Stage').length,accent:'#8B5CF6'}].map(s=>(
                  <div key={s.label} style={{ background:'#fff', borderRadius:14, border:'1px solid #F1F5F9', padding:'16px 18px', display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:s.accent+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{s.icon}</div>
                    <div><div style={{ fontSize:11, color:'#94A3B8', fontWeight:500 }}>{s.label}</div><div style={{ fontSize:22, fontWeight:700, color:'#1E293B' }}>{s.value}</div></div>
                  </div>
                ))}
              </div>
              <div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', overflow:'hidden' }}>
                <div style={{ padding:'16px 20px', borderBottom:'1px solid #F8FAFC' }}><span style={{ fontSize:14, fontWeight:700, color:'#1E293B' }}>📄 Liste des contrats</span></div>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr style={{ background:'#F8FAFC' }}>{['Employé','Type','Date début','Date fin','Salaire brut','Statut','Action'].map(h=><th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:700, color:'#94A3B8', textTransform:'uppercase' }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {contrats.length===0?<tr><td colSpan={7} style={{ padding:48, textAlign:'center', color:'#CBD5E1' }}>Aucun contrat enregistré</td></tr>
                    :contrats.map(c=>{
                      const days = c.dateFin ? getDaysUntilExpiry(c.dateFin) : null;
                      const isAlerte = days !== null && days <= 30 && days >= 0 && c.statut==='actif';
                      return (
                        <tr key={c.id} style={{ borderTop:'1px solid #F8FAFC', background:isAlerte?'#FFFBEB':'transparent' }} onMouseEnter={e=>!isAlerte&&(e.currentTarget.style.background='#FAFBFF')} onMouseLeave={e=>!isAlerte&&(e.currentTarget.style.background='transparent')}>
                          <td style={{ padding:'12px 16px' }}><div style={{ display:'flex', alignItems:'center', gap:8 }}><Avatar nom={c.employe?.nom||'?'} prenom={c.employe?.prenom||''} size={30}/><div><div style={{ fontSize:13, fontWeight:600, color:'#1E293B' }}>{c.employe?.nom} {c.employe?.prenom}</div><div style={{ fontSize:11, color:'#94A3B8' }}>{c.employe?.poste||'—'}</div></div></div></td>
                          <td style={{ padding:'12px 16px' }}><Badge statut={c.type}/></td>
                          <td style={{ padding:'12px 16px', fontSize:13, color:'#475569' }}>{c.dateDebut||'—'}</td>
                          <td style={{ padding:'12px 16px', fontSize:13, color:isAlerte?'#92400E':'#475569', fontWeight:isAlerte?700:400 }}>{c.dateFin||'—'}{isAlerte&&<span style={{ marginLeft:6, fontSize:10, background:'#FEF3C7', color:'#92400E', padding:'1px 6px', borderRadius:10 }}>⚠️ {days}j</span>}</td>
                          <td style={{ padding:'12px 16px', fontSize:13, color:'#475569' }}>{c.salaireBrut?`${c.salaireBrut.toLocaleString('fr-FR')} MAD`:'—'}</td>
                          <td style={{ padding:'12px 16px' }}><Badge statut={c.statut}/></td>
                          <td style={{ padding:'12px 16px' }}>{c.statut==='actif'&&<button onClick={()=>terminerContrat(c.id)} style={{ padding:'5px 10px', borderRadius:7, border:'1px solid #E2E8F0', background:'#F9FAFB', color:'#64748B', fontSize:11, fontWeight:600, cursor:'pointer' }}>Terminer</button>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* DÉPART */}
          {activeTab==='depart'&&(
            <div>
              <div style={{ background:'#FEF2F2', borderRadius:14, border:'1px solid #FECACA', padding:'16px 20px', marginBottom:24, display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:24 }}>⚠️</span>
                <div><div style={{ fontSize:14, fontWeight:700, color:'#991B1B' }}>Procédure irréversible</div><div style={{ fontSize:13, color:'#B91C1C' }}>Enregistrer un départ désactivera le compte et marquera la date de sortie.</div></div>
              </div>
              <div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', overflow:'hidden' }}>
                <div style={{ padding:'16px 20px', borderBottom:'1px solid #F8FAFC' }}><span style={{ fontSize:14, fontWeight:700, color:'#1E293B' }}>👥 Employés actifs</span></div>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr style={{ background:'#F8FAFC' }}>{['Employé','Poste','Département','Date embauche','Action'].map(h=><th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:700, color:'#94A3B8', textTransform:'uppercase' }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {employesActifs.length===0?<tr><td colSpan={5} style={{ padding:48, textAlign:'center', color:'#CBD5E1' }}>Aucun employé actif</td></tr>
                    :employesActifs.map(emp=>(
                      <tr key={emp.id} style={{ borderTop:'1px solid #F8FAFC' }} onMouseEnter={e=>e.currentTarget.style.background='#FAFBFF'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <td style={{ padding:'12px 16px' }}><div style={{ display:'flex', alignItems:'center', gap:8 }}><Avatar nom={emp.nom} prenom={emp.prenom} size={32}/><div><div style={{ fontSize:13, fontWeight:600, color:'#1E293B' }}>{emp.nom} {emp.prenom}</div><div style={{ fontSize:11, color:'#94A3B8' }}>{emp.email}</div></div></div></td>
                        <td style={{ padding:'12px 16px', fontSize:13, color:'#475569' }}>{emp.poste||'—'}</td>
                        <td style={{ padding:'12px 16px', fontSize:13, color:'#475569' }}>{emp.departement||'—'}</td>
                        <td style={{ padding:'12px 16px', fontSize:13, color:'#475569' }}>{emp.dateEmbauche||'—'}</td>
                        <td style={{ padding:'12px 16px' }}><button onClick={()=>{setDepartForm({...departForm,employeId:emp.id});setShowDepartForm(true);}} style={{ padding:'5px 12px', borderRadius:7, border:'1px solid #FECACA', background:'#FEF2F2', color:'#991B1B', fontSize:12, fontWeight:600, cursor:'pointer' }}>🚪 Départ</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PROFIL */}
          {activeTab==='profil'&&(
            <div style={{ maxWidth:480 }}>
              <div style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', padding:28 }}>
                <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24, paddingBottom:20, borderBottom:'1px solid #F1F5F9' }}>
                  <Avatar nom={rhInfo?.nom} prenom={rhInfo?.prenom} size={56}/>
                  <div><div style={{ fontSize:18, fontWeight:700, color:'#1E293B' }}>{rhInfo?.nom} {rhInfo?.prenom}</div><div style={{ fontSize:13, color:'#94A3B8', marginTop:2 }}>{rhInfo?.email}</div><span style={{ background:'#ECFDF5', color:'#065F46', border:'1px solid #A7F3D0', borderRadius:20, padding:'2px 10px', fontSize:11, fontWeight:600, marginTop:6, display:'inline-block' }}>RH</span></div>
                </div>
                {[{label:'Département',value:rhInfo?.departement},{label:'Poste',value:rhInfo?.poste}].filter(r=>r.value).map(row=>(
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

      {/* MODAL ÉVALUATION */}
      {showEvalForm&&(
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, backdropFilter:'blur(4px)' }}>
          <div style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:500, maxHeight:'90vh', overflowY:'auto', padding:32, margin:16, boxShadow:'0 24px 64px rgba(0,0,0,0.18)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:24 }}><div style={{ fontSize:18, fontWeight:700, color:'#1E293B' }}>⭐ Nouvelle évaluation</div><button onClick={()=>setShowEvalForm(false)} style={{ background:'#F1F5F9', border:'none', width:32, height:32, borderRadius:8, cursor:'pointer', fontSize:16, color:'#64748B' }}>✕</button></div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div><label style={lStyle}>Employé *</label><select style={iStyle} value={evalForm.employeId} onChange={e=>setEvalForm({...evalForm,employeId:e.target.value})}><option value="">Sélectionner</option>{employesActifs.map(e=><option key={e.id} value={e.id}>{e.nom} {e.prenom} — {e.poste||e.role}</option>)}</select></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div><label style={lStyle}>Période *</label><input style={iStyle} placeholder="ex: T1 2026" value={evalForm.periode} onChange={e=>setEvalForm({...evalForm,periode:e.target.value})}/></div>
                <div><label style={lStyle}>Date</label><input type="date" style={iStyle} value={evalForm.dateEvaluation} onChange={e=>setEvalForm({...evalForm,dateEvaluation:e.target.value})}/></div>
              </div>
              <div><label style={lStyle}>Note /10</label><input type="number" min="0" max="10" style={iStyle} value={evalForm.noteGlobale} onChange={e=>setEvalForm({...evalForm,noteGlobale:e.target.value})}/></div>
              <div><label style={lStyle}>🎯 Objectifs</label><textarea style={{...iStyle,height:80,resize:'vertical'}} value={evalForm.objectifs} onChange={e=>setEvalForm({...evalForm,objectifs:e.target.value})}/></div>
              <div><label style={lStyle}>💬 Commentaire</label><textarea style={{...iStyle,height:70,resize:'vertical'}} value={evalForm.commentaire} onChange={e=>setEvalForm({...evalForm,commentaire:e.target.value})}/></div>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:24, justifyContent:'flex-end' }}>
              <button onClick={()=>setShowEvalForm(false)} style={{ padding:'10px 20px', borderRadius:10, border:'1.5px solid #E2E8F0', background:'#fff', color:'#64748B', fontSize:13, fontWeight:600, cursor:'pointer' }}>Annuler</button>
              <button onClick={soumettreEvaluation} style={{ padding:'10px 24px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#6366F1,#8B5CF6)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>✅ Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FORMATION */}
      {showFormationForm&&(
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, backdropFilter:'blur(4px)' }}>
          <div style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:500, maxHeight:'90vh', overflowY:'auto', padding:32, margin:16, boxShadow:'0 24px 64px rgba(0,0,0,0.18)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:24 }}><div style={{ fontSize:18, fontWeight:700, color:'#1E293B' }}>🎓 Nouvelle formation</div><button onClick={()=>setShowFormationForm(false)} style={{ background:'#F1F5F9', border:'none', width:32, height:32, borderRadius:8, cursor:'pointer', fontSize:16, color:'#64748B' }}>✕</button></div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div><label style={lStyle}>Employé *</label><select style={iStyle} value={formationForm.employeId} onChange={e=>setFormationForm({...formationForm,employeId:e.target.value})}><option value="">Sélectionner</option>{employesActifs.map(e=><option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>)}</select></div>
              <div><label style={lStyle}>Titre *</label><input style={iStyle} placeholder="ex: Formation React" value={formationForm.titre} onChange={e=>setFormationForm({...formationForm,titre:e.target.value})}/></div>
              <div><label style={lStyle}>Organisme</label><input style={iStyle} placeholder="ex: OFPPT, Coursera" value={formationForm.organisme} onChange={e=>setFormationForm({...formationForm,organisme:e.target.value})}/></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div><label style={lStyle}>Date début</label><input type="date" style={iStyle} value={formationForm.dateDebut} onChange={e=>setFormationForm({...formationForm,dateDebut:e.target.value})}/></div>
                <div><label style={lStyle}>Date fin</label><input type="date" style={iStyle} value={formationForm.dateFin} onChange={e=>setFormationForm({...formationForm,dateFin:e.target.value})}/></div>
              </div>
              <div><label style={lStyle}>Description</label><textarea style={{...iStyle,height:70,resize:'vertical'}} value={formationForm.description} onChange={e=>setFormationForm({...formationForm,description:e.target.value})}/></div>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:24, justifyContent:'flex-end' }}>
              <button onClick={()=>setShowFormationForm(false)} style={{ padding:'10px 20px', borderRadius:10, border:'1.5px solid #E2E8F0', background:'#fff', color:'#64748B', fontSize:13, fontWeight:600, cursor:'pointer' }}>Annuler</button>
              <button onClick={soumettreFormation} style={{ padding:'10px 24px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#F59E0B,#D97706)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>✅ Planifier</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SANCTION */}
      {showSanctionForm&&(
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, backdropFilter:'blur(4px)' }}>
          <div style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:500, maxHeight:'90vh', overflowY:'auto', padding:32, margin:16, boxShadow:'0 24px 64px rgba(0,0,0,0.18)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:24 }}><div style={{ fontSize:18, fontWeight:700, color:'#991B1B' }}>⚠️ Nouvelle sanction disciplinaire</div><button onClick={()=>setShowSanctionForm(false)} style={{ background:'#F1F5F9', border:'none', width:32, height:32, borderRadius:8, cursor:'pointer', fontSize:16, color:'#64748B' }}>✕</button></div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div><label style={lStyle}>Employé *</label><select style={iStyle} value={sanctionForm.employeId} onChange={e=>setSanctionForm({...sanctionForm,employeId:e.target.value})}><option value="">Sélectionner</option>{employesActifs.map(e=><option key={e.id} value={e.id}>{e.nom} {e.prenom} — {e.poste||'—'}</option>)}</select></div>
              <div><label style={lStyle}>Type de sanction *</label>
                <select style={iStyle} value={sanctionForm.typeSanction} onChange={e=>setSanctionForm({...sanctionForm,typeSanction:e.target.value})}>
                  <option value="">Sélectionner le type</option>
                  <option value="Avertissement verbal">Avertissement verbal</option>
                  <option value="Avertissement écrit">Avertissement écrit</option>
                  <option value="Blâme">Blâme</option>
                  <option value="Mise à pied">Mise à pied</option>
                  <option value="Licenciement pour faute">Licenciement pour faute</option>
                </select>
              </div>
              <div><label style={lStyle}>Date de la sanction</label><input type="date" style={iStyle} value={sanctionForm.dateSanction} onChange={e=>setSanctionForm({...sanctionForm,dateSanction:e.target.value})}/></div>
              <div><label style={lStyle}>Motif *</label><input style={iStyle} placeholder="Motif de la sanction" value={sanctionForm.motif} onChange={e=>setSanctionForm({...sanctionForm,motif:e.target.value})}/></div>
              <div><label style={lStyle}>Description des faits</label><textarea style={{...iStyle,height:100,resize:'vertical'}} placeholder="Décrire les faits en détail..." value={sanctionForm.description} onChange={e=>setSanctionForm({...sanctionForm,description:e.target.value})}/></div>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:24, justifyContent:'flex-end' }}>
              <button onClick={()=>setShowSanctionForm(false)} style={{ padding:'10px 20px', borderRadius:10, border:'1.5px solid #E2E8F0', background:'#fff', color:'#64748B', fontSize:13, fontWeight:600, cursor:'pointer' }}>Annuler</button>
              <button onClick={soumettreSanction} style={{ padding:'10px 24px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#EF4444,#DC2626)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>⚠️ Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONTRAT */}
      {showContratForm&&(
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, backdropFilter:'blur(4px)' }}>
          <div style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:480, padding:32, margin:16, boxShadow:'0 24px 64px rgba(0,0,0,0.18)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:24 }}><div style={{ fontSize:18, fontWeight:700, color:'#1E293B' }}>📄 Nouveau contrat</div><button onClick={()=>setShowContratForm(false)} style={{ background:'#F1F5F9', border:'none', width:32, height:32, borderRadius:8, cursor:'pointer', fontSize:16, color:'#64748B' }}>✕</button></div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div><label style={lStyle}>Employé *</label><select style={iStyle} value={contratForm.employeId} onChange={e=>setContratForm({...contratForm,employeId:e.target.value})}><option value="">Sélectionner</option>{employesActifs.map(e=><option key={e.id} value={e.id}>{e.nom} {e.prenom} — {e.poste||'—'}</option>)}</select></div>
              <div><label style={lStyle}>Type de contrat *</label>
                <select style={iStyle} value={contratForm.type} onChange={e=>setContratForm({...contratForm,type:e.target.value})}>
                  <option value="CDI">CDI — Contrat à Durée Indéterminée</option>
                  <option value="CDD">CDD — Contrat à Durée Déterminée</option>
                  <option value="Stage">Stage</option>
                </select>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div><label style={lStyle}>Date début *</label><input type="date" style={iStyle} value={contratForm.dateDebut} onChange={e=>setContratForm({...contratForm,dateDebut:e.target.value})}/></div>
                <div><label style={lStyle}>Date fin {contratForm.type==='CDI'?'(optionnel)':'*'}</label><input type="date" style={iStyle} value={contratForm.dateFin} onChange={e=>setContratForm({...contratForm,dateFin:e.target.value})}/></div>
              </div>
              <div><label style={lStyle}>Salaire brut (MAD)</label><input type="number" style={iStyle} placeholder="ex: 8000" value={contratForm.salaireBrut} onChange={e=>setContratForm({...contratForm,salaireBrut:e.target.value})}/></div>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:24, justifyContent:'flex-end' }}>
              <button onClick={()=>setShowContratForm(false)} style={{ padding:'10px 20px', borderRadius:10, border:'1.5px solid #E2E8F0', background:'#fff', color:'#64748B', fontSize:13, fontWeight:600, cursor:'pointer' }}>Annuler</button>
              <button onClick={soumettreContrat} style={{ padding:'10px 24px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#6366F1,#8B5CF6)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>📄 Créer le contrat</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DÉPART */}
      {showDepartForm&&(
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, backdropFilter:'blur(4px)' }}>
          <div style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:480, padding:32, margin:16, boxShadow:'0 24px 64px rgba(0,0,0,0.18)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}><div style={{ fontSize:18, fontWeight:700, color:'#991B1B' }}>🚪 Procédure de départ</div><button onClick={()=>setShowDepartForm(false)} style={{ background:'#F1F5F9', border:'none', width:32, height:32, borderRadius:8, cursor:'pointer', fontSize:16, color:'#64748B' }}>✕</button></div>
            <div style={{ background:'#FEF2F2', borderRadius:10, padding:'12px 16px', marginBottom:20, fontSize:13, color:'#991B1B' }}>⚠️ Cette action désactivera le compte de l'employé.</div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div><label style={lStyle}>Employé *</label><select style={iStyle} value={departForm.employeId} onChange={e=>setDepartForm({...departForm,employeId:e.target.value})}><option value="">Sélectionner</option>{employesActifs.map(e=><option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>)}</select></div>
              <div><label style={lStyle}>Date de départ *</label><input type="date" style={iStyle} value={departForm.dateDepart} onChange={e=>setDepartForm({...departForm,dateDepart:e.target.value})}/></div>
              <div><label style={lStyle}>Motif *</label><select style={iStyle} value={departForm.motifDepart} onChange={e=>setDepartForm({...departForm,motifDepart:e.target.value})}><option value="">Sélectionner</option><option value="Démission">Démission</option><option value="Licenciement">Licenciement</option><option value="Fin de contrat">Fin de contrat CDD</option><option value="Retraite">Retraite</option><option value="Mutation">Mutation</option><option value="Autre">Autre</option></select></div>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:24, justifyContent:'flex-end' }}>
              <button onClick={()=>setShowDepartForm(false)} style={{ padding:'10px 20px', borderRadius:10, border:'1.5px solid #E2E8F0', background:'#fff', color:'#64748B', fontSize:13, fontWeight:600, cursor:'pointer' }}>Annuler</button>
              <button onClick={soumettreDepart} style={{ padding:'10px 24px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#EF4444,#DC2626)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>🚪 Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}