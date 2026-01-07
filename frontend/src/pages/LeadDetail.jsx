import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Building, Calendar, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLead } from '../hooks/useLeads.js';
import { useSocket } from '../hooks/useSocket.js';
import { leadService } from '../services/leadService.js';
import { eventService } from '../services/eventService.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const LeadDetail = () => {
  const { id } = useParams();
  const { lead, loading, error, refetch } = useLead(id);
  const [scoreHistory, setScoreHistory] = useState([]);
  const [events, setEvents] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const socket = useSocket();

  useEffect(() => {
    if (id) {
      socket.joinLead(id);
      fetchScoreHistory();
      fetchEvents();
    }

    return () => {
      if (id) {
        socket.leaveLead(id);
      }
    };
  }, [id, socket]);

  // Real-time updates
  useEffect(() => {
    const handleScoreUpdate = (data) => {
      if (data.leadId === id) {
        refetch();
        fetchScoreHistory();
      }
    };

    socket.onScoreUpdate(handleScoreUpdate);

    return () => {
      socket.removeAllListeners();
    };
  }, [id, socket, refetch]);

  const fetchScoreHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await leadService.getScoreHistory(id, 1, 50);
      setScoreHistory(response.data.reverse()); // Reverse to show chronological order
    } catch (err) {
      console.error('Error fetching score history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      setEventsLoading(true);
      const response = await eventService.getEvents(id, 1, 20);
      setEvents(response.data);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setEventsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatChartData = (history) => {
    return history.map((item, index) => ({
      timestamp: new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: item.newScore,
      previousScore: item.previousScore,
    }));
  };

  const getEventTypeColor = (eventType) => {
    const colors = {
      PAGE_VIEW: 'bg-blue-100 text-blue-800',
      EMAIL_OPEN: 'bg-green-100 text-green-800',
      FORM_SUBMIT: 'bg-yellow-100 text-yellow-800',
      DEMO_REQUEST: 'bg-purple-100 text-purple-800',
      PURCHASE: 'bg-red-100 text-red-800',
    };
    return colors[eventType] || 'bg-gray-100 text-gray-800';
  };

  const getEventTypeLabel = (eventType) => {
    const labels = {
      PAGE_VIEW: 'Page View',
      EMAIL_OPEN: 'Email Open',
      FORM_SUBMIT: 'Form Submit',
      DEMO_REQUEST: 'Demo Request',
      PURCHASE: 'Purchase',
    };
    return labels[eventType] || eventType;
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

  if (!lead) {
    return (
      <div className="p-8">
        <ErrorMessage message="Lead not found" />
      </div>
    );
  }

  const chartData = formatChartData(scoreHistory);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/leads"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Leads
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {lead.firstName && lead.lastName 
                ? `${lead.firstName} ${lead.lastName}`
                : 'Lead Details'
              }
            </h1>
            <p className="text-gray-600 mt-2">{lead.email}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{lead.currentScore}</div>
            <div className="text-sm text-gray-500">Current Score</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lead Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead Information</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Email</div>
                  <div className="text-sm text-gray-600">{lead.email}</div>
                </div>
              </div>
              {lead.phone && (
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Phone</div>
                    <div className="text-sm text-gray-600">{lead.phone}</div>
                  </div>
                </div>
              )}
              {lead.company && (
                <div className="flex items-center">
                  <Building className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Company</div>
                    <div className="text-sm text-gray-600">{lead.company}</div>
                  </div>
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Created</div>
                  <div className="text-sm text-gray-600">{formatDate(lead.createdAt)}</div>
                </div>
              </div>
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Last Activity</div>
                  <div className="text-sm text-gray-600">
                    {lead.lastProcessedEventTime 
                      ? formatDate(lead.lastProcessedEventTime)
                      : 'No activity'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Score Progress */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Score Progress</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm font-medium text-gray-900 mb-2">
                  <span>Current Score</span>
                  <span>{lead.currentScore} / {lead.maxScore}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(lead.currentScore / lead.maxScore) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {Math.round((lead.currentScore / lead.maxScore) * 100)}% of maximum score
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Timeline */}
        <div className="lg:col-span-2">
          {/* Score Trend Chart */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Score Trend</h2>
            {historyLoading ? (
              <LoadingSpinner className="h-64" />
            ) : chartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No score history available
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Recent Events */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Events</h2>
            {eventsLoading ? (
              <LoadingSpinner />
            ) : events.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No events yet</p>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEventTypeColor(event.eventType)}`}>
                        {getEventTypeLabel(event.eventType)}
                      </span>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {getEventTypeLabel(event.eventType)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(event.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {event.processed ? 'Processed' : 'Pending'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Score History Table */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Score History</h2>
            {historyLoading ? (
              <LoadingSpinner />
            ) : scoreHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No score history yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score Change
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        New Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reason
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {scoreHistory.slice().reverse().map((history) => (
                      <tr key={history.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(history.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {history.eventType && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEventTypeColor(history.eventType)}`}>
                              {getEventTypeLabel(history.eventType)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`font-medium ${
                            history.newScore > history.previousScore 
                              ? 'text-green-600' 
                              : history.newScore < history.previousScore 
                                ? 'text-red-600' 
                                : 'text-gray-600'
                          }`}>
                            {history.newScore > history.previousScore ? '+' : ''}
                            {history.newScore - history.previousScore}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {history.newScore}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {history.reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;