import React, { useState, useEffect } from 'react';
import { Settings, Edit, Save, X } from 'lucide-react';
import { scoringService } from '../services/scoringService.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const ScoringRules = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingRule, setEditingRule] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await scoringService.getScoringRules();
      setRules(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rule) => {
    setEditingRule({ ...rule });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await scoringService.updateScoringRule(editingRule.id, {
        eventType: editingRule.eventType,
        points: editingRule.points,
        enabled: editingRule.enabled,
        description: editingRule.description,
      });
      
      setMessage({ type: 'success', text: 'Scoring rule updated successfully!' });
      setEditingRule(null);
      await fetchRules();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingRule(null);
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
  if (loading && !editingRule) {
    return (
      <div className="p-8">
        <LoadingSpinner size="lg" className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorMessage message={error} onRetry={fetchRules} />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Scoring Rules</h1>
        <p className="text-gray-600 mt-2">Configure points awarded for different event types</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Event Scoring Configuration
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEventTypeColor(rule.eventType)}`}>
                      {getEventTypeLabel(rule.eventType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingRule && editingRule.id === rule.id ? (
                      <input
                        type="number"
                        min="0"
                        value={editingRule.points}
                        onChange={(e) => setEditingRule({ ...editingRule, points: parseInt(e.target.value) || 0 })}
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-gray-900">+{rule.points}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingRule && editingRule.id === rule.id ? (
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingRule.enabled}
                          onChange={(e) => setEditingRule({ ...editingRule, enabled: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Enabled</span>
                      </label>
                    ) : (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        rule.enabled 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {rule.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingRule && editingRule.id === rule.id ? (
                      <input
                        type="text"
                        value={editingRule.description || ''}
                        onChange={(e) => setEditingRule({ ...editingRule, description: e.target.value })}
                        placeholder="Enter description..."
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <span className="text-sm text-gray-600">{rule.description || '-'}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingRule && editingRule.id === rule.id ? (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={handleSave}
                          disabled={loading}
                          className="text-green-600 hover:text-green-900 inline-flex items-center"
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="text-gray-600 hover:text-gray-900 inline-flex items-center"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(rule)}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <p className="mb-2"><strong>Note:</strong> Changes to scoring rules will only affect new events. Existing scores will not be recalculated.</p>
            <p>Disabled rules will not award points for new events of that type.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoringRules;