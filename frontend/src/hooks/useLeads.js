import { useState, useEffect } from 'react';
import { leadService } from '../services/leadService.js';

export const useLeads = (page = 1, limit = 20, search = '') => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await leadService.getLeads(page, limit, search);
      setLeads(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page, limit, search]);

  return {
    leads,
    loading,
    error,
    pagination,
    refetch: fetchLeads,
  };
};

export const useLead = (id) => {
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLead = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await leadService.getLeadById(id);
      setLead(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLead();
  }, [id]);

  return {
    lead,
    loading,
    error,
    refetch: fetchLead,
  };
};

export const useLeaderboard = (limit = 10) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await leadService.getLeaderboard(limit);
      setLeaderboard(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [limit]);

  return {
    leaderboard,
    loading,
    error,
    refetch: fetchLeaderboard,
  };
};