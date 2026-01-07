import React, { useState } from 'react';
import { Plus, Upload, FileText, Download } from 'lucide-react';
import { eventService } from '../services/eventService.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const Events = () => {
  const [activeTab, setActiveTab] = useState('manual');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Manual event form
  const [eventForm, setEventForm] = useState({
    event_id: '',
    lead_id: '',
    event_type: 'PAGE_VIEW',
    timestamp: new Date().toISOString().slice(0, 16),
    metadata: '{}'
  });

  // File upload
  const [selectedFile, setSelectedFile] = useState(null);

  const eventTypes = [
    { value: 'PAGE_VIEW', label: 'Page View' },
    { value: 'EMAIL_OPEN', label: 'Email Open' },
    { value: 'FORM_SUBMIT', label: 'Form Submit' },
    { value: 'DEMO_REQUEST', label: 'Demo Request' },
    { value: 'PURCHASE', label: 'Purchase' }
  ];

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      let metadata = {};
      if (eventForm.metadata.trim()) {
        metadata = JSON.parse(eventForm.metadata);
      }

      const eventData = {
        ...eventForm,
        timestamp: new Date(eventForm.timestamp).toISOString(),
        metadata
      };

      await eventService.createEvent(eventData);
      setMessage({ type: 'success', text: 'Event created successfully!' });
      
      // Reset form
      setEventForm({
        event_id: '',
        lead_id: '',
        event_type: 'PAGE_VIEW',
        timestamp: new Date().toISOString().slice(0, 16),
        metadata: '{}'
      });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select a file' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await eventService.uploadEvents(selectedFile);
      setMessage({ 
        type: 'success', 
        text: `File uploaded successfully! Processed: ${result.processed}, Errors: ${result.errors}` 
      });
      setSelectedFile(null);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const generateSampleCSV = () => {
    const sampleData = [
      'event_id,lead_id,event_type,timestamp,metadata',
      `${crypto.randomUUID()},user@example.com,PAGE_VIEW,${new Date().toISOString()},"{}"`
    ].join('\n');

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_events.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Events</h1>
        <p className="text-gray-600 mt-2">Submit events manually or upload in bulk</p>
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

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('manual')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'manual'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Manual Entry
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              File Upload
            </button>
          </nav>
        </div>
      </div>
      {/* Manual Entry Tab */}
      {activeTab === 'manual' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Event Manually</h2>
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event ID
                </label>
                <input
                  type="text"
                  value={eventForm.event_id}
                  onChange={(e) => setEventForm({ ...eventForm, event_id: e.target.value })}
                  placeholder="Auto-generate or enter custom ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setEventForm({ ...eventForm, event_id: crypto.randomUUID() })}
                  className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  Generate UUID
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lead ID (Email)
                </label>
                <input
                  type="email"
                  required
                  value={eventForm.lead_id}
                  onChange={(e) => setEventForm({ ...eventForm, lead_id: e.target.value })}
                  placeholder="lead@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type
                </label>
                <select
                  value={eventForm.event_type}
                  onChange={(e) => setEventForm({ ...eventForm, event_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {eventTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timestamp
                </label>
                <input
                  type="datetime-local"
                  required
                  value={eventForm.timestamp}
                  onChange={(e) => setEventForm({ ...eventForm, timestamp: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metadata (JSON)
              </label>
              <textarea
                value={eventForm.metadata}
                onChange={(e) => setEventForm({ ...eventForm, metadata: e.target.value })}
                placeholder='{"key": "value"}'
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? <LoadingSpinner size="sm" className="mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Create Event
            </button>
          </form>
        </div>
      )}
      {/* File Upload Tab */}
      {activeTab === 'upload' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Events File</h2>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-md">
            <h3 className="text-sm font-medium text-blue-900 mb-2">File Format Requirements:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Supported formats: CSV, JSON</li>
              <li>• Maximum file size: 10MB</li>
              <li>• Maximum 1000 events per file</li>
              <li>• Required fields: event_id, lead_id, event_type, timestamp</li>
            </ul>
            <button
              onClick={generateSampleCSV}
              className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              <Download className="w-4 h-4 mr-1" />
              Download Sample CSV
            </button>
          </div>

          <form onSubmit={handleFileUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload a file</span>
                      <input
                        type="file"
                        accept=".csv,.json"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">CSV or JSON up to 10MB</p>
                </div>
              </div>
              {selectedFile && (
                <div className="mt-2 text-sm text-gray-600">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !selectedFile}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? <LoadingSpinner size="sm" className="mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
              Upload Events
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Events;