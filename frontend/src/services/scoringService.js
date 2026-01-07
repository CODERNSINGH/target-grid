import api from './api.js';

export const scoringService = {
  // Get all scoring rules
  getScoringRules: async () => {
    return api.get('/api/scoring-rules');
  },

  // Create new scoring rule
  createScoringRule: async (ruleData) => {
    return api.post('/api/scoring-rules', ruleData);
  },

  // Update scoring rule
  updateScoringRule: async (id, ruleData) => {
    return api.put(`/api/scoring-rules/${id}`, ruleData);
  },
};