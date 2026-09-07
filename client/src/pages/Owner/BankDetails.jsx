import React, { useEffect, useState } from 'react'
import Title from '../../components/Title'
import { useAppContext } from '../../context/AppContext'
import { toast } from 'react-hot-toast'
import { motion } from 'motion/react'

const BankDetails = () => {
  const { axios, token } = useAppContext()

  const [formData, setFormData] = useState({
    accountHolderName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    bankName: 'HDFC Bank',
    upiId: ''
  })
  const [wallet, setWallet] = useState({
    totalEarned: 0,
    cashCollected: 0,
    platformCommissionDue: 0,
    onlineSettled: 0
  })
  const [isConfigured, setIsConfigured] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [clearingDues, setClearingDues] = useState(false)

  const fetchBankDetails = async () => {
    try {
      setFetching(true)
      const { data } = await axios.get('/api/owner/bank-details')
      if (data.success && data.bankDetails) {
        setFormData({
          accountHolderName: data.bankDetails.accountHolderName || '',
          accountNumber: data.bankDetails.accountNumber || '',
          confirmAccountNumber: data.bankDetails.accountNumber || '',
          ifscCode: data.bankDetails.ifscCode || '',
          bankName: data.bankDetails.bankName || 'HDFC Bank',
          upiId: data.bankDetails.upiId || ''
        })
        setIsConfigured(Boolean(data.bankDetails.isConfigured || data.bankDetails.accountNumber || data.bankDetails.upiId))
        if (data.wallet) {
          setWallet(data.wallet)
        }
      }
    } catch (error) {
      console.log('fetchBankDetails error:', error.message)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchBankDetails()
    }
  }, [token])

  const handleClearDues = async () => {
    if (wallet.platformCommissionDue <= 0) return
    setClearingDues(true)
    try {
      const { data } = await axios.post('/api/owner/clear-commission')
      if (data.success) {
        toast.success(data.message || 'Commission cleared successfully!')
        fetchBankDetails()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setClearingDues(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.accountNumber && formData.accountNumber !== formData.confirmAccountNumber) {
      toast.error('Account numbers do not match!')
      return
    }

    if (!formData.accountNumber && !formData.upiId) {
      toast.error('Please provide at least a Bank Account Number or UPI ID to receive payouts')
      return
    }

    setLoading(true)
    try {
      const { data } = await axios.post('/api/owner/bank-details', {
        accountHolderName: formData.accountHolderName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode?.toUpperCase(),
        bankName: formData.bankName,
        upiId: formData.upiId
      })

      if (data.success) {
        toast.success(data.message || 'Bank Details Saved!')
        setIsConfigured(true)
        if (data.wallet) {
          setWallet(data.wallet)
        }
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className='max-w-4xl pb-16'
    >
      <Title
        title="Bank & Payout Settings"
        subTitle="Configure your payout accounts and manage your platform earnings & commission wallet"
        align="left"
      />

      {/* Model 2 Commission & Wallet Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6'>
        {/* Cash in Hand */}
        <div className='p-4 bg-white rounded-2xl border border-borderColor shadow-xs flex flex-col justify-between'>
          <div>
            <span className='text-xs text-gray-500 font-medium'>💵 Cash in Hand (Collected)</span>
            <p className='text-xl font-bold text-gray-800 mt-1'>₹{wallet.cashCollected || 0}</p>
          </div>
          <span className='text-[11px] text-gray-400 mt-2'>Direct from Pay on Pickup bookings</span>
        </div>

        {/* Online Payouts */}
        <div className='p-4 bg-white rounded-2xl border border-borderColor shadow-xs flex flex-col justify-between'>
          <div>
            <span className='text-xs text-emerald-700 font-medium'>🏦 Online Payouts (Settled)</span>
            <p className='text-xl font-bold text-emerald-700 mt-1'>₹{wallet.onlineSettled || 0}</p>
          </div>
          <span className='text-[11px] text-emerald-600 mt-2'>Transferred to your Bank / UPI</span>
        </div>

        {/* Platform Commission Dues */}
        <div className={`p-4 rounded-2xl border shadow-xs flex flex-col justify-between ${
          wallet.platformCommissionDue > 0
            ? 'bg-amber-50/80 border-amber-300'
            : 'bg-white border-borderColor'
        }`}>
          <div>
            <span className='text-xs font-medium text-amber-800'>⚠️ Platform Commission Due</span>
            <p className='text-xl font-extrabold text-amber-900 mt-1'>₹{wallet.platformCommissionDue || 0}</p>
          </div>
          {wallet.platformCommissionDue > 0 ? (
            <button
              type='button'
              disabled={clearingDues}
              onClick={handleClearDues}
              className='mt-2 w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors disabled:opacity-60'
            >
              {clearingDues ? 'Clearing...' : '⚡ Pay Commission (UPI)'}
            </button>
          ) : (
            <span className='text-[11px] text-emerald-600 mt-2 font-medium'>✓ All commission dues cleared</span>
          )}
        </div>
      </div>

      {/* Payout Status Banner */}
      <div className={`mt-6 p-4 rounded-2xl border flex items-start gap-3.5 ${
        isConfigured
          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
          : 'bg-amber-50/80 border-amber-200 text-amber-900'
      }`}>
        <span className='text-2xl'>{isConfigured ? '🏦' : '⚠️'}</span>
        <div className='text-xs space-y-1'>
          <p className='font-bold text-sm'>
            {isConfigured ? 'Payout Account Active & Linked' : 'Payout Account Not Configured'}
          </p>
          <p className='text-gray-600 leading-relaxed'>
            {isConfigured
              ? 'Your earnings (90% rental share after 10% platform fee) will be directly transferred to your linked bank account or UPI ID. Any pending cash commission dues are automatically adjusted from future online bookings.'
              : 'Please enter your bank account or UPI ID below so DriveSelect can transfer your earnings for completed bookings.'}
          </p>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className='mt-8 bg-white p-6 sm:p-8 rounded-2xl border border-borderColor shadow-xs space-y-6'>
        
        {/* Section 1: Instant UPI Payout */}
        <div>
          <h3 className='text-base font-semibold text-gray-800 flex items-center gap-2'>
            <span>⚡</span> Fast UPI Payout (Recommended)
          </h3>
          <p className='text-xs text-gray-500 mt-1 mb-4'>
            Receive instant payouts directly via Google Pay, PhonePe, Paytm, or BHIM.
          </p>

          <div className='max-w-md'>
            <label className='block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5'>
              UPI ID (VPA)
            </label>
            <input
              type='text'
              placeholder='e.g. yourname@okhdfcbank or 9876543210@paytm'
              value={formData.upiId}
              onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
              className='w-full px-4 py-3 bg-gray-50/50 border border-borderColor rounded-xl text-sm outline-none focus:border-primary focus:bg-white transition-all font-mono'
            />
          </div>
        </div>

        <div className='border-t border-borderColor pt-6'>
          <h3 className='text-base font-semibold text-gray-800 flex items-center gap-2'>
            <span>🏛️</span> Bank Account Transfer (NEFT / IMPS)
          </h3>
          <p className='text-xs text-gray-500 mt-1 mb-4'>
            Direct bank transfer details for settlements.
          </p>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {/* Account Holder Name */}
            <div>
              <label className='block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5'>
                Account Holder Name
              </label>
              <input
                type='text'
                placeholder='As printed on Bank Passbook / Cheque'
                value={formData.accountHolderName}
                onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                className='w-full px-4 py-3 bg-gray-50/50 border border-borderColor rounded-xl text-sm outline-none focus:border-primary focus:bg-white transition-all'
              />
            </div>

            {/* Bank Name */}
            <div>
              <label className='block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5'>
                Bank Name
              </label>
              <select
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className='w-full px-4 py-3 bg-gray-50/50 border border-borderColor rounded-xl text-sm outline-none focus:border-primary focus:bg-white cursor-pointer'
              >
                <option value="HDFC Bank">HDFC Bank</option>
                <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                <option value="ICICI Bank">ICICI Bank</option>
                <option value="Axis Bank">Axis Bank</option>
                <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                <option value="Punjab National Bank (PNB)">Punjab National Bank (PNB)</option>
                <option value="Bank of Baroda">Bank of Baroda</option>
                <option value="Canara Bank">Canara Bank</option>
                <option value="Union Bank of India">Union Bank of India</option>
                <option value="Other Bank">Other Bank</option>
              </select>
            </div>

            {/* Account Number */}
            <div>
              <label className='block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5'>
                Account Number
              </label>
              <input
                type='password'
                placeholder='••••••••••••'
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                className='w-full px-4 py-3 bg-gray-50/50 border border-borderColor rounded-xl text-sm outline-none focus:border-primary focus:bg-white transition-all font-mono'
              />
            </div>

            {/* Confirm Account Number */}
            <div>
              <label className='block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5'>
                Confirm Account Number
              </label>
              <input
                type='text'
                placeholder='Re-enter Account Number'
                value={formData.confirmAccountNumber}
                onChange={(e) => setFormData({ ...formData, confirmAccountNumber: e.target.value })}
                className='w-full px-4 py-3 bg-gray-50/50 border border-borderColor rounded-xl text-sm outline-none focus:border-primary focus:bg-white transition-all font-mono'
              />
            </div>

            {/* IFSC Code */}
            <div className='sm:col-span-2 max-w-md'>
              <label className='block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5'>
                IFSC Code (11 Characters)
              </label>
              <input
                type='text'
                maxLength={11}
                placeholder='e.g. HDFC0001234 / SBIN0004567'
                value={formData.ifscCode}
                onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                className='w-full px-4 py-3 bg-gray-50/50 border border-borderColor rounded-xl text-sm outline-none focus:border-primary focus:bg-white transition-all font-mono uppercase'
              />
            </div>
          </div>
        </div>

        {/* Informational Fee Breakdown Notice */}
        <div className='bg-gray-50 p-4 rounded-xl border border-borderColor/80 text-xs space-y-2 text-gray-600'>
          <p className='font-semibold text-gray-800 flex items-center gap-1.5'>
            <span>💡</span> Platform Payout Settlement Policy:
          </p>
          <ul className='list-disc list-inside space-y-1 text-gray-500 pl-1'>
            <li>DriveSelect deducts a standard <strong>10% Platform Fee</strong> for server, insurance & gateway maintenance.</li>
            <li><strong>90% of Total Booking Value</strong> is credited to your bank account / UPI within 24 hours of successful car return.</li>
            <li>For offline bookings (Pay on Pickup), customer pays full cash/card directly to you upon key handover.</li>
          </ul>
        </div>

        {/* Save Button */}
        <div className='pt-2 flex justify-end'>
          <button
            type='submit'
            disabled={loading}
            className='px-8 py-3.5 bg-primary hover:bg-primary-dull text-white text-sm font-semibold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-60'
          >
            {loading ? (
              <>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                Saving Details...
              </>
            ) : (
              'Save Bank & Payout Details'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  )
}

export default BankDetails
