import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, CheckCircle, XCircle, FileText, 
  DollarSign, User as UserIcon, BrainCircuit, Download
} from 'lucide-react';
import clsx from 'clsx';

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/requests/${id}/`);
      setRequest(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (action) => {
    if (!confirm(`Are you sure you want to ${action} this request?`)) return;
    
    setActionLoading(true);
    try {
      await api.patch(`/requests/${id}/review/`, { action, comment });
      fetchDetail(); 
      setComment('');
    } catch (error) {
      alert(error.response?.data?.detail || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-400">Loading details...</div>;
  if (!request) return <div className="p-12 text-center text-rose-500">Request not found</div>;

  const canApprove = (
    (user?.role === 'L1' && request.approval_steps.find(s => s.level === 1)?.status === 'PENDING') ||
    (user?.role === 'L2' && request.approval_steps.find(s => s.level === 2)?.status === 'PENDING' && request.approval_steps.find(s => s.level === 1)?.status === 'APPROVED')
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center text-slate-400 hover:text-indigo-600 transition-colors font-medium group"
        >
          <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center mr-3 group-hover:border-indigo-200 transition-colors shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back to List
        </button>
        <div className={clsx(
          "px-5 py-2 rounded-full text-sm font-bold border shadow-sm tracking-wide",
          request.status === 'APPROVED' ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
          request.status === 'REJECTED' ? "bg-rose-100 text-rose-700 border-rose-200" :
          "bg-amber-100 text-amber-700 border-amber-200"
        )}>
          {request.status}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-white p-8 md:p-10">
            <h1 className="text-3xl font-extrabold text-slate-800 mb-4">{request.title}</h1>
            <p className="text-slate-500 mb-8 text-lg leading-relaxed">{request.description}</p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="p-3 bg-white rounded-xl text-indigo-600 shadow-sm">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Amount</p>
                  <p className="text-xl font-bold text-slate-800">${request.amount.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="p-3 bg-white rounded-xl text-indigo-600 shadow-sm">
                  <UserIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Requested By</p>
                  <p className="text-xl font-bold text-slate-800">{request.created_by.username}</p>
                </div>
              </div>
            </div>

            {/* AI Insights Section */}
            {request.ai_metadata && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100/50">
                <div className="flex items-center gap-2 mb-4">
                  <BrainCircuit className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-indigo-900">AI Document Analysis</h3>
                </div>
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div className="bg-white/60 p-3 rounded-xl">
                    <span className="text-slate-400 block text-xs font-bold uppercase mb-1">Detected Vendor</span>
                    <span className="font-bold text-slate-700">{request.ai_metadata.vendor_name || 'N/A'}</span>
                  </div>
                  <div className="bg-white/60 p-3 rounded-xl">
                    <span className="text-slate-400 block text-xs font-bold uppercase mb-1">Confidence</span>
                    <span className="font-bold text-emerald-600">
                      {(request.ai_metadata.confidence_score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="col-span-2 bg-white/60 p-4 rounded-xl">
                    <span className="text-slate-400 block text-xs font-bold uppercase mb-2">Extracted Line Items</span>
                    <ul className="space-y-2">
                      {request.ai_metadata.items?.map((item, i) => (
                        <li key={i} className="flex justify-between text-slate-700 font-medium border-b border-slate-100 pb-1 last:border-0 last:pb-0">
                          <span>{item.description}</span>
                          <span>${item.price}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Documents Section */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-white p-8">
             <h3 className="font-bold text-slate-800 mb-6 text-lg">Attachments & Documents</h3>
             <div className="flex flex-wrap gap-4">
                <a href={request.proforma_file} target="_blank" rel="noreferrer" 
                   className="flex items-center gap-4 p-4 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all hover:shadow-md bg-white group min-w-[200px]">
                   <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                     <FileText className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="text-sm font-bold text-slate-800">Proforma Invoice</p>
                      <p className="text-xs text-slate-400">Original Upload</p>
                   </div>
                </a>
                {request.purchase_order_doc && (
                  <a href={request.purchase_order_doc} target="_blank" rel="noreferrer" 
                      className="flex items-center gap-4 p-4 border border-emerald-200 bg-emerald-50/30 rounded-2xl hover:bg-emerald-50 transition-all hover:shadow-md min-w-[200px] group">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                        <Download className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-sm font-bold text-emerald-900">Generated PO</p>
                         <p className="text-xs text-emerald-600">Official Document</p>
                      </div>
                  </a>
                )}
             </div>
          </div>
        </div>

        {/* Right Column: Approval Timeline */}
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-white p-8">
            <h3 className="font-bold text-slate-800 mb-6 text-lg">Approval Workflow</h3>
            <div className="relative border-l-2 border-indigo-100 ml-3 space-y-10 pl-8 py-2">
              {request.approval_steps.map((step, idx) => (
                <div key={idx} className="relative">
                  {/* Status Dot */}
                  <span className={clsx(
                    "absolute -left-[41px] top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white shadow-sm z-10",
                    step.status === 'APPROVED' ? "border-emerald-500 text-emerald-500" :
                    step.status === 'REJECTED' ? "border-rose-500 text-rose-500" :
                    "border-slate-300 text-slate-300"
                  )}>
                    {step.status === 'APPROVED' ? <CheckCircle className="w-3.5 h-3.5" /> : 
                     step.status === 'REJECTED' ? <XCircle className="w-3.5 h-3.5" /> : 
                     <div className="w-2 h-2 rounded-full bg-slate-300" />}
                  </span>

                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                    Level {step.level} Approval
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    {step.approver_name ? `Reviewed by ${step.approver_name}` : 'Pending Review'}
                  </p>
                  
                  {step.status !== 'PENDING' && (
                    <div className={clsx(
                      "mt-3 text-xs p-3 rounded-xl border",
                      step.status === 'APPROVED' ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"
                    )}>
                      <span className={clsx(
                        "font-bold block mb-1",
                        step.status === 'APPROVED' ? "text-emerald-700" : "text-rose-700"
                      )}>
                        {step.status}
                      </span>
                      {step.comments && <p className="text-slate-600 italic">"{step.comments}"</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Card */}
          {canApprove && (
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl shadow-lg shadow-indigo-500/30 p-6 text-white">
              <h3 className="font-bold text-lg mb-4">Review Required</h3>
              <p className="text-indigo-100 text-sm mb-4">This request is pending your approval level. Please review the details above.</p>
              
              <textarea
                className="w-full text-sm p-3 border-0 bg-white/10 rounded-xl mb-4 focus:ring-2 focus:ring-white/50 outline-none text-white placeholder-indigo-200"
                placeholder="Add a comment (optional)..."
                rows={3}
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <button
                  disabled={actionLoading}
                  onClick={() => handleReview('reject')}
                  className="flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors backdrop-blur-sm"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => handleReview('approve')}
                  className="flex items-center justify-center gap-2 py-3 bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl font-bold shadow-lg transition-colors"
                >
                  <CheckCircle className="w-4 h-4" /> Approve
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}