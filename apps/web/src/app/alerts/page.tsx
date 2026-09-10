import React from 'react';

export default function AlertsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Alert Management</h1>
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-3 font-medium text-slate-500">Severity</th>
              <th className="px-6 py-3 font-medium text-slate-500">Location</th>
              <th className="px-6 py-3 font-medium text-slate-500">Timestamp</th>
              <th className="px-6 py-3 font-medium text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                Awaiting data connection
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
