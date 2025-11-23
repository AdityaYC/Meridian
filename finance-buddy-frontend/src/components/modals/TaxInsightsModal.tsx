import React, { useState, useEffect } from 'react';
import { X, DollarSign, TrendingDown } from 'lucide-react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

interface TaxInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TaxInsightsModal: React.FC<TaxInsightsModalProps> = ({ isOpen, onClose }) => {
  const [deductions, setDeductions] = useState<any[]>([]);
  const [quarterlyTax, setQuarterlyTax] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (isOpen) {
      loadTaxData();
    }
  }, [isOpen, selectedYear]);

  const loadTaxData = async () => {
    try {
      setLoading(true);
      const [deductionsRes, quarterlyRes] = await Promise.allSettled([
        api.get(`/tax/deductions?year=${selectedYear}`),
        api.get('/tax/estimate-quarterly'),
      ]);

      if (deductionsRes.status === 'fulfilled') {
        setDeductions(deductionsRes.value.data || []);
      }
      if (quarterlyRes.status === 'fulfilled') {
        setQuarterlyTax(quarterlyRes.value.data);
      }
    } catch (error) {
      toast.error('Failed to load tax data');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      const response = await api.get(`/tax/report?year=${selectedYear}`);
      toast.success('Tax report generated!');
      // You could download the report here
      console.log('Tax report:', response.data);
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  if (!isOpen) return null;

  const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);

  const categoryColors: Record<string, string> = {
    business_expense: 'bg-blue-100 text-blue-700',
    charitable: 'bg-green-100 text-green-700',
    medical: 'bg-red-100 text-red-700',
    education: 'bg-purple-100 text-purple-700',
    other: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full p-6 my-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Tax Insights</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Year Selector */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Tax Year:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[2024, 2023, 2022, 2021].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <button
                onClick={generateReport}
                className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Generate Report
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingDown className="w-6 h-6" />
                  <h3 className="font-semibold">Total Deductions</h3>
                </div>
                <p className="text-4xl font-bold">${totalDeductions.toFixed(2)}</p>
                <p className="text-green-100 text-sm mt-2">{deductions.length} deductions found</p>
              </div>

              {quarterlyTax && (
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-6 h-6" />
                    <h3 className="font-semibold">Estimated Quarterly Tax</h3>
                  </div>
                  <p className="text-4xl font-bold">${quarterlyTax.estimatedQuarterlyTax?.toFixed(2) || '0.00'}</p>
                  <p className="text-blue-100 text-sm mt-2">Based on current income</p>
                </div>
              )}
            </div>

            {/* Deductions List */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Tax Deductions</h3>
              {deductions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No tax deductions found for {selectedYear}</p>
                  <p className="text-sm mt-2">Transactions will be automatically categorized for tax purposes</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deductions.map((deduction) => (
                    <div
                      key={deduction.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            categoryColors[deduction.category] || categoryColors.other
                          }`}>
                            {deduction.category.replace('_', ' ').toUpperCase()}
                          </span>
                          <p className="font-medium text-gray-900">{deduction.description}</p>
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(deduction.date).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-lg font-bold text-green-600">
                        ${deduction.amount.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tax Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Tax Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Keep receipts for all business expenses</li>
                <li>• Charitable donations over $250 require written acknowledgment</li>
                <li>• Medical expenses must exceed 7.5% of AGI to be deductible</li>
                <li>• Consider consulting a tax professional for personalized advice</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxInsightsModal;
