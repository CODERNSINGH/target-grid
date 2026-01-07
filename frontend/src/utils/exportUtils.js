// Export utilities for CSV and other formats

export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    // Header row
    headers.join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that might contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    )
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

export const formatLeadsForExport = (leads) => {
  return leads.map(lead => ({
    'Lead ID': lead.id,
    'Email': lead.email,
    'First Name': lead.firstName || '',
    'Last Name': lead.lastName || '',
    'Company': lead.company || '',
    'Phone': lead.phone || '',
    'Current Score': lead.currentScore,
    'Max Score': lead.maxScore,
    'Last Activity': lead.lastProcessedEventTime 
      ? new Date(lead.lastProcessedEventTime).toLocaleDateString()
      : 'No activity',
    'Created Date': new Date(lead.createdAt).toLocaleDateString(),
  }));
};

export const formatEventsForExport = (events) => {
  return events.map(event => ({
    'Event ID': event.eventId,
    'Lead ID': event.leadId,
    'Event Type': event.eventType,
    'Timestamp': new Date(event.timestamp).toLocaleString(),
    'Processed': event.processed ? 'Yes' : 'No',
    'Metadata': JSON.stringify(event.metadata || {}),
  }));
};

export const formatScoreHistoryForExport = (history) => {
  return history.map(record => ({
    'Lead ID': record.leadId,
    'Previous Score': record.previousScore,
    'New Score': record.newScore,
    'Event Type': record.eventType || '',
    'Reason': record.reason,
    'Timestamp': new Date(record.timestamp).toLocaleString(),
  }));
};