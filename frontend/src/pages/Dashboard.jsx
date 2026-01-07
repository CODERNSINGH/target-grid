import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Trophy, Activity, TrendingUp, ArrowRight } from 'lucide-react';
import { useLeads, useLeaderboard } from '../hooks/useLeads.js';
import { useScoreUpdates, useLeaderboardUpdates } from '../hooks/useSocket.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const Dashboard = () => {
  const { leads, loading: leadsLoading, error: leadsError, refetch: refetchLeads } = useLeads(1, 5);
  const { leaderboard, loading: leaderboardLoading, error: leaderboardError, refetch: refetchLeaderboard } = useLeaderboard(5);
  const [stats, setStats] = useState({
    totalLeads: 0,
    averageScore: 0,
    totalEvents: 0,
    topScore: 0,
  });

  // Real-time updates
  useScoreUpdates(() => {
    refetchLeads();
    refetchLeaderboard();
  });

  useLeaderboardUpdates(() => {
    refetchLeaderboard();
  });

  useEffect(() => {
    if (leads.length > 0) {
      const totalScore = leads.reduce((sum, lead) => sum + lead.currentScore, 0);
      const topScore = Math.max(...leads.map(lead => lead.currentScore));
      
      setStats({
        totalLeads: leads.length,
        averageScore: Math.round(totalScore / leads.length),
        totalEvents: leads.reduce((sum, lead) => sum + (lead.events?.length || 0), 0),
        topScore,
      });
    }
  }, [leads]);

  const StatCard = ({ icon: Icon, title, value, color, link }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
      {link && (
        <div className="mt-4">
          <Link
            to={link}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium inline-flex items-center transition-colors"
          >
            View all
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      )}
    </div>
  );

  if (leadsLoading || leaderboardLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (leadsError || leaderboardError) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <ErrorMessage 
          message={leadsError || leaderboardError} 
          onRetry={() => {
            refetchLeads();
            refetchLeaderboard();
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Welcome to your lead scoring overview</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            title="Total Leads"
            value={stats.totalLeads}
            color="bg-blue-500"
            link="/leads"
          />
          <StatCard
            icon={TrendingUp}
            title="Average Score"
            value={stats.averageScore}
            color="bg-green-500"
          />
          <StatCard
            icon={Activity}
            title="Total Events"
            value={stats.totalEvents}
            color="bg-purple-500"
            link="/events"
          />
          <StatCard
            icon={Trophy}
            title="Top Score"
            value={stats.topScore}
            color="bg-yellow-500"
            link="/leaderboard"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Leads */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Leads</h2>
                <Link
                  to="/leads"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium inline-flex items-center transition-colors"
                >
                  View all
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
            <div className="p-6">
              {leads.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No leads yet</p>
                  <Link
                    to="/leads"
                    className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Add your first lead
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {leads.map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {(lead.firstName?.[0] || lead.email[0]).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">
                            {lead.firstName && lead.lastName 
                              ? `${lead.firstName} ${lead.lastName}`
                              : lead.email
                            }
                          </p>
                          <p className="text-sm text-gray-600">{lead.email}</p>
                          {lead.company && (
                            <p className="text-sm text-gray-500">{lead.company}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{lead.currentScore}</p>
                        <p className="text-sm text-gray-500">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Top Performers</h2>
                <Link
                  to="/leaderboard"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium inline-flex items-center transition-colors"
                >
                  View all
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
            <div className="p-6">
              {leaderboard.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No data yet</p>
                  <Link
                    to="/events"
                    className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Submit some events
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {leaderboard.map((lead, index) => (
                    <div key={lead.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">
                            {lead.firstName && lead.lastName 
                              ? `${lead.firstName} ${lead.lastName}`
                              : lead.email
                            }
                          </p>
                          {lead.company && (
                            <p className="text-sm text-gray-500">{lead.company}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{lead.currentScore}</p>
                        <p className="text-sm text-gray-500">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;