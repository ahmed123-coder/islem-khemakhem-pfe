'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Package {
  id: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  features: any;
  maxMessages: number | null;
  maxMissions: number | null;
  hasDiagnostic: boolean;
  subscription_plans: {
    name: string;
    nameAr: string;
    planType: string;
    description: string;
  };
}

export default function PricingPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

  useEffect(() => {
    fetch('/api/admin/subscription-packages')
      .then((res) => res.json())
      .then((data) => setPackages(data));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Nos Offres
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Choisissez le plan qui correspond à vos besoins
          </p>
          
          <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-white">
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-6 py-2 rounded-md transition ${
                billingCycle === 'MONTHLY'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingCycle('YEARLY')}
              className={`px-6 py-2 rounded-md transition ${
                billingCycle === 'YEARLY'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annuel
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {packages.map((pkg) => {
            const features = typeof pkg.features === 'string' ? JSON.parse(pkg.features) : pkg.features;
            const price = billingCycle === 'MONTHLY' ? pkg.priceMonthly : pkg.priceYearly;
            
            return (
              <Card
                key={pkg.id}
                className={`p-8 hover:shadow-2xl transition ${
                  pkg.subscription_plans.planType === 'PRO'
                    ? 'border-2 border-blue-600 relative'
                    : ''
                }`}
              >
                {pkg.subscription_plans.planType === 'PRO' && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm">
                    Populaire
                  </div>
                )}
                
                <h3 className="text-2xl font-bold mb-2">{pkg.subscription_plans.name}</h3>
                <p className="text-gray-600 mb-6">{pkg.subscription_plans.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold">{Number(price).toFixed(3)}</span>
                  <span className="text-gray-600 ml-2">{pkg.currency}</span>
                  <span className="text-gray-500 block text-sm">
                    / {billingCycle === 'MONTHLY' ? 'mois' : 'an'}
                  </span>
                </div>

                <ul className="space-y-3 mb-8">
                  {features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    pkg.subscription_plans.planType === 'PRO'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                >
                  Choisir ce plan
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
