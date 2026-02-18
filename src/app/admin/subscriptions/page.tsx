'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Subscription {
  id: string;
  userId: string;
  packageId: string;
  billingCycle: string;
  status: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  user: { name: string; email: string };
  subscription_packages: {
    subscription_plans: { name: string };
  };
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSub, setCurrentSub] = useState<any>({});

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    const res = await fetch('/api/admin/subscriptions');
    const data = await res.json();
    setSubscriptions(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = currentSub.id
      ? `/api/admin/subscriptions/${currentSub.id}`
      : '/api/admin/subscriptions';
    const method = currentSub.id ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentSub),
    });

    setIsEditing(false);
    setCurrentSub({});
    fetchSubscriptions();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer cette subscription?')) {
      await fetch(`/api/admin/subscriptions/${id}`, { method: 'DELETE' });
      fetchSubscriptions();
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Subscriptions</h1>
          <Button onClick={() => { setIsEditing(true); setCurrentSub({ status: 'ACTIVE', billingCycle: 'MONTHLY', autoRenew: true }); }}>
            + Nouvelle Subscription
          </Button>
        </div>

        {isEditing && (
          <Card className="p-6 mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="User ID"
                value={currentSub.userId || ''}
                onChange={(e) => setCurrentSub({ ...currentSub, userId: e.target.value })}
                required
                disabled={!!currentSub.id}
              />
              <Input
                placeholder="Package ID"
                value={currentSub.packageId || ''}
                onChange={(e) => setCurrentSub({ ...currentSub, packageId: e.target.value })}
                required
                disabled={!!currentSub.id}
              />
              <select
                className="w-full p-2 border rounded"
                value={currentSub.status || 'ACTIVE'}
                onChange={(e) => setCurrentSub({ ...currentSub, status: e.target.value })}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="PAST_DUE">PAST_DUE</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="EXPIRED">EXPIRED</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
              <select
                className="w-full p-2 border rounded"
                value={currentSub.billingCycle || 'MONTHLY'}
                onChange={(e) => setCurrentSub({ ...currentSub, billingCycle: e.target.value })}
              >
                <option value="MONTHLY">MONTHLY</option>
                <option value="YEARLY">YEARLY</option>
              </select>
              <Input
                type="date"
                placeholder="Start Date"
                value={currentSub.startDate?.split('T')[0] || ''}
                onChange={(e) => setCurrentSub({ ...currentSub, startDate: e.target.value })}
                required={!currentSub.id}
              />
              <Input
                type="date"
                placeholder="End Date"
                value={currentSub.endDate?.split('T')[0] || ''}
                onChange={(e) => setCurrentSub({ ...currentSub, endDate: e.target.value })}
                required={!currentSub.id}
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={currentSub.autoRenew ?? true}
                  onChange={(e) => setCurrentSub({ ...currentSub, autoRenew: e.target.checked })}
                />
                Auto Renew
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
          {subscriptions.map((sub) => (
            <Card key={sub.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">{sub.user.name}</h3>
                  <p className="text-gray-600">{sub.user.email}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Plan: {sub.subscription_packages.subscription_plans.name} | {sub.billingCycle}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(sub.startDate).toLocaleDateString()} - {new Date(sub.endDate).toLocaleDateString()}
                  </p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded text-sm ${
                    sub.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {sub.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => { setCurrentSub(sub); setIsEditing(true); }}>
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(sub.id)}>
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
