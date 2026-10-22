"use client";
import { useRouter } from 'next/navigation';

export default function Accueil() {
  const router = useRouter();

  return (
    <div style={{ minHeight:'100vh', fontFamily:"'DM Sans','Segoe UI',sans-serif", background:'#F8FAFC' }}>

      {/* NAVBAR */}
      <nav style={{ background:'#fff', borderBottom:'1px solid #F1F5F9', padding:'0 48px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100, boxShadow:'0 1px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,#6366F1,#8B5CF6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🏢</div>
          <div>
            <div style={{ fontSize:16, fontWeight:800, color:'#1E293B' }}>SGRH</div>
            <div style={{ fontSize:10, color:'#94A3B8' }}>Système de Gestion RH</div>
          </div>
        </div>
        <button onClick={()=>router.push('/login')} style={{ background:'linear-gradient(135deg,#6366F1,#8B5CF6)', color:'#fff', border:'none', padding:'10px 24px', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer' }}>
          Se connecter →
        </button>
      </nav>

      {/* HERO */}
      <div style={{ background:'linear-gradient(135deg,#1E3A5F 0%,#4F46E5 100%)', padding:'80px 48px', textAlign:'center' }}>
        <div style={{ display:'inline-block', background:'rgba(255,255,255,0.1)', borderRadius:20, padding:'8px 20px', fontSize:12, color:'#A5B4FC', fontWeight:600, marginBottom:24, border:'1px solid rgba(255,255,255,0.2)' }}>
          🎓 Projet de Fin d'Année — EMSI Rabat
        </div>
        <h1 style={{ fontSize:48, fontWeight:800, color:'#fff', margin:'0 0 16px', lineHeight:1.2 }}>
          Système de Gestion des<br/>
          <span style={{ color:'#A5B4FC' }}>Ressources Humaines</span>
        </h1>
        <p style={{ fontSize:16, color:'#CBD5E1', maxWidth:600, margin:'0 auto 40px', lineHeight:1.8 }}>
          Une solution complète pour gérer les employés, les congés, les pointages, les évaluations et le recrutement au sein de votre entreprise.
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={()=>router.push('/login')} style={{ background:'#fff', color:'#4338CA', border:'none', padding:'14px 32px', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer' }}>
            🚀 Accéder à l'application
          </button>
          <button onClick={()=>document.getElementById('features').scrollIntoView({behavior:'smooth'})} style={{ background:'transparent', color:'#fff', border:'2px solid rgba(255,255,255,0.4)', padding:'14px 32px', borderRadius:12, fontSize:14, fontWeight:600, cursor:'pointer' }}>
            Voir les fonctionnalités ↓
          </button>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:20, maxWidth:700, margin:'60px auto 0' }}>
          {[
            {value:'3',label:'Rôles utilisateurs'},
            {value:'10+',label:'Modules RH'},
            {value:'100%',label:'Full Stack'},
            {value:'2026',label:'Année PFA'},
          ].map(s=>(
            <div key={s.label} style={{ background:'rgba(255,255,255,0.1)', borderRadius:14, padding:'20px 16px', border:'1px solid rgba(255,255,255,0.15)' }}>
              <div style={{ fontSize:28, fontWeight:800, color:'#fff' }}>{s.value}</div>
              <div style={{ fontSize:11, color:'#A5B4FC', marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FONCTIONNALITÉS */}
      <div id="features" style={{ padding:'80px 48px', maxWidth:1100, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#6366F1', marginBottom:8, textTransform:'uppercase', letterSpacing:'.1em' }}>Fonctionnalités</div>
          <h2 style={{ fontSize:32, fontWeight:800, color:'#1E293B', margin:0 }}>Tout ce dont vous avez besoin</h2>
          <p style={{ fontSize:15, color:'#64748B', marginTop:12 }}>Une plateforme complète pour gérer votre équipe efficacement</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
          {[
            { icon:'👥', title:'Gestion des employés', desc:'Créer, modifier et archiver les profils employés. Gérer les rôles et les départements.', color:'#6366F1', bg:'#EEF2FF' },
            { icon:'⏱️', title:'Pointage & Présences', desc:'Suivi des entrées/sorties, gestion des retards et absences en temps réel.', color:'#10B981', bg:'#ECFDF5' },
            { icon:'📅', title:'Gestion des congés', desc:'Demandes de congés, validation par les administrateurs, calendrier global.', color:'#F59E0B', bg:'#FFFBEB' },
            { icon:'💼', title:'Recrutement', desc:'Publier des offres, gérer les candidatures et embaucher directement depuis la plateforme.', color:'#8B5CF6', bg:'#F5F3FF' },
            { icon:'⭐', title:'Évaluations', desc:'Évaluer les performances des employés, noter et commenter leur travail.', color:'#EF4444', bg:'#FEF2F2' },
            { icon:'🎓', title:'Formations', desc:'Planifier et suivre les formations des employés avec statut et organisme.', color:'#0891B2', bg:'#E0F2FE' },
            { icon:'📄', title:'Contrats', desc:"Gérer les contrats CDI, CDD et stages avec alertes d'expiration automatiques.", color:'#059669', bg:'#ECFDF5' },
            { icon:'⚠️', title:'Sanctions', desc:'Enregistrer les sanctions disciplinaires et générer des courriers officiels PDF.', color:'#DC2626', bg:'#FEF2F2' },
            { icon:'🏗️', title:'Organigramme', desc:"Visualiser la hiérarchie de l'entreprise de manière interactive et dynamique.", color:'#7C3AED', bg:'#F5F3FF' },
          ].map(f=>(
            <div key={f.title} style={{ background:'#fff', borderRadius:16, border:'1px solid #F1F5F9', padding:24, boxShadow:'0 1px 4px rgba(0,0,0,0.04)', transition:'transform .2s, box-shadow .2s' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.1)';}}
              onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.04)';}}>
              <div style={{ width:48, height:48, borderRadius:12, background:f.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, marginBottom:16 }}>{f.icon}</div>
              <div style={{ fontSize:15, fontWeight:700, color:'#1E293B', marginBottom:8 }}>{f.title}</div>
              <div style={{ fontSize:13, color:'#64748B', lineHeight:1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RÔLES */}
      <div style={{ background:'#fff', padding:'80px 48px', borderTop:'1px solid #F1F5F9' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#6366F1', marginBottom:8, textTransform:'uppercase', letterSpacing:'.1em' }}>Rôles</div>
            <h2 style={{ fontSize:32, fontWeight:800, color:'#1E293B', margin:0 }}>3 espaces dédiés</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
            {[
              { icon:'⚙️', role:'Administrateur', bg:'linear-gradient(135deg,#6366F1,#8B5CF6)', features:['Gestion complète des employés','Suivi des pointages','Validation des congés','Organigramme & Configuration'] },
              { icon:'🏢', role:'Responsable RH', bg:'linear-gradient(135deg,#10B981,#059669)', features:['Recrutement & candidatures','Évaluations & formations','Gestion des contrats','Sanctions & procédures'] },
              { icon:'👤', role:'Employé', bg:'linear-gradient(135deg,#F59E0B,#D97706)', features:['Pointage quotidien','Demandes de congés','Consulter ses évaluations','Voir son contrat & formations'] },
            ].map(r=>(
              <div key={r.role} style={{ borderRadius:20, overflow:'hidden', boxShadow:'0 4px 16px rgba(0,0,0,0.08)' }}>
                <div style={{ background:r.bg, padding:'28px 24px', textAlign:'center' }}>
                  <div style={{ fontSize:40, marginBottom:12 }}>{r.icon}</div>
                  <div style={{ fontSize:18, fontWeight:800, color:'#fff' }}>{r.role}</div>
                </div>
                <div style={{ background:'#fff', padding:24 }}>
                  {r.features.map(f=>(
                    <div key={f} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                      <div style={{ width:6, height:6, borderRadius:'50%', background:'#6366F1', flexShrink:0 }}/>
                      <span style={{ fontSize:13, color:'#475569' }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TECHNO */}
      <div style={{ padding:'60px 48px', maxWidth:1100, margin:'0 auto', textAlign:'center' }}>
        <div style={{ fontSize:13, fontWeight:700, color:'#6366F1', marginBottom:8, textTransform:'uppercase', letterSpacing:'.1em' }}>Stack technique</div>
        <h2 style={{ fontSize:32, fontWeight:800, color:'#1E293B', marginBottom:40 }}>Technologies utilisées</h2>
        <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
          {[
            {label:'Spring Boot 3', icon:'☕', desc:'Backend'},
            {label:'Next.js 15', icon:'⚛️', desc:'Frontend'},
            {label:'MySQL', icon:'🗄️', desc:'Base de données'},
            {label:'Java 17', icon:'♨️', desc:'Langage'},
            {label:'Hibernate JPA', icon:'🔗', desc:'ORM'},
            {label:'Axios', icon:'🌐', desc:'HTTP Client'},
          ].map(t=>(
            <div key={t.label} style={{ background:'#fff', borderRadius:14, border:'1px solid #F1F5F9', padding:'20px 24px', minWidth:130, boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize:28, marginBottom:8 }}>{t.icon}</div>
              <div style={{ fontSize:13, fontWeight:700, color:'#1E293B' }}>{t.label}</div>
              <div style={{ fontSize:11, color:'#94A3B8', marginTop:2 }}>{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background:'linear-gradient(135deg,#1E3A5F,#4F46E5)', padding:'60px 48px', textAlign:'center' }}>
        <h2 style={{ fontSize:32, fontWeight:800, color:'#fff', marginBottom:16 }}>Prêt à commencer ?</h2>
        <p style={{ fontSize:15, color:'#CBD5E1', marginBottom:32 }}>Connectez-vous pour accéder à votre espace</p>
        <button onClick={()=>router.push('/login')} style={{ background:'#fff', color:'#4338CA', border:'none', padding:'14px 40px', borderRadius:12, fontSize:15, fontWeight:700, cursor:'pointer' }}>
          Se connecter →
        </button>
      </div>

      {/* FOOTER */}
      <div style={{ background:'#0F172A', padding:'24px 48px', textAlign:'center' }}>
        <p style={{ fontSize:12, color:'#475569', margin:0 }}>© 2026 SGRH — Projet de Fin d'Année — EMSI Rabat</p>
      </div>
    </div>
  );
}