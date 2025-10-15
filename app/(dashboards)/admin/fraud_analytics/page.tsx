import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function FraudAnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/login');
  
  // Check if user is admin
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (userData?.role !== 'admin') redirect('/donor');
  
  // Fetch fraud analysis data
  const { data: alerts } = await supabase
    .from('fraud_analysis')
    .select(`
      *,
      campaigns(patient_name, goal_amount, hospital_id, hospitals(hospital_name))
    `)
    .order('fraud_score', { ascending: false });

  const highRisk = alerts?.filter(a => a.fraud_score > 70).length || 0;
  const mediumRisk = alerts?.filter(a => a.fraud_score >= 40 && a.fraud_score <= 70).length || 0;
  const lowRisk = alerts?.filter(a => a.fraud_score < 40).length || 0;

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
          🚨 AI Fraud Detection Analytics
        </h1>
        <p className="text-gray-600">Powered by Snowflake AI & Machine Learning</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-2xl shadow-xl text-white">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm opacity-90 font-semibold">High Risk Alerts</p>
              <p className="text-5xl font-bold">{highRisk}</p>
            </div>
          </div>
          <p className="text-xs mt-2 opacity-75">Fraud Score &gt; 70 - Immediate action required</p>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-2xl shadow-xl text-white">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm opacity-90 font-semibold">Medium Risk</p>
              <p className="text-5xl font-bold">{mediumRisk}</p>
            </div>
          </div>
          <p className="text-xs mt-2 opacity-75">Fraud Score 40-70 - Review recommended</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-xl text-white">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm opacity-90 font-semibold">Low Risk / Verified</p>
              <p className="text-5xl font-bold">{lowRisk}</p>
            </div>
          </div>
          <p className="text-xs mt-2 opacity-75">Fraud Score &lt; 40 - Auto-approved</p>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Fraud Detection Results</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Patient Name</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Hospital</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Fraud Score</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Issues Detected</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {alerts && alerts.length > 0 ? (
                alerts.map(alert => (
                  <tr key={alert.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {alert.extracted_patient_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {alert.campaigns?.hospitals?.hospital_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      ₹{alert.extracted_bill_amount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                        alert.fraud_score > 70 ? 'bg-red-100 text-red-700 border-2 border-red-300' :
                        alert.fraud_score >= 40 ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300' :
                        'bg-green-100 text-green-700 border-2 border-green-300'
                      }`}>
                        {alert.fraud_score}/100
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                      {alert.fraud_reasons && alert.fraud_reasons.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1">
                          {alert.fraud_reasons.map((reason: string, idx: number) => (
                            <li key={idx}>{reason}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-green-600">No issues detected</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                        alert.status === 'flagged' ? 'bg-red-100 text-red-700' :
                        alert.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {alert.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <p className="text-lg font-semibold mb-2">No fraud analysis data yet</p>
                    <p className="text-sm">Campaigns will appear here after fraud detection runs</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
