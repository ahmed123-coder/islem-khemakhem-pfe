'use client'

import { useTranslations, useLocale } from 'next-intl'//POUR LA TRADUCTION 1 TJIB NOUSOUS TRADUITE MEN FILE LANGUE 2 T IMPORTI LA LANGUE ACTUELLE
import Hero from '@/components/Hero'
import { Button } from '@/components/ui/button'
import Link from 'next/link' //pour naviguer entre les pages sans recharger la page 
import Image from 'next/image'//pour afficher les images de manière optimisée

export default function Home() { //la base de la page d'accueil, c'est ce qui va être affiché quand on arrive sur le site
  const t = useTranslations('home') //traduire les textes en fonction de la langue actuelle, 'home' correspond à la section dans les fichiers de traduction (ex: home.json)

  const locale = useLocale()//la langue actuelle, utilisée pour construire les liens vers les autres pages (ex: /fr/solutions)

  const values = [// les valeurs de DSL, on les affiche dans la section "Nos Valeurs" de la page d'accueil
    { letter: 'D', title: t('values.determination.title'), desc: t('values.determination.description') },
    { letter: 'S', title: t('values.success.title'),       desc: t('values.success.description') },
    { letter: 'L', title: t('values.loyalty.title'),       desc: t('values.loyalty.description') },
  ]

  const benefits = t.raw('whyChoose.benefits') as string[] // avantages de choisir dsl, c'est un tableau de string dans les fichiers de traduction, on utilise t.raw pour récupérer le tableau tel quel

  return ( // la section hero de la page d'accueil, c'est un composant séparé pour plus de clarté et de réutilisabilité
    <>
      <Hero />

      {/* DSL Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-3xl">🥇</span>
            <h2 className="text-4xl font-serif font-bold text-[#1B3F7A] mt-3 mb-3">{t('values.title')}</h2>
            <div className="w-16 h-1 bg-[#7AB648] mx-auto rounded-full"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((val) => (// on affiche les valeurs de DSL dans des cartes, avec la lettre, le titre et la description de chaque valeur .map pour itérer sur le tableau de valeurs et créer une carte pour chaque valeur
              <div key={val.letter} className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow text-center">
                <div className="w-16 h-16 rounded-full bg-[#1B3F7A] flex items-center justify-center mx-auto mb-5">
                  <span className="text-3xl font-bold text-white">{val.letter}</span>
                </div>
                <div className="w-10 h-1 bg-[#7AB648] mx-auto mb-4 rounded-full"></div>
                <h3 className="text-xl font-bold text-[#1B3F7A] mb-3">{val.title}</h3>  
                <p className="text-gray-600 leading-relaxed text-sm">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Approaches & Solutions Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-[#1B3F7A] flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-serif font-bold text-[#1B3F7A] mb-3">{t('approachesSection.title')}</h3>
              <div className="w-10 h-1 bg-[#7AB648] mb-4 rounded-full"></div>
              <p className="text-gray-600 leading-relaxed mb-6">{t('approachesSection.description')}</p>
              <Link href={`/${locale}/approches`}>
                <Button className="bg-[#1B3F7A] hover:bg-[#152f5e] text-white rounded-full px-6 py-5 text-sm font-bold">
                  {t('approachesSection.cta')}
                  
                </Button>



          
              </Link>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-[#7AB648] flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div> 
              <h3 className="text-2xl font-serif font-bold text-[#1B3F7A] mb-3">{t('solutionsSection.title')}</h3>
              <div className="w-10 h-1 bg-[#7AB648] mb-4 rounded-full"></div>
              <p className="text-gray-600 leading-relaxed mb-6">{t('solutionsSection.description')}</p>
              <Link href={`/${locale}/solutions`}> 
                <Button className="bg-[#7AB648] hover:bg-[#639a3a] text-white rounded-full px-6 py-5 text-sm font-bold">
                  {t('solutionsSection.cta')} 
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose DSL */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-10">
                <h2 className="text-3xl font-serif font-bold text-[#1B3F7A] mb-3">🏆 {t('whyChoose.title')} </h2>
                <div className="w-16 h-1 bg-[#7AB648] rounded-full"></div>
              </div>
              <p className="text-gray-700 leading-relaxed mb-8">{t('whyChoose.description')}</p> 
              <div className="space-y-3 max-w-2xl">
                {benefits.map((item, i) => (//puis on affiche les avantages de choisir DSL dans une liste, avec une icône devant chaque avantage .map pour itérer sur le tableau d'avantages et créer un élément de liste pour chaque avantage
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[#7AB648] text-sm">✔️</span>
                    <p className="text-gray-700 text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative h-80 lg:h-96 rounded-2xl overflow-hidden shadow-lg">
              <Image src="/pourquoi_nous_choisir.png" alt={t('whyChoose.title')} fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      

      {/* CTA Section ://call to action pour inciter les visiteurs à créer un compte, voir les services ou contacter DSL */} 
      <section className="relative py-24 overflow-hidden" style={{background: 'linear-gradient(135deg, #1B3F7A 0%, #1a6b6b 100%)'}}>
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <span className="text-white font-bold" style={{fontSize: '20rem', letterSpacing: '-0.05em'}}>DSL</span>
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-white mb-6">
            {t('cta.title')}
          </h2>
          <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href={`/${locale}/register`}>
              <Button className="bg-white hover:bg-gray-100 text-[#1B3F7A] rounded-full px-8 py-6 text-base font-bold">
                {t('cta.createAccount')}
              </Button>
            </Link>
            <Link href={`/${locale}/solutions`}>
              <Button className="bg-[#7AB648] hover:bg-[#639a3a] text-white rounded-full px-8 py-6 text-base font-bold">
                {t('cta.viewServices')} 
              </Button>
            </Link>
            <Link href={`/${locale}/contact`} className="text-white/70 hover:text-white underline underline-offset-4 text-base font-medium transition-colors">
              {t('cta.contactUs')} 
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
