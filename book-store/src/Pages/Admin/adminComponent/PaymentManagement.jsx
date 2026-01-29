import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  HiEye,
  HiCheck,
  HiTimes,
  HiDownload,
  HiUpload,
  HiRefresh,
  HiPlus,
  HiPencil,
  HiTrash,
  HiFilter
} from 'react-icons/hi';
import api from '../../services/api';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [bankModal, setBankModal] = useState(false);
  const [newAccount, setNewAccount] = useState({
    accountName: '',
    accountNumber: '',
    bankName: '',
    bankCode: ''
  });
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPayments();
    fetchBankAccounts();
  }, [filter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await api.userAPI.getAllPayments?.({ status: filter !== 'all' ? filter : undefined });
      if (response?.data?.payments) {
        setPayments(response.data.payments);
      }
    } catch (error) {
      toast.error('Failed to fetch payments');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBankAccounts = async () => {
    try {
      const response = await api.userAPI.getAllBankAccounts?.();
      if (response?.data) {
        setBankAccounts(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch bank accounts:', error);
    }
  };

  const handleApprovePayment = async (paymentId) => {
    try {
      setLoading(true);
      await api.userAPI.verifyManualPayment?.(paymentId, { approved: true });
      toast.success('Payment approved');
      fetchPayments();
      setShowModal(false);
    } catch (error) {
      toast.error('Failed to approve payment');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectPayment = async (paymentId) => {
    if (!rejectionReason) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setLoading(true);
      await api.userAPI.verifyManualPayment?.(paymentId, {
        approved: false,
        reason: rejectionReason
      });
      toast.success('Payment rejected');
      fetchPayments();
      setShowModal(false);
      setRejectionReason('');
    } catch (error) {
      toast.error('Failed to reject payment');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBankAccount = async () => {
    try {
      if (!newAccount.accountName || !newAccount.accountNumber || !newAccount.bankName) {
        toast.error('Please fill all required fields');
        return;
      }

      setLoading(true);
      await api.userAPI.addBankAccount?.(newAccount);
      toast.success('Bank account added');
      setNewAccount({
        accountName: '',
        accountNumber: '',
        bankName: '',
        bankCode: ''
      });
      setBankModal(false);
      fetchBankAccounts();
    } catch (error) {
      toast.error('Failed to add bank account');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBankAccount = async (accountId) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;

    try {
      setLoading(true);
      await api.userAPI.deleteBankAccount?.(accountId);
      toast.success('Bank account deleted');
      fetchBankAccounts();
    } catch (error) {
      toast.error('Failed to delete bank account');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='p-6'>
      <h1 className='text-3xl font-bold mb-6'>Payment Management</h1>

      {/* Tabs */}
      <div className='flex gap-4 mb-6 border-b'>
        <button
          onClick={() => setFilter('all')}
          className={`pb-3 px-4 font-medium ${
            filter === 'all'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All Payments
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`pb-3 px-4 font-medium ${
            filter === 'pending'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Pending Review
        </button>
        <button
          onClick={() => setFilter('processing')}
          className={`pb-3 px-4 font-medium ${
            filter === 'processing'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Processing
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`pb-3 px-4 font-medium ${
            filter === 'completed'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Completed
        </button>
      </div>

      {/* Payments Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='bg-white rounded-lg shadow overflow-hidden'
      >
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50 border-b'>
              <tr>
                <th className='px-6 py-3 text-left text-sm font-bold'>Payment ID</th>
                <th className='px-6 py-3 text-left text-sm font-bold'>Customer</th>
                <th className='px-6 py-3 text-left text-sm font-bold'>Method</th>
                <th className='px-6 py-3 text-left text-sm font-bold'>Amount</th>
                <th className='px-6 py-3 text-left text-sm font-bold'>Status</th>
                <th className='px-6 py-3 text-left text-sm font-bold'>Date</th>
                <th className='px-6 py-3 text-left text-sm font-bold'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id} className='border-b hover:bg-gray-50'>
                  <td className='px-6 py-4 text-sm font-medium'>{payment._id?.slice(-8) || 'N/A'}</td>
                  <td className='px-6 py-4 text-sm'>{payment.user?.name || 'N/A'}</td>
                  <td className='px-6 py-4 text-sm'>
                    <span className='capitalize'>{payment.paymentMethod?.replace('-', ' ')}</span>
                  </td>
                  <td className='px-6 py-4 text-sm font-medium'>₦{payment.amount?.toFixed(2)}</td>
                  <td className='px-6 py-4 text-sm'>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(payment.status)}`}>
                      {payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1)}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-sm'>
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </td>
                  <td className='px-6 py-4 text-sm'>
                    <button
                      onClick={() => {
                        setSelectedPayment(payment);
                        setShowModal(true);
                      }}
                      className='text-blue-600 hover:text-blue-800 flex items-center gap-1'
                    >
                      <HiEye className='w-4 h-4' />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Bank Accounts Section */}
      <div className='mt-8'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-2xl font-bold'>Bank Accounts</h2>
          <button
            onClick={() => setBankModal(true)}
            className='flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700'
          >
            <HiPlus className='w-5 h-5' />
            Add Account
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
        >
          {bankAccounts.map((account) => (
            <div key={account._id} className='bg-white rounded-lg shadow p-4 border-l-4 border-purple-600'>
              <div className='flex justify-between items-start mb-2'>
                <div>
                  <p className='text-xs text-gray-600'>Account Name</p>
                  <p className='font-bold'>{account.accountName}</p>
                </div>
                {account.isPrimary && (
                  <span className='bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded'>Primary</span>
                )}
              </div>
              <p className='text-xs text-gray-600 mb-1'>Account Number</p>
              <p className='font-mono text-sm mb-2'>{account.accountNumber}</p>
              <p className='text-xs text-gray-600'>Bank</p>
              <p className='text-sm mb-3'>{account.bankName}</p>
              <div className='flex gap-2'>
                <button
                  onClick={() => handleDeleteBankAccount(account._id)}
                  className='flex-1 flex items-center justify-center gap-1 bg-red-100 text-red-600 py-2 rounded hover:bg-red-200'
                >
                  <HiTrash className='w-4 h-4' />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Payment Detail Modal */}
      {showModal && selectedPayment && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className='bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'
          >
            <div className='p-6'>
              <h2 className='text-2xl font-bold mb-4'>Payment Details</h2>

              <div className='grid grid-cols-2 gap-4 mb-6'>
                <div>
                  <p className='text-sm text-gray-600'>Payment ID</p>
                  <p className='font-bold'>{selectedPayment._id}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Amount</p>
                  <p className='font-bold text-lg'>₦{selectedPayment.amount?.toFixed(2)}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Customer</p>
                  <p className='font-bold'>{selectedPayment.user?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Email</p>
                  <p className='font-bold'>{selectedPayment.user?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Method</p>
                  <p className='font-bold capitalize'>{selectedPayment.paymentMethod?.replace('-', ' ')}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${getStatusColor(selectedPayment.status)}`}>
                    {selectedPayment.status?.charAt(0).toUpperCase() + selectedPayment.status?.slice(1)}
                  </span>
                </div>
              </div>

              {/* Proof of Payment */}
              {selectedPayment.proofOfPayment?.url && (
                <div className='mb-6 border rounded p-4'>
                  <h3 className='font-bold mb-2'>Proof of Payment</h3>
                  {selectedPayment.proofOfPayment.url.endsWith('.pdf') ? (
                    <a
                      href={selectedPayment.proofOfPayment.url}
                      target='_blank'
                      rel='noreferrer'
                      className='flex items-center gap-2 text-blue-600 hover:text-blue-800'
                    >
                      <HiDownload className='w-4 h-4' />
                      Download PDF
                    </a>
                  ) : (
                    <img
                      src={selectedPayment.proofOfPayment.url}
                      alt='Proof'
                      className='max-w-full max-h-64 rounded'
                    />
                  )}
                  <p className='text-xs text-gray-600 mt-2'>
                    Uploaded: {new Date(selectedPayment.proofOfPayment.uploadedAt).toLocaleString()}
                  </p>
                </div>
              )}

              {/* Manual Bank Transfer Details */}
              {selectedPayment.paymentMethod === 'manual-bank-transfer' && (
                <div className='mb-6 border rounded p-4 bg-blue-50'>
                  <h3 className='font-bold mb-2'>Bank Transfer Details</h3>
                  <div className='space-y-2'>
                    <p><span className='text-sm text-gray-600'>Account Name:</span> <span className='font-bold'>{selectedPayment.accountDetails?.accountName}</span></p>
                    <p><span className='text-sm text-gray-600'>Account Number:</span> <span className='font-bold'>{selectedPayment.accountDetails?.accountNumber}</span></p>
                    <p><span className='text-sm text-gray-600'>Bank:</span> <span className='font-bold'>{selectedPayment.accountDetails?.bankName}</span></p>
                  </div>
                </div>
              )}

              {/* Actions for Pending Payments */}
              {selectedPayment.status === 'processing' && selectedPayment.paymentMethod === 'manual-bank-transfer' && (
                <div className='mb-6'>
                  <div className='mb-4'>
                    <label className='block text-sm font-bold mb-2'>Rejection Reason (if rejecting)</label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder='Enter reason for rejection...'
                      className='w-full px-4 py-2 border rounded-lg'
                      rows='3'
                    />
                  </div>
                  <div className='flex gap-3'>
                    <button
                      onClick={() => handleApprovePayment(selectedPayment._id)}
                      disabled={loading}
                      className='flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400'
                    >
                      <HiCheck className='w-5 h-5' />
                      Approve Payment
                    </button>
                    <button
                      onClick={() => handleRejectPayment(selectedPayment._id)}
                      disabled={loading}
                      className='flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:bg-gray-400'
                    >
                      <HiTimes className='w-5 h-5' />
                      Reject Payment
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowModal(false)}
                className='w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50'
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Bank Account Modal */}
      {bankModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className='bg-white rounded-lg shadow-xl max-w-lg w-full'
          >
            <div className='p-6'>
              <h2 className='text-2xl font-bold mb-4'>Add Bank Account</h2>

              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-bold mb-1'>Account Name *</label>
                  <input
                    type='text'
                    value={newAccount.accountName}
                    onChange={(e) => setNewAccount({ ...newAccount, accountName: e.target.value })}
                    placeholder='e.g., Estarr Bookstore Ltd'
                    className='w-full px-4 py-2 border rounded-lg'
                  />
                </div>
                <div>
                  <label className='block text-sm font-bold mb-1'>Account Number *</label>
                  <input
                    type='text'
                    value={newAccount.accountNumber}
                    onChange={(e) => setNewAccount({ ...newAccount, accountNumber: e.target.value })}
                    placeholder='e.g., 1234567890'
                    className='w-full px-4 py-2 border rounded-lg'
                  />
                </div>
                <div>
                  <label className='block text-sm font-bold mb-1'>Bank Name *</label>
                  <input
                    type='text'
                    value={newAccount.bankName}
                    onChange={(e) => setNewAccount({ ...newAccount, bankName: e.target.value })}
                    placeholder='e.g., GTBank'
                    className='w-full px-4 py-2 border rounded-lg'
                  />
                </div>
                <div>
                  <label className='block text-sm font-bold mb-1'>Bank Code</label>
                  <input
                    type='text'
                    value={newAccount.bankCode}
                    onChange={(e) => setNewAccount({ ...newAccount, bankCode: e.target.value })}
                    placeholder='e.g., 007'
                    className='w-full px-4 py-2 border rounded-lg'
                  />
                </div>
              </div>

              <div className='flex gap-3 mt-6'>
                <button
                  onClick={handleAddBankAccount}
                  disabled={loading}
                  className='flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400'
                >
                  Add Account
                </button>
                <button
                  onClick={() => setBankModal(false)}
                  className='flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50'
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;
