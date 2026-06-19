"use client";
import { useState, useEffect, use } from 'react';
import axios from 'axios';

const API = 'http://localhost:8080/api';

export default function PageCandidature({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [offre, setOffre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', cvUrl: '', motivation: ''
  });

  useEffect(() => {
    if (id) {
      fetchOffre();
    }
  }, [id]);

  const fetchOffre = async () => {
    try {
      const res = await axios.get(`${API}/recrutement/${id}`);
      setOffre(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePostuler = async () => {
    if (!form.nom || !form.email) { alert('Nom et email obligatoires.'); return; }
    setSending(true);
    try {
      await axios.post(`${API}/recrutement/${id}/postuler`, form);
      setSubmitted(true);
    } catch (e) {
      alert('Erreur : ' + (e.response?.data || e.message));
    } finally {
      setSending(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px',
    border: '1.5px solid #E2E8F0', borderRadius: 10,
    fontSize: 14, color: '#1E293B', outline: 'none',
    background: '#F8FAFC', fontFamily: 'inherit',
    boxSizing: 'border-box'
  };
  const labelStyle = {
    fontSize: 12, fontWeight: 600, color: '#64748B',
    marginBottom: 5, display: 'block'
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <div style={{ fontSize: 16, color: '#94A3B8' }}>⏳ Chargement de l'offre...</div>
    </div>
  );

  if (!offre) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>😕</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1E293B' }}>Offre introuvable</div>
        <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 6 }}>Cette offre n'existe pas ou a été supprimée.</div>
      </div>
    </div>
  );

  if (submitted) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1E3A5F,#4F46E5)', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '48px 40px', maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#1E293B', marginBottom: 8 }}>Candidature envoyée !</div>
        <div style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6 }}>
          Votre candidature pour le poste de <strong>{offre.titre}</strong> a bien été reçue.
          Nous vous contacterons à <strong>{form.email}</strong> pour la suite du processus.
        </div>
        <div style={{ marginTop: 24, padding: '12px 20px', background: '#F0FDF4', borderRadius: 10, fontSize: 13, color: '#065F46' }}>
          ✅ Bonne chance dans votre candidature !
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1E3A5F,#4F46E5)', padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: '#A5B4FC', marginBottom: 8, fontWeight: 500 }}>SGRH — Offre d'emploi</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 12 }}>{offre.titre}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          {offre.departement && (
            <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
              🏢 {offre.departement}
            </span>
          )}
          <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
            📍 Sur site
          </span>
          <span style={{ background: '#10B981', color: '#fff', padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
            ✅ Poste ouvert
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* Description */}
        <div>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F1F5F9', padding: 24, marginBottom: 16, boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1E293B', marginBottom: 14 }}>📋 Description du poste</div>
            <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {offre.description || 'Aucune description fournie.'}
            </div>
          </div>

          <div style={{ background: '#EEF2FF', borderRadius: 14, padding: 18, border: '1px solid #C7D2FE' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#4338CA', marginBottom: 8 }}>💡 Comment postuler ?</div>
            <div style={{ fontSize: 12, color: '#4338CA', lineHeight: 1.8 }}>
              1. Remplissez le formulaire ci-contre<br/>
              2. Ajoutez le lien de votre CV (Google Drive, LinkedIn...)<br/>
              3. Rédigez une courte motivation<br/>
              4. Cliquez sur "Envoyer ma candidature"
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F1F5F9', padding: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1E293B', marginBottom: 20 }}>📝 Postuler maintenant</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={labelStyle}>Nom *</label>
                <input style={inputStyle} placeholder="Votre nom"
                  value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} />
              </div>
              <div>
                <label style={labelStyle}>Prénom</label>
                <input style={inputStyle} placeholder="Votre prénom"
                  value={form.prenom} onChange={e => setForm({...form, prenom: e.target.value})} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Email *</label>
              <input style={inputStyle} type="email" placeholder="votre@email.com"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>

            <div>
              <label style={labelStyle}>Lien CV <span style={{ color: '#94A3B8', fontWeight: 400 }}>(Google Drive, LinkedIn...)</span></label>
              <input style={inputStyle} placeholder="https://drive.google.com/..."
                value={form.cvUrl} onChange={e => setForm({...form, cvUrl: e.target.value})} />
            </div>

            <div>
              <label style={labelStyle}>Lettre de motivation</label>
              <textarea style={{ ...inputStyle, height: 110, resize: 'vertical' }}
                placeholder="Pourquoi êtes-vous intéressé par ce poste ?"
                value={form.motivation} onChange={e => setForm({...form, motivation: e.target.value})} />
            </div>

            <button onClick={handlePostuler} disabled={sending} style={{
              padding: '13px', borderRadius: 10, border: 'none',
              background: sending ? '#A5B4FC' : 'linear-gradient(135deg,#6366F1,#8B5CF6)',
              color: '#fff', fontSize: 14, fontWeight: 700,
              cursor: sending ? 'not-allowed' : 'pointer', fontFamily: 'inherit'
            }}>
              {sending ? '⏳ Envoi en cours...' : '🚀 Envoyer ma candidature'}
            </button>

            <div style={{ fontSize: 11, color: '#94A3B8', textAlign: 'center' }}>
              Vos données sont utilisées uniquement dans le cadre de ce recrutement.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}