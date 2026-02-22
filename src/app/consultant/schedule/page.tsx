'use client'

import { Card } from '@/components/ui/card'
import { Calendar, Clock } from 'lucide-react'

export default function ConsultantSchedulePage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
        <p className="text-gray-600 mt-2">Manage your appointments and availability</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-center h-96 text-gray-400">
              <div className="text-center">
                <Calendar size={64} className="mx-auto mb-4" />
                <p className="text-lg">Calendar view coming soon</p>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Upcoming Appointments</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Clock className="text-blue-600 mt-1" size={20} />
                <div>
                  <p className="font-medium text-gray-900">Client Meeting</p>
                  <p className="text-sm text-gray-600">Tomorrow at 10:00 AM</p>
                </div>
              </div>
              <div className="text-center py-8 text-gray-500 text-sm">
                No more appointments scheduled
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
