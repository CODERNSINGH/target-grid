import api from './api.js';

export const eventService = {
  // Create single event
  createEvent: async (eventData) => {
    return api.post('/api/events', eventData);
  },

  // Create batch events
  createBatchEvents: async (eventsData) => {
    return api.post('/api/events/batch', eventsData);
  },

  // Upload events file
  uploadEvents: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/api/events/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get events for a lead
  getEvents: async (leadId, page = 1, limit = 20) => {
    const params = new URLSearchParams({ page, limit });
    return api.get(`/api/events/lead/${leadId}?${params}`);
  },
};