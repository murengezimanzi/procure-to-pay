import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { FileText, Clock, CheckCircle2, XCircle, ChevronRight, TrendingUp } from 'lucide-react';
import clsx from 'clsx';

export default function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests/');
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'REJECTED': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const StatCard = ({ label, count, icon: Icon, gradient }) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`} />
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
          <p className="text-4xl font-extrabold text-slate-800">{count}</p>
        </div>
        <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          label="Total Requests" 
          count={requests.length} 
          icon={FileText} 
          gradient="from-indigo-500 to-blue-500"
        />
        <StatCard 
          label="Pending" 
          count={requests.filter(r => r.status === 'PENDING').length} 
          icon={Clock} 
          gradient="from-amber-400 to-orange-500"
        />
        <StatCard 
          label="Approved" 
          count={requests.filter(r => r.status === 'APPROVED').length} 
          icon={CheckCircle2} 
          gradient="from-emerald-400 to-teal-500"
        />
        <StatCard 
          label="Rejected" 
          count={requests.filter(r => r.status === 'REJECTED').length} 
          icon={XCircle} 
          gradient="from-rose-400 to-red-500"
        />
      </div>

      {/* Requests List */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-white overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <div>
             <h3 className="text-xl font-bold text-slate-800">Recent Activity</h3>
             <p className="text-slate-400 text-sm mt-1">Monitor the status of your purchase requests</p>
          </div>
          <button className="text-indigo-600 font-bold text-sm hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl transition-colors">
            View All
          </button>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-slate-400 animate-pulse">Loading data...</div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
             <FileText className="w-12 h-12 mb-4 opacity-20" />
             <p>No requests found. Create one to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {requests.map((req) => (
              <div 
                key={req.id} 
                onClick={() => navigate(`/requests/${req.id}`)}
                className="p-6 flex items-center justify-between hover:bg-slate-50/80 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">
                    {req.title.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">
                      {req.title}
                    </h4>
                    <p className="text-sm text-slate-500 font-medium">
                      Requested by <span className="text-slate-700">{req.created_by.username}</span> • <span className="font-mono text-slate-600">${req.amount.toLocaleString()}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <span className={clsx(
                    "px-4 py-1.5 text-xs font-bold rounded-full border shadow-sm",
                    getStatusColor(req.status)
                  )}>
                    {req.status}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all">
                     <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}