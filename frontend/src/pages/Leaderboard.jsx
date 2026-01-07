import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Medal, Award, Eye } from 'lucide-react';
import { useLeaderboard } from '../hooks/useLeads.js';
import { useLeaderboardUpdates } from '../hooks/useSocket.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const Leaderboard = () => {
  const { leaderboard, loading, error, refetch } = useLeaderboard(50);

  // Real-time updates
  useLeaderboardUpdates(() => {
    refetch();
  });

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-500" />;
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-sm font-bold">
            {rank}
          </div>
        );
    }
  };

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
      default:
        return 'bg-white border border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="lg" className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorMessage message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
        <p className="text-gray-600 mt-2">Top performing leads by score</p>
      </div>

      {leaderboard.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No leads yet</h3>
          <p className="text-gray-600">Start adding leads to see the leaderboard</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {leaderboard.length >= 3 && (
            <div className="mb-8">
              <div className="flex justify-center items-end space-x-4">
                {/* Second Place */}
                <div className="text-center">
                  <div className={`p-6 rounded-lg shadow-lg ${getRankBadge(2)} mb-4`}>
                    <Medal className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-lg font-bold">
                      {leaderboard[1].firstName && leaderboard[1].lastName 
                        ? `${leaderboard[1].firstName} ${leaderboard[1].lastName}`
                        : leaderboard[1].email
                      }
                    </div>
                    <div className="text-sm opacity-90">{leaderboard[1].company}</div>
                    <div className="text-2xl font-bold mt-2">{leaderboard[1].currentScore}</div>
                  </div>
                  <div className="text-sm text-gray-600">#2</div>
                </div>

                {/* First Place */}
                <div className="text-center">
                  <div className={`p-8 rounded-lg shadow-xl ${getRankBadge(1)} mb-4 transform scale-110`}>
                    <Trophy className="w-10 h-10 mx-auto mb-2" />
                    <div className="text-xl font-bold">
                      {leaderboard[0].firstName && leaderboard[0].lastName 
                        ? `${leaderboard[0].firstName} ${leaderboard[0].lastName}`
                        : leaderboard[0].email
                      }
                    </div>
                    <div className="text-sm opacity-90">{leaderboard[0].company}</div>
                    <div className="text-3xl font-bold mt-2">{leaderboard[0].currentScore}</div>
                  </div>
                  <div className="text-sm text-gray-600">#1</div>
                </div>

                {/* Third Place */}
                <div className="text-center">
                  <div className={`p-6 rounded-lg shadow-lg ${getRankBadge(3)} mb-4`}>
                    <Award className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-lg font-bold">
                      {leaderboard[2].firstName && leaderboard[2].lastName 
                        ? `${leaderboard[2].firstName} ${leaderboard[2].lastName}`
                        : leaderboard[2].email
                      }
                    </div>
                    <div className="text-sm opacity-90">{leaderboard[2].company}</div>
                    <div className="text-2xl font-bold mt-2">{leaderboard[2].currentScore}</div>
                  </div>
                  <div className="text-sm text-gray-600">#3</div>
                </div>
              </div>
            </div>
          )}

          {/* Full Leaderboard Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Complete Rankings</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lead
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboard.map((lead, index) => {
                    const rank = index + 1;
                    return (
                      <tr 
                        key={lead.id} 
                        className={`hover:bg-gray-50 ${
                          rank <= 3 ? 'bg-gradient-to-r from-blue-50 to-transparent' : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getRankIcon(rank)}
                            <span className="ml-2 text-sm font-medium text-gray-900">
                              #{rank}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {lead.firstName && lead.lastName 
                                ? `${lead.firstName} ${lead.lastName}`
                                : 'Unknown Name'
                              }
                            </div>
                            <div className="text-sm text-gray-500">{lead.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{lead.company || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-lg font-bold text-gray-900">{lead.currentScore}</div>
                            <div className="text-sm text-gray-500 ml-1">points</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            to={`/leads/${lead.id}`}
                            className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Leaderboard;