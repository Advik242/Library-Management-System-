import { useFetch } from '../../hooks/useFetch';
import RevenueChart from '../../components/charts/RevenueChart';
import UserGrowthChart from '../../components/charts/UserGrowthChart';
import PopularBooksChart from '../../components/charts/PopularBooksChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#84cc16', '#f97316'];

export default function Analytics() {
  const { data: revenueData } = useFetch('/analytics/revenue?period=month');
  const { data: userGrowth } = useFetch('/analytics/user-growth');
  const { data: popularBooks } = useFetch('/analytics/popular-books');
  const { data: genreDistribution } = useFetch('/analytics/genre-distribution');

  const genreChartData = genreDistribution?.map(item => ({
    name: item._id,
    count: item.count
  })) || [];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title"><span className="text-gradient">Analytics</span> Dashboard</h1>
        <p className="page-subtitle">Insights and statistics about your library</p>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <RevenueChart data={revenueData} />
        <UserGrowthChart data={userGrowth} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <PopularBooksChart data={popularBooks} />
        
        {/* Genre Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Books by Genre</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={genreChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#64748b" />
                <YAxis dataKey="name" type="category" stroke="#64748b" width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {genreChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
