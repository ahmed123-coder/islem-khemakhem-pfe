'use client'

// ════════════════════════════════════════════════
// IMPORTS
// ════════════════════════════════════════════════

import * as React from 'react'
import { motion } from 'framer-motion'
import { 
  Users,           // icône groupe de personnes
  UserSquare2,     // icône consultant
  Briefcase,       // icône services
  Mail,            // icône contacts
  TrendingUp,      // icône croissance
  ArrowUpRight,    // icône lien externe
  FileEdit,        // icône édition article
  Globe,           // icône site web
  Zap,
  LayoutDashboard, // icône dashboard
  ChevronRight,    // icône fil d'ariane
  Plus
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  XAxis,
  Tooltip,
  ResponsiveContainer 
} from 'recharts'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'


// ════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════
export default function AdminDashboard() {

  // fonctions de traduction fr/en
  const t      = useTranslations('dashboard')
  const adminT = useTranslations('dashboard.admin')

  // récupère la langue depuis l'URL : /fr/admin → 'fr'
  const pathname = usePathname()
  const locale   = pathname.split('/')[1] || 'en'


  // ── ÉTAT DES STATISTIQUES ────────────────────
  // useState : stocke les données, quand elles changent la page se rafraîchit
  const [stats, setStats] = React.useState({ 
    approches:         0,
    solutions:         0,
    contacts:          0,
    clients:           0,
    activeClients:     0,
    inactiveClients:   0,
    consultants:       0,
    activeConsultants: 0,
    pendingContacts:   0,
    growth:            "0",
    clientsChartData:  [] as { name: string; value: number }[],
    contactsChartData: [] as { name: string; value: number }[],
    // nouvelles stats pour le rapport
    totalOrders:       0,
    activeOrders:      0,
    pendingOrders:     0,
    completedOrders:   0,
    totalRevenue:      0,
    avgRating:         "0",
    totalReservations: 0,
  })


  // ── CHARGEMENT DES DONNÉES ───────────────────
  // useEffect avec [] : s'exécute UNE SEULE FOIS au chargement de la page
  React.useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(result => {
        const data = result.data || result
        if (data) {
          setStats({ 
            approches:         data.blogs             || 0,
            solutions:         data.services          || 0,
            contacts:          data.contacts          || 0,
            clients:           data.clients           || 0,
            activeClients:     data.activeClients     || 0,
            inactiveClients:   data.inactiveClients   || 0,
            consultants:       data.consultants       || 0,
            activeConsultants: data.activeConsultants || 0,
            pendingContacts:   data.pendingContacts   || 0,
            growth:            data.growth            || "0",
            clientsChartData:  data.clientsChartData  || [],
            contactsChartData: data.contactsChartData || [],
            // nouvelles stats — l'API les retourne déjà ou on met 0 par défaut
            totalOrders:       data.totalOrders       || 0,
            activeOrders:      data.activeOrders      || 0,
            pendingOrders:     data.pendingOrders     || 0,
            completedOrders:   data.completedOrders   || 0,
            totalRevenue:      data.totalRevenue      || 0,
            avgRating:         data.avgRating         || "0",
            totalReservations: data.totalReservations || 0,
          })
        }
      })
      .catch(() => {})
  }, [])


  // ── TÉLÉCHARGEMENT RAPPORT HTML ──────────────
  const handleDownloadReport = () => {
    const now        = new Date()
    const dateStr    = now.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    const timeStr    = now.toLocaleTimeString(locale === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    const satisfactionRate = stats.avgRating !== "0" ? `${stats.avgRating} / 5` : 'N/A'
    const revenueStr = stats.totalRevenue > 0 ? `${Number(stats.totalRevenue).toFixed(2)} TND` : 'N/A'

    const htmlContent = `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DSL Consulting — Rapport de Performance</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #f1f5f9; color: #0f172a; }

    /* ── PAGE ── */
    .page { max-width: 960px; margin: 0 auto; padding: 40px 32px; }

    /* ── HEADER ── */
    .header {
      background: linear-gradient(135deg, #1B3F7A 0%, #2563eb 100%);
      border-radius: 24px;
      padding: 40px 48px;
      color: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 32px;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: -60px; right: -60px;
      width: 200px; height: 200px;
      background: rgba(255,255,255,0.06);
      border-radius: 50%;
    }
    .header::after {
      content: '';
      position: absolute;
      bottom: -80px; left: 30%;
      width: 280px; height: 280px;
      background: rgba(255,255,255,0.04);
      border-radius: 50%;
    }
    .header-left { position: relative; z-index: 1; }
    .header-logo { font-size: 2rem; font-weight: 900; letter-spacing: -0.02em; margin-bottom: 4px; }
    .header-sub  { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; opacity: 0.7; margin-bottom: 20px; }
    .header-title { font-size: 1.1rem; font-weight: 700; opacity: 0.9; }
    .header-right { position: relative; z-index: 1; text-align: right; }
    .header-date { font-size: 0.85rem; opacity: 0.75; font-weight: 500; }
    .header-date strong { display: block; font-size: 1.5rem; font-weight: 900; opacity: 1; letter-spacing: -0.02em; }
    .badge-report {
      display: inline-block;
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 100px;
      padding: 6px 16px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-top: 12px;
    }

    /* ── SECTION TITLE ── */
    .section-title {
      font-size: 0.7rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: #64748b;
      margin: 32px 0 12px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .section-title::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #e2e8f0;
    }

    /* ── KPI GRID ── */
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 14px; }
    .kpi-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 14px; }
    .kpi-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 14px; }

    .kpi {
      background: white;
      border-radius: 16px;
      padding: 22px 20px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.05);
      border: 1px solid #f1f5f9;
    }
    .kpi.accent { background: #1B3F7A; color: white; }
    .kpi.accent .kpi-label { color: rgba(255,255,255,0.6); }
    .kpi.accent .kpi-value { color: white; }

    .kpi-icon { font-size: 1.4rem; margin-bottom: 10px; }
    .kpi-label { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #94a3b8; margin-bottom: 6px; }
    .kpi-value { font-size: 2.2rem; font-weight: 900; letter-spacing: -0.03em; color: #0f172a; line-height: 1; margin-bottom: 10px; }
    .kpi-value.revenue { font-size: 1.5rem; }
    .tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .tag {
      padding: 4px 10px;
      border-radius: 100px;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.03em;
    }
    .tag-green  { background: #dcfce7; color: #166534; }
    .tag-orange { background: #ffedd5; color: #9a3412; }
    .tag-blue   { background: #dbeafe; color: #1e40af; }
    .tag-purple { background: #f3e8ff; color: #6b21a8; }
    .tag-slate  { background: #f1f5f9; color: #475569; }
    .tag-white  { background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); }

    /* ── WIDE KPI (chiffre d'affaires) ── */
    .kpi-wide {
      background: linear-gradient(135deg, #0f172a, #1e293b);
      color: white;
      border-radius: 16px;
      padding: 24px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    }
    .kpi-wide .kpi-label { color: rgba(255,255,255,0.5); }
    .kpi-wide .kpi-value { color: white; font-size: 2.4rem; margin-bottom: 0; }
    .kpi-wide-right { text-align: right; }
    .kpi-wide-sub { font-size: 0.7rem; opacity: 0.5; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; }

    /* ── FOOTER ── */
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
      color: #94a3b8;
      font-size: 0.72rem;
      font-weight: 500;
    }
    .footer strong { color: #475569; }

    @media print {
      body { background: white; }
      .page { padding: 20px; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- ── HEADER ── -->
  <div class="header">
    <div class="header-left">
      <div class="header-logo">DSL Consulting</div>
      <div class="header-sub">Business Consulting &amp; Management Solutions</div>
      <div class="header-title">📊 Rapport de Performance</div>
      <div class="badge-report">Généré le ${dateStr} à ${timeStr}</div>
    </div>
    <div class="header-right">
      <div class="header-date">
        <span>Exercice</span>
        <strong>${now.getFullYear()}</strong>
      </div>
    </div>
  </div>

  <!-- ── SECTION 1 : Ressources humaines ── -->
  <div class="section-title">👥 Ressources Humaines</div>
  <div class="kpi-grid">
    <div class="kpi">
      <div class="kpi-icon">👤</div>
      <div class="kpi-label">Total Clients</div>
      <div class="kpi-value">${stats.clients}</div>
      <div class="tags">
        <span class="tag tag-green">${stats.activeClients} Actifs</span>
        <span class="tag tag-orange">${stats.inactiveClients} Inactifs</span>
      </div>
    </div>
    <div class="kpi accent">
      <div class="kpi-icon">🚀</div>
      <div class="kpi-label">Croissance Clients</div>
      <div class="kpi-value">+${stats.growth}%</div>
      <div class="tags">
        <span class="tag tag-white">30 derniers jours</span>
      </div>
    </div>
    <div class="kpi">
      <div class="kpi-icon">🎓</div>
      <div class="kpi-label">Consultants</div>
      <div class="kpi-value">${stats.consultants}</div>
      <div class="tags">
        <span class="tag tag-green">${stats.activeConsultants} Actifs</span>
        <span class="tag tag-orange">${stats.consultants - stats.activeConsultants} Inactifs</span>
      </div>
    </div>
    <div class="kpi">
      <div class="kpi-icon">⭐</div>
      <div class="kpi-label">Satisfaction Moyenne</div>
      <div class="kpi-value">${satisfactionRate}</div>
      <div class="tags">
        <span class="tag tag-blue">Avis clients</span>
      </div>
    </div>
  </div>

  <!-- ── SECTION 2 : Activité commerciale ── -->
  <div class="section-title">💼 Activité Commerciale</div>
  <div class="kpi-grid">
    <div class="kpi">
      <div class="kpi-icon">📦</div>
      <div class="kpi-label">Total Commandes</div>
      <div class="kpi-value">${stats.totalOrders}</div>
      <div class="tags">
        <span class="tag tag-green">${stats.activeOrders} Actives</span>
      </div>
    </div>
    <div class="kpi">
      <div class="kpi-icon">⏳</div>
      <div class="kpi-label">En Attente</div>
      <div class="kpi-value">${stats.pendingOrders}</div>
      <div class="tags">
        <span class="tag tag-orange">À traiter</span>
      </div>
    </div>
    <div class="kpi">
      <div class="kpi-icon">✅</div>
      <div class="kpi-label">Terminées</div>
      <div class="kpi-value">${stats.completedOrders}</div>
      <div class="tags">
        <span class="tag tag-blue">Missions clôturées</span>
      </div>
    </div>
    <div class="kpi">
      <div class="kpi-icon">📅</div>
      <div class="kpi-label">Réservations</div>
      <div class="kpi-value">${stats.totalReservations}</div>
      <div class="tags">
        <span class="tag tag-purple">Séances planifiées</span>
      </div>
    </div>
  </div>

  <!-- ── CHIFFRE D'AFFAIRES ── -->
  <div class="kpi-wide" style="margin-bottom:14px">
    <div>
      <div class="kpi-label">Chiffre d'Affaires Total</div>
      <div class="kpi-value revenue">${revenueStr}</div>
    </div>
    <div class="kpi-wide-right">
      <div class="kpi-wide-sub">Factures payées cumulées</div>
    </div>
  </div>

  <!-- ── SECTION 3 : Catalogue & Contenu ── -->
  <div class="section-title">🗂️ Catalogue &amp; Contenu</div>
  <div class="kpi-grid-3">
    <div class="kpi">
      <div class="kpi-icon">🛠️</div>
      <div class="kpi-label">Solutions Actives</div>
      <div class="kpi-value">${stats.solutions}</div>
      <div class="tags">
        <span class="tag tag-green">Disponibles à la vente</span>
      </div>
    </div>
    <div class="kpi">
      <div class="kpi-icon">✍️</div>
      <div class="kpi-label">Articles Publiés</div>
      <div class="kpi-value">${stats.approches}</div>
      <div class="tags">
        <span class="tag tag-blue">Approches &amp; Insights</span>
      </div>
    </div>
    <div class="kpi">
      <div class="kpi-icon">📩</div>
      <div class="kpi-label">Contacts Reçus</div>
      <div class="kpi-value">${stats.contacts}</div>
      <div class="tags">
        <span class="tag tag-green">${stats.contacts - stats.pendingContacts} Traités</span>
        <span class="tag tag-orange">${stats.pendingContacts} En attente</span>
      </div>
    </div>
  </div>

  <!-- ── FOOTER ── -->
  <div class="footer">
    <strong>DSL Consulting</strong> · business@dsl-consulting.com · www.dsl-consulting.com<br>
    RC: Tunis · MF: 1234567 · Tél: +216 00 000 000<br><br>
    Document généré automatiquement le ${dateStr} à ${timeStr} — Confidentiel
  </div>

</div>
</body>
</html>`

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href  = url
    link.setAttribute('download', `Rapport de performance de DSL Consulting -${new Date().toISOString().split('T')[0]}.html`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }


  // ── CONFIGURATION DES ANIMATIONS ─────────────
  // container : anime les cartes en cascade
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }
  // item : chaque carte monte du bas vers le haut
  const item = {
    hidden: { y: 20, opacity: 0 },
    show:   { y: 0,  opacity: 1 }
  }


  // ════════════════════════════════════════════════
  // RENDU HTML
  // ════════════════════════════════════════════════
  return (
    <div className="space-y-10">

      {/* Fil d'ariane : Admin > Dashboard */}
      <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
        <Link href={`/${locale}/admin`} className="hover:text-blue-600 transition-colors">
          {t('common.root')}
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <span className="text-blue-600">{t('common.dashboard')}</span>
      </nav>

      {/* En-tête : titre + bouton rapport */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-2">
            <LayoutDashboard className="w-3 h-3" />
            {t('common.controlCenter')}
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {t('common.dashboardOverview')}
          </h1>
          <p className="text-slate-500 font-medium">{t('common.welcomeBackMessage')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleDownloadReport}
            className="rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 font-bold text-xs px-5"
          >
            {adminT('downloadReport')}
          </Button>
        </div>
      </section>


      {/* ════════════════════════════════════════════
          GRILLE DES CARTES
          grid-cols-4 = 4 colonnes sur grand écran
      ════════════════════════════════════════════ */}
      <motion.section 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >

        {/* ── CARTE CLIENTS (2 colonnes) ──
            Pour dupliquer cette carte :
            1. Copiez ce bloc motion.div complet
            2. Changez l'icône : Users → autre icône
            3. Changez la couleur : bg-blue-600 → bg-green-600
            4. Changez stats.clients → votre donnée
            5. Changez le label adminT('totalClients') → votre texte
        */}
        <motion.div variants={item} className="md:col-span-2 lg:col-span-2">
          <Card className="relative overflow-hidden h-64 rounded-[32px] border-none bg-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] group">
            {/* cercle décoratif en arrière-plan */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-125" />
            <div className="relative p-8 flex flex-col h-full">
              {/* ligne du haut : icône + badge croissance */}
              <div className="flex items-center justify-between mb-auto">
                {/* icône — changer bg-blue-600 pour changer la couleur */}
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
              {/* bas : label + grand chiffre + graphique */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  {/* label — changer adminT('totalClients') pour changer le texte */}
                  <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em]">
                    {adminT('totalClients')}
                  </p>
                  {/* compteurs actifs / inactifs */}
                  <div className="flex gap-2 text-xs font-bold bg-slate-50 px-2 py-1 rounded-lg">
                    <span className="text-emerald-500">{stats.activeClients} {adminT('active')}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-amber-500">{stats.inactiveClients} {adminT('inactive')}</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-4">
                  {/* grand chiffre — changer stats.clients pour votre donnée */}
                  <h3 className="text-5xl font-black text-slate-900 leading-none">
                    {stats.clients}
                  </h3>
                  {/* graphique en aire */}
                  <div className="h-24 flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      {/* changer clientsChartData pour vos données */}
                      <AreaChart data={stats.clientsChartData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" hide />
                        <Tooltip
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                            formatter={(value) => [`${value ?? 0} clients`, '']}
                        />
                        {/* changer stroke="#2563eb" pour la couleur de la ligne */}
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#2563eb"
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorValue)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>


        {/* ── CARTE CONSULTANTS (1 colonne) ──
            Pour changer :
            - bg-emerald-100 = couleur fond icône
            - UserSquare2 = l'icône
            - stats.consultants = le chiffre
            - adminT('teamSize') = le label
        */}
        <motion.div variants={item}>
          <Card className="h-64 rounded-[32px] border-none bg-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-8 flex flex-col group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6 transition-transform group-hover:rotate-12">
              <UserSquare2 className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] mb-2">
              {adminT('teamSize')}
            </p>
            <div className="flex items-end gap-3 mb-auto">
              <h3 className="text-4xl font-black text-slate-900 italic leading-none">
                {stats.consultants}
              </h3>
              <span className="text-xs font-bold text-emerald-500 mb-1">
                {stats.activeConsultants} {adminT('active')}
              </span>
            </div>
            <Link 
              href={`/${locale}/admin/consultants`} 
              className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:gap-3 transition-all"
            >
              {adminT('manageExperts')} <ArrowUpRight className="w-3 h-3" />
            </Link>
          </Card>
        </motion.div>


        {/* ── CARTE SERVICES (fond noir) ──
            Carte avec fond sombre — différente des autres
            bg-slate-900 = fond noir / text-white = texte blanc
        */}
        <motion.div variants={item}>
          <Card className="h-64 rounded-[32px] border-none bg-slate-900 text-white shadow-2xl p-8 flex flex-col group relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
              <Briefcase className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mb-2">
              {adminT('offerings')}
            </p>
            <h3 className="text-4xl font-black italic mb-auto">{stats.solutions}</h3>
            <Link 
              href={`/${locale}/admin/solution`} 
              className="flex items-center gap-2 text-xs font-bold text-blue-400 hover:gap-3 transition-all relative z-10"
            >
              {adminT('activeServicesLink')} <ArrowUpRight className="w-3 h-3" />
            </Link>
          </Card>
        </motion.div>


        {/* ── CARTE CONTACTS avec graphique (2 colonnes) ──
            Même structure que carte clients
            mais couleur orange : stroke="#f97316"
        */}
        <motion.div variants={item} className="md:col-span-2">
          <Card className="rounded-[32px] border-none bg-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-8 group">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em]">
                    {adminT('inquiriesReceived')}
                  </p>
                  <div className="flex gap-2 text-xs font-bold bg-slate-50 px-2 py-1 rounded-lg">
                    <span className="text-blue-500">
                      {stats.contacts - stats.pendingContacts} {adminT('replied')}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-orange-500">{stats.pendingContacts} {adminT('pending')}</span>
                  </div>
                </div>
                <h3 className="text-3xl font-black text-slate-900">
                  {stats.contacts} {adminT('total')}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Mail className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.contactsChartData}>
                  <XAxis dataKey="name" hide />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    formatter={(value) => [`${value} contacts`, '']}
                  />
                  {/* couleur orange pour les contacts */}
                  <Area 
                    type="step" 
                    dataKey="value" 
                    stroke="#f97316"
                    strokeWidth={2}
                    fillOpacity={0.1} 
                    fill="#f97316" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>


        {/* ── ACTIONS RAPIDES (2 colonnes) ──
            Pas des cartes stats — ce sont des raccourcis de navigation
        */}
        <motion.div variants={item} className="md:col-span-2">
          <div className="grid grid-cols-2 gap-4 h-full">
            <Link href={`/${locale}/admin/approches`} className="group">
              <div className="h-full rounded-[32px] bg-white border border-slate-100 p-6 flex items-center gap-4 transition-all hover:bg-slate-50 hover:shadow-lg active:scale-95">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileEdit className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{adminT('writeapproach')}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {adminT('contentEngine')}
                  </p>
                </div>
              </div>
            </Link>
            <Link href={`/${locale}/admin/content`} className="group">
              <div className="h-full rounded-[32px] bg-white border border-slate-100 p-6 flex items-center gap-4 transition-all hover:bg-slate-50 hover:shadow-lg active:scale-95">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{adminT('editSite')}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {adminT('liveVisuals')}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </motion.div>

      </motion.section>
    </div>
  )
}