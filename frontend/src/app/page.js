"use client";
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({ email: '', password: '', role: 'RH' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8080/api/utilisateurs/login', {
        email: credentials.email,
        motDePasse: credentials.password
      });

      if (response.data) {
        const user = response.data;
        const roleServeur = (user.role || '').toUpperCase();
        const roleChoisi  = credentials.role.toUpperCase();

        // Vérifie que le rôle choisi correspond au vrai rôle en DB
        if (roleServeur !== roleChoisi) {
          setError(`Ce compte n'est pas un compte ${credentials.role}.`);
          setLoading(false);
          return;
        }

        localStorage.setItem('user', JSON.stringify(user));

        if (roleServeur === 'ADMIN') {
          router.push('/admin/dashboard');
        } else if (roleServeur === 'RH') {
          router.push('/rh/recrutement/nouvelle-offre');
        } else if (roleServeur === 'MANAGER') {
          router.push('/manager/dashboard');
        } else {
          setError("Accès non configuré pour ce rôle.");
        }
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Email ou mot de passe incorrect.");
      } else if (err.response?.status === 403) {
        setError("Compte désactivé. Contactez l'administrateur.");
      } else {
        setError("Erreur serveur. Vérifiez que le backend est démarré.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1E3A5F 0%, #4F46E5 100%)',
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif", padding: 16
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '40px 36px',
        width: '100%', maxWidth: 420,
        boxShadow: '0 24px 64px rgba(0,0,0,0.2)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, margin: '0 auto 12px'
          }}>🏢</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1E293B' }}>SGRH Connect</div>
          <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>Portail de gestion des ressources humaines</div>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Sélecteur de rôle */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 6, display: 'block' }}>
              Votre rôle
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {[
                { value: 'ADMIN',   label: 'Admin',   icon: '⚙️' },
                { value: 'RH',      label: 'RH',      icon: '👥' },
                { value: 'MANAGER', label: 'Manager', icon: '📊' },
              ].map(r => (
                <button key={r.value} type="button"
                  onClick={() => setCredentials({...credentials, role: r.value})}
                  style={{
                    padding: '10px 8px', borderRadius: 10, cursor: 'pointer',
                    border: credentials.role === r.value ? '2px solid #6366F1' : '1.5px solid #E2E8F0',
                    background: credentials.role === r.value ? '#EEF2FF' : '#F8FAFC',
                    color: credentials.role === r.value ? '#4338CA' : '#64748B',
                    fontWeight: credentials.role === r.value ? 700 : 500,
                    fontSize: 12, fontFamily: 'inherit',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    transition: 'all .15s'
                  }}>
                  <span style={{ fontSize: 20 }}>{r.icon}</span>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 6, display: 'block' }}>
              Adresse Email
            </label>
            <input type="email" name="email" required
              placeholder="votre@email.com"
              onChange={handleChange}
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10,
                border: '1.5px solid #E2E8F0', fontSize: 14, color: '#1E293B',
                outline: 'none', background: '#F8FAFC', fontFamily: 'inherit',
                boxSizing: 'border-box'
              }} />
          </div>

          {/* Mot de passe */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 6, display: 'block' }}>
              Mot de passe
            </label>
            <input type="password" name="password" required
              placeholder="••••••••"
              onChange={handleChange}
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10,
                border: '1.5px solid #E2E8F0', fontSize: 14, color: '#1E293B',
                outline: 'none', background: '#F8FAFC', fontFamily: 'inherit',
                boxSizing: 'border-box'
              }} />
          </div>

          {/* Erreur */}
          {error && (
            <div style={{
              background: '#FEF2F2', color: '#991B1B',
              border: '1px solid #FECACA', borderRadius: 10,
              padding: '10px 14px', fontSize: 13
            }}>{error}</div>
          )}

          {/* Bouton */}
          <button type="submit" disabled={loading} style={{
            padding: '13px', borderRadius: 10, border: 'none',
            background: loading ? '#A5B4FC' : 'linear-gradient(135deg,#6366F1,#8B5CF6)',
            color: '#fff', fontSize: 14, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', marginTop: 4
          }}>
            {loading ? '⏳ Connexion...' : 'Se connecter →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#CBD5E1', marginTop: 24 }}>
          © 2026 Système de Gestion des Ressources Humaines
        </p>
      </div>
    </main>
  );
}