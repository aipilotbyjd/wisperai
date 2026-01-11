import { Mic, Clock, TrendingUp } from 'lucide-react'

export function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <button className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-left hover:from-blue-400 hover:to-blue-500 transition-all">
          <Mic className="mb-2" size={24} />
          <h3 className="font-semibold">Start Recording</h3>
          <p className="text-sm text-blue-200">Ctrl+Shift+R</p>
        </button>

        <div className="bg-gray-800/50 p-6 rounded-xl">
          <Clock className="mb-2 text-gray-400" size={24} />
          <h3 className="font-semibold">Minutes Used</h3>
          <p className="text-2xl font-bold text-blue-400">0</p>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-xl">
          <TrendingUp className="mb-2 text-gray-400" size={24} />
          <h3 className="font-semibold">This Week</h3>
          <p className="text-2xl font-bold text-green-400">--</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Transcriptions" value="0" />
        <StatCard label="Words" value="0" />
        <StatCard label="Avg. Accuracy" value="--" />
        <StatCard label="Time Saved" value="--" />
      </div>

      <div className="bg-gray-800/30 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Transcriptions</h2>
        <p className="text-gray-500 text-sm">No transcriptions yet. Press Ctrl+Shift+R to start recording.</p>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-800/30 rounded-lg p-4">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  )
}
