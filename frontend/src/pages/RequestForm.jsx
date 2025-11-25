import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, UploadCloud, DollarSign, Type, FileText } from 'lucide-react';

export default function RequestForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    proforma_file: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, proforma_file: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

    try {
      await api.post('/requests/', data);
      navigate('/');
    } catch (err) {
      alert('Failed to create request');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center text-slate-400 hover:text-indigo-600 transition-colors mb-6 font-medium"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </button>

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-white p-8 md:p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800">New Purchase Request</h1>
          <p className="text-slate-500 mt-2">Fill in the details below to initiate a new procurement workflow.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Request Title</label>
              <div className="relative">
                <Type className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. New Office Laptops"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Estimated Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type="number"
                  name="amount"
                  required
                  placeholder="0.00"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Proforma Invoice</label>
              <div className="relative">
                <input
                  type="file"
                  required
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label 
                  htmlFor="file-upload"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-all text-slate-500 font-medium truncate px-4"
                >
                  <UploadCloud className="w-5 h-5" />
                  {formData.proforma_file ? formData.proforma_file.name : "Upload PDF/Image"}
                </label>
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Description / Justification</label>
              <div className="relative">
                <FileText className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <textarea
                  name="description"
                  required
                  rows="4"
                  placeholder="Why is this purchase necessary?"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium"
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-500/30 transition-all transform hover:-translate-y-1 disabled:opacity-70"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}