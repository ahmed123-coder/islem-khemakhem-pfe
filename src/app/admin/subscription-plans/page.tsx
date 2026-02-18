'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Plan {
  id: string;
  name: string;
  nameAr: string;
  planType: string;
  description: string;
  active: boolean;
}

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Partial<Plan>>({});

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    const res = await fetch('/api/admin/subscription-plans');
    const data = await res.json();
    setPlans(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = currentPlan.id
      ? `/api/admin/subscription-plans/${currentPlan.id}`
      : '/api/admin/subscription-plans';
    const method = currentPlan.id ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentPlan),
    });

    setIsEditing(false);
    setCurrentPlan({});
    fetchPlans();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer ce plan?')) {
      await fetch(`/api/admin/subscription-plans/${id}`, { method: 'DELETE' });
      fetchPlans();
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Subscription Plans</h1>
          <Button onClick={() => { setIsEditing(true); setCurrentPlan({}); }}>
            + Nouveau Plan
          </Button>
        </div>

        {isEditing && (
          <Card className="p-6 mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Name"
                value={currentPlan.name || ''}
                onChange={(e) => setCurrentPlan({ ...currentPlan, name: e.target.value })}
                required
              />
              <Input
                placeholder="Name (Arabic)"
                value={currentPlan.nameAr || ''}
                onChange={(e) => setCurrentPlan({ ...currentPlan, nameAr: e.target.value })}
              />
              <select
                className="w-full p-2 border rounded"
                value={currentPlan.planType || ''}
                onChange={(e) => setCurrentPlan({ ...currentPlan, planType: e.target.value })}
                required
              >
                <option value="">Select Type</option>
                <option value="ESSENTIAL">ESSENTIAL</option>
                <option value="PRO">PRO</option>
                <option value="PREMIUM">PREMIUM</option>
              </select>
              <Input
                placeholder="Description"
                value={currentPlan.description || ''}
                onChange={(e) => setCurrentPlan({ ...currentPlan, description: e.target.value })}
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={currentPlan.active ?? true}
                  onChange={(e) => setCurrentPlan({ ...currentPlan, active: e.target.checked })}
                />
                Active
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
          {plans.map((plan) => (
            <Card key={plan.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-gray-600">{plan.nameAr}</p>
                  <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded text-sm ${plan.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {plan.planType}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => { setCurrentPlan(plan); setIsEditing(true); }}>
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(plan.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
