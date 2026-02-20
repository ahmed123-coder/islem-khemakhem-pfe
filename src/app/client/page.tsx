import { FileText, Clock, CheckCircle } from 'lucide-react'

export default function ClientDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Client Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Missions</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">5</p>
            </div>
            <FileText className="text-blue-500" size={40} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Tasks</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">12</p>
            </div>
            <Clock className="text-orange-500" size={40} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Completed</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">28</p>
            </div>
            <CheckCircle className="text-green-500" size={40} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Missions</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-800">Mission {i}</h3>
                <p className="text-sm text-gray-500">In Progress</p>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">Active</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
