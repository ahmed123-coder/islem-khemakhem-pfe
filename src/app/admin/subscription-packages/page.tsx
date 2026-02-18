'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Package {
  id: string;
  planId: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  features: any;
  maxMessages: number | null;
  maxMissions: number | null;
  hasDiagnostic: boolean;
  subscription_plans: { name: string };
}

interface Plan {
  id: string;
  name: string;
}

export default function SubscriptionPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPackage, setCurrentPackage] = useState<any>({});

  useEffect(() => {
    fetchPackages();
    fetchPlans();
  }, []);

  const fetchPackages = async () => {
    const res = await fetch('/api/admin/subscription-packages');
    const data = await res.json();
    setPackages(data);
  };

  const fetchPlans = async () => {
    const res = await fetch('/api/admin/subscription-plans');
    const data = await res.json();
    setPlans(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = currentPackage.id
      ? `/api/admin/subscription-packages/${currentPackage.id}`
      : '/api/admin/subscription-packages';
    const method = currentPackage.id ? 'PUT' : 'POST';

    const features = currentPackage.features?.split(',').map((f: string) => f.trim()) || [];

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...currentPackage,
        features: JSON.stringify(features),
        priceMonthly: parseFloat(currentPackage.priceMonthly),
        priceYearly: parseFloat(currentPackage.priceYearly),
        maxMessages: currentPackage.maxMessages ? parseInt(currentPackage.maxMessages) : null,
        maxMissions: currentPackage.maxMissions ? parseInt(currentPackage.maxMissions) : null,
      }),
    });

    setIsEditing(false);
    setCurrentPackage({});
    fetchPackages();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer ce package?')) {
      await fetch(`/api/admin/subscription-packages/${id}`, { method: 'DELETE' });
      fetchPackages();
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Subscription Packages</h1>
          <Button onClick={() => { setIsEditing(true); setCurrentPackage({}); }}>
            + Nouveau Package
          </Button>
        </div>

        {isEditing && (
          <Card className="p-6 mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <select
                className="w-full p-2 border rounded"
                value={currentPackage.planId || ''}
                onChange={(e) => setCurrentPackage({ ...currentPackage, planId: e.target.value })}
                required
              >
                <option value="">Select Plan</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>{plan.name}</option>
                ))}
              </select>
              <Input
                type="number"
                step="0.001"
                placeholder="Price Monthly"
                value={currentPackage.priceMonthly || ''}
                onChange={(e) => setCurrentPackage({ ...currentPackage, priceMonthly: e.target.value })}
                required
              />
              <Input
                type="number"
                step="0.001"
                placeholder="Price Yearly"
                value={currentPackage.priceYearly || ''}
                onChange={(e) => setCurrentPackage({ ...currentPackage, priceYearly: e.target.value })}
                required
              />
              <Input
                placeholder="Features (comma separated)"
                value={currentPackage.features || ''}
                onChange={(e) => setCurrentPackage({ ...currentPackage, features: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Max Messages"
                value={currentPackage.maxMessages || ''}
                onChange={(e) => setCurrentPackage({ ...currentPackage, maxMessages: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Max Missions"
                value={currentPackage.maxMissions || ''}
                onChange={(e) => setCurrentPackage({ ...currentPackage, maxMissions: e.target.value })}
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={currentPackage.hasDiagnostic ?? true}
                  onChange={(e) => setCurrentPackage({ ...currentPackage, hasDiagnostic: e.target.checked })}
                />
                Has Diagnostic
              </label>
              <div className="flex gap-2">
                <Button type="submit">Save</Button>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="grid gap-4">
          {packages.map((pkg) => {
            const features = typeof pkg.features === 'string' ? JSON.parse(pkg.features) : pkg.features;
            return (
              <Card key={pkg.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">{pkg.subscription_plans.name}</h3>
                    <p className="text-gray-600 mt-2">
                      {pkg.priceMonthly} {pkg.currency}/month | {pkg.priceYearly} {pkg.currency}/year
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Messages: {pkg.maxMessages || 'Unlimited'} | Missions: {pkg.maxMissions || 'Unlimited'}
                    </p>
                    <ul className="mt-2 text-sm">
                      {features.map((f: string, i: number) => (
                        <li key={i}>• {f}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => {
                      const featuresStr = typeof pkg.features === 'string' ? JSON.parse(pkg.features).join(', ') : pkg.features.join(', ');
                      setCurrentPackage({ ...pkg, features: featuresStr });
                      setIsEditing(true);
                    }}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(pkg.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
