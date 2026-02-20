import { Briefcase, Users, DollarSign, TrendingUp } from 'lucide-react'

export default function ConsultantDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Consultant Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Missions</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">24</p>
            </div>
            <Briefcase className="text-blue-500" size={40} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Clients</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">8</p>
            </div>
            <Users className="text-green-500" size={40} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Revenue</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">$45K</p>
            </div>
            <DollarSign className="text-purple-500" size={40} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Growth</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">+23%</p>
            </div>
            <TrendingUp className="text-orange-500" size={40} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Active Missions</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-800">Project {i}</h3>
                  <p className="text-sm text-gray-500">Client Name</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm">On Track</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Upcoming Meetings</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-800">Meeting {i}</h3>
                  <p className="text-sm text-gray-500">Tomorrow at 10:00 AM</p>
                </div>
                <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">Join</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
