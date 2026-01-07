import api from './api.js';

export const leadService = {
  // Get all leads with pagination and search
  getLeads: async (page = 1, limit = 20, search = '') => {
    const params = new URLSearchParams({ page, limit, search });
    return api.get(`/api/leads?${params}`);
  },

  // Get lead by ID
  getLeadById: async (id) => {
    return api.get(`/api/leads/${id}`);
  },

  // Create new lead
  createLead: async (leadData) => {
    return api.post('/api/leads', leadData);
  },

  // Get leaderboard
  getLeaderboard: async (limit = 10) => {
    return api.get(`/api/leads/leaderboard?limit=${limit}`);
  },

  // Get score history for a lead
  getScoreHistory: async (leadId, page = 1, limit = 20) => {
    const params = new URLSearchParams({ page, limit });
    return api.get(`/api/leads/${leadId}/score-history?${params}`);
  },
};