import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiArrowLeft,
  HiCheck,
  HiExclamationCircle,
  HiCreditCard,
  HiUpload,
  HiCheckCircle,
  HiMap,
  HiTruck
} from 'react-icons/hi';
import { useCart } from '../contexts/CartContext';
import { AuthContext } from '../AuthContext';
import api, { cartAPI, orderAPI, bankAccountAPI, shippingLocationAPI } from '../services/api';
import { paymentAPI } from '../services/payment.service';
import { emailAPI } from '../services/email.service';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const { authenticated, user } = useContext(AuthContext);
  
  const [step, setStep] = useState(1); // 1: Review, 2: Shipping Location, 3: Shipping Address, 4: Payment Method
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null); // Preview of selected file
  const [uploadComplete, setUploadComplete] = useState(false); // Track actual upload completion
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [shippingLocations, setShippingLocations] = useState([]);
  const [selectedShippingLocation, setSelectedShippingLocation] = useState(null);

  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: ''
  });

  // Helper function to calculate discounted price (same as Cart page)
  const getDiscountedPrice = (item) => {
    const price = Number(item.price) || 0;
    const discount = Number(item.discount) || 0;
    const finalPrice = Number(item.finalPrice) || 0;
    
    // Use finalPrice if available, otherwise calculate from discount
    if (finalPrice > 0 && finalPrice < price) {
      return finalPrice;
    } else if (discount > 0) {
      return price * (1 - discount / 100);
    }
    return price;
  };

  // Calculate item total with discount
  const getItemTotal = (item) => {
    const discountedPrice = getDiscountedPrice(item);
    const quantity = item.quantity || 1;
    return discountedPrice * quantity;
  };

  // Calculate totals with discounts applied
  const subtotal = items?.reduce((sum, item) => sum + getItemTotal(item), 0) || 0;
  
  // Calculate shipping fee based on selected location
  const shippingFee = selectedShippingLocation 
    ? (selectedShippingLocation.isFreeShipping ? 0 : selectedShippingLocation.shippingFee)
    : 0;
  
  console.log('📦 Checkout selected shipping location:', selectedShippingLocation);
  console.log('💰 Checkout final shipping fee:', shippingFee);
  
  const total = subtotal + shippingFee;

  // Calculate total savings from discounts
  const totalSavings = items?.reduce((savings, item) => {
    const originalPrice = Number(item.price) || 0;
    const discountedPrice = getDiscountedPrice(item);
    const quantity = item.quantity || 1;
    if (originalPrice > discountedPrice) {
      return savings + ((originalPrice - discountedPrice) * quantity);
    }
    return savings;
  }, 0) || 0;
  useEffect(() => {
    document.title = 'Checkout Page | EStarr Bookart Hub';
    window.scrollTo(0, 0);
  }, [])
  

  // Fetch bank accounts on mount
  useEffect(() => {
    if (!authenticated) {
      navigate('/login');
      return;
    }

    if (!items?.length) {
      navigate('/cart');
      return;
    }

    fetchBankAccounts();
    fetchShippingLocations();
  }, [authenticated, items, navigate]);

  const fetchBankAccounts = async () => {
    try {
      const response = await bankAccountAPI.getAllBankAccounts();
      if (response?.data && Array.isArray(response.data)) {
        setBankAccounts(response.data);
      } else if (response?.data) {
        // Handle single object or nested response
        setBankAccounts(Array.isArray(response.data) ? response.data : [response.data]);
      }
    } catch (error) {
      console.error('Failed to fetch bank accounts:', error);
      toast.error('Failed to load bank accounts');
    }
  };

  const fetchShippingLocations = async () => {
    try {
      const response = await shippingLocationAPI.getLocations();
      if (response?.data && Array.isArray(response.data)) {
        setShippingLocations(response.data);
      } else if (response?.data?.locations && Array.isArray(response.data.locations)) {
        setShippingLocations(response.data.locations);
      }
    } catch (error) {
      console.error('Failed to fetch shipping locations:', error);
      toast.error('Failed to load shipping locations');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateOrder = async () => {
    try {
      setLoading(true);

      // Create order with discounted prices
      const orderPayload = {
        items: items.map(item => ({
          book: item.book || item._id || item.id,
          quantity: item.quantity || 1,
          price: getDiscountedPrice(item), // Send discounted price
          discount: item.discount || 0
        })),
        shippingAddress: formData,
        shippingLocation: selectedShippingLocation?._id,
        paymentMethod: paymentMethod,
        subtotal: subtotal,
        shippingFee: shippingFee,
        total: total,
        discountSavings: totalSavings
      };

      const orderRes = await api.cartAPI.createOrder(orderPayload);

      if (orderRes?.data?._id) {
        toast.success('Order created successfully!');
        
        // Store the order ID for proof upload
        setCurrentOrderId(orderRes.data._id);
        
        // Proceed to manual payment
        setStep(4);
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };


  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit');
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only JPG, PNG, GIF, and PDF files are allowed');
        return;
      }
      setProofFile(file);
      
      // Generate preview for image/PDF
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setProofPreview(event.target.result);
        };
        reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf') {
        setProofPreview('PDF');
      }
    }
  };

  const handleSubmitProof = async () => {
    try {
      if (!proofFile) {
        toast.error('Please select a file');
        return;
      }

      if (!currentOrderId) {
        toast.error('Order ID not found. Please create order first.');
        return;
      }

      setLoading(true);
      console.log('📤 Uploading proof of payment:', { orderId: currentOrderId, fileName: proofFile.name });

      const formDataObj = new FormData();
      formDataObj.append('proof', proofFile);

      // Upload proof of payment to backend
      const uploadRes = await orderAPI.uploadOrderProof(currentOrderId, formDataObj);
      
      console.log('📥 Upload response:', uploadRes);

      if (uploadRes?.data?._id) {
        console.log('✅ Proof uploaded successfully');
        toast.success('Proof of payment uploaded successfully!');
        toast.success('Your payment is awaiting admin verification');
        
        // Mark upload as complete to show success screen
        setUploadComplete(true);
      } else {
        throw new Error(uploadRes?.message || 'Failed to upload proof');
      }
    } catch (error) {
      console.error('❌ Proof upload error:', error);
      const errorMsg = error.message || 'Failed to upload proof';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : navigate('/cart')}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
          >
            <HiArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Step {step} of 4</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex-1">
              <div className={`h-2 mx-1 rounded-full transition-colors ${
                s <= step ? 'bg-purple-600' : 'bg-gray-300'
              }`}></div>
              <p className="text-xs text-gray-600 mt-2 text-center">
                {s === 1 ? 'Review' : s === 2 ? 'Location' : s === 3 ? 'Address' : 'Payment'}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={step}
            >
              {/* Step 1: Review Order */}
              {step === 1 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-4">Order Review</h2>
                  <div className="space-y-4">
                    {items?.map((item) => {
                      const discountedPrice = getDiscountedPrice(item);
                      const itemTotal = getItemTotal(item);
                      const isDiscounted = Number(item.price) > discountedPrice;
                      
                      return (
                        <div key={item.id || item._id} className="flex gap-4 pb-4 border-b">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-20 h-24 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h3 className="font-bold">{item.title}</h3>
                            <p className="text-sm text-gray-600">{item.author}</p>
                            
                            {isDiscounted && (
                              <div className="mt-1">
                                <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded mr-2">
                                  {item.discount}% OFF
                                </span>
                                {item.finalPrice && (
                                  <span className="text-xs text-gray-500">
                                    Final Price: ₦{item.finalPrice}
                                  </span>
                                )}
                              </div>
                            )}
                            
                            <div className="flex justify-between mt-2">
                              <span>Qty: {item.quantity || 1}</span>
                              <div className="text-right">
                                <div className="font-bold text-lg text-green-600">
                                  ₦{itemTotal.toLocaleString()}
                                </div>
                                {isDiscounted && (
                                  <div className="text-sm text-gray-500 line-through">
                                    ₦{(Number(item.price) * (item.quantity || 1)).toLocaleString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="w-full mt-6 bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700"
                  >
                    Continue to Shipping
                  </button>
                </div>
              )}

              {/* Step 2: Shipping Location */}
              {step === 2 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-4">Select Shipping Location</h2>
                  <p className="text-gray-600 mb-6">Choose where you want your order to be shipped to.</p>

                  {shippingLocations.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No shipping locations available at the moment.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {shippingLocations
                        .filter(location => location.isActive)
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((location) => (
                          <motion.div
                            key={location._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                              selectedShippingLocation?._id === location._id
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-purple-300'
                            }`}
                            onClick={() => setSelectedShippingLocation(location)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="font-bold text-lg">{location.name}</h3>
                                <p className="text-gray-600 text-sm mb-2">
                                  {location.region} • {location.state}
                                  {location.city && `, ${location.city}`}
                                </p>
                                {location.description && (
                                  <p className="text-gray-500 text-sm mb-2">{location.description}</p>
                                )}
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <HiTruck className="w-4 h-4" />
                                    {location.estimatedDeliveryDays} day{location.estimatedDeliveryDays !== 1 ? 's' : ''} delivery
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                {location.isFreeShipping ? (
                                  <div className="text-green-600 font-bold text-lg">FREE</div>
                                ) : (
                                  <div className="text-purple-600 font-bold text-lg">
                                    ₦{location.shippingFee.toLocaleString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  )}

                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300"
                    >
                      Back to Review
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      disabled={!selectedShippingLocation}
                      className="flex-1 text-[12px] bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Continue to Address
                    </button>
                  </div>

                  {selectedShippingLocation && (
                    <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg text-sm text-gray-700">
                      <div className="font-semibold text-purple-900 mb-2">You selected:</div>
                      <div className="space-y-2">
                        <div>{selectedShippingLocation.name}</div>
                        <div>
                          {selectedShippingLocation.region} • {selectedShippingLocation.state}
                          {selectedShippingLocation.city ? `, ${selectedShippingLocation.city}` : ''}
                        </div>
                        <div>
                          {selectedShippingLocation.isFreeShipping ? (
                            <span className="text-green-600 font-semibold">Free shipping</span>
                          ) : (
                            <span className="text-purple-600 font-semibold">₦{selectedShippingLocation.shippingFee.toLocaleString()}</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          Estimated delivery: {selectedShippingLocation.estimatedDeliveryDays} day{selectedShippingLocation.estimatedDeliveryDays !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Shipping Address */}
              {step === 3 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-4">Shipping Information (this is your personal shipping address)</h2>
                  <div className="space-y-4">
                    <input
                      type="text"
                      name="street"
                      placeholder="Street Address"
                      value={formData.street}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        required
                      />
                      <input
                        type="text"
                        name="state"
                        placeholder="State"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="zipCode"
                        placeholder="Zip Code"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        required
                      />
                      <input
                        type="text"
                        name="country"
                        placeholder="Country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div className="flex flex-col md:flex-row gap-4 mt-6">
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 border border-purple-600 text-purple-600 py-3 rounded-lg font-bold hover:bg-purple-50"
                    >
                      Back to Location
                    </button>
                    <button
                      onClick={() => setStep(4)}
                      className="flex-1 bg-purple-600 px-2 text-white py-3 rounded-lg font-bold hover:bg-purple-700"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Payment Method */}
              {step === 4 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-4">Select Payment Method</h2>
                  <div className="space-y-4">
                    {/* Manual Bank Transfer Option */}
                    <motion.div
                      onClick={() => setPaymentMethod('manual')}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === 'manual'
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-300 hover:border-purple-600'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === 'manual' ? 'border-purple-600' : 'border-gray-300'
                        }`}>
                          {paymentMethod === 'manual' && <HiCheck className="w-3 h-3 text-purple-600" />}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold">Manual Bank Transfer</h3>
                          <p className="text-sm text-gray-600">Transfer to our account and upload proof</p>
                        </div>
                        <HiUpload className="w-6 h-6 text-purple-600" />
                      </div>
                    </motion.div>
                  </div>
                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={() => setStep(3)}
                      className="flex-1 border border-purple-600 text-purple-600 py-3 rounded-lg font-bold hover:bg-purple-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleCreateOrder}
                      disabled={!paymentMethod || loading}
                      className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 disabled:bg-gray-400"
                    >
                      {loading ? 'Processing...' : 'Continue'}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Manual Payment or Success */}
              {step === 4 && paymentMethod === 'manual' && !uploadComplete && (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex gap-3">
                      <HiExclamationCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-bold text-blue-900">Bank Transfer Instructions</h3>
                        <p className="text-sm text-blue-800 mt-1">
                          Please transfer ₦{total.toLocaleString()} to the account below and upload proof of payment.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bank Account Details */}
                  {bankAccounts.length > 0 ? (
                    <div className="space-y-4 mb-6">
                      {bankAccounts.map((account) => (
                        <div key={account._id} className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                          <h3 className="font-bold text-gray-900 mb-4">📋 Transfer Details</h3>
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-gray-600 font-medium">ACCOUNT NAME</p>
                              <p className="text-lg font-bold text-gray-900">{account.accountName}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 font-medium">ACCOUNT NUMBER</p>
                              <p className="text-lg font-bold text-gray-900">{account.accountNumber}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 font-medium">BANK NAME</p>
                              <p className="text-lg font-bold text-gray-900">{account.bankName}</p>
                            </div>
                            {account.bankCode && (
                              <div>
                                <p className="text-xs text-gray-600 font-medium">BANK CODE</p>
                                <p className="text-lg font-bold text-gray-900">{account.bankCode}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-xs text-gray-600 font-medium">AMOUNT</p>
                              <p className="text-2xl font-bold text-blue-600">₦{total.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <p className="text-red-800">No bank accounts available. Please contact support.</p>
                    </div>
                  )}

                  {/* File Upload */}
                  <div className="mb-6">
                    <p className="text-sm font-bold text-gray-900 mb-3">📤 Upload Proof of Payment</p>
                    
                    {!proofFile ? (
                      <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-blue-50 hover:bg-blue-100 transition-colors">
                        <label className="cursor-pointer block">
                          <HiUpload className="w-12 h-12 mx-auto text-blue-500 mb-2" />
                          <p className="text-sm font-medium text-gray-800">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-600 mt-1">PNG, JPG, GIF or PDF (Max. 5MB)</p>
                          <input
                            type="file"
                            onChange={handleFileUpload}
                            accept="image/jpeg,image/png,image/gif,application/pdf"
                            className="hidden"
                          />
                        </label>
                      </div>
                    ) : (
                      <div>
                        {/* File Preview */}
                        <div className="bg-gray-100 rounded-lg p-4 mb-4 border border-gray-300">
                          {proofPreview === 'PDF' ? (
                            <div className="flex items-center justify-center h-48">
                              <div className="text-center">
                                <p className="text-gray-600 font-bold text-lg">📄 PDF File</p>
                                <p className="text-sm text-gray-500">{proofFile.name}</p>
                              </div>
                            </div>
                          ) : proofPreview ? (
                            <img src={proofPreview} alt="Preview" className="w-full rounded max-h-64 object-contain" />
                          ) : null}
                        </div>
                        
                        {/* File Info */}
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-green-900">✓ File selected</p>
                            <p className="text-xs text-green-700">{proofFile.name}</p>
                          </div>
                          <button
                            onClick={() => {
                              setProofFile(null);
                              setProofPreview(null);
                            }}
                            className="text-green-600 hover:text-green-700 font-bold"
                          >
                            Change
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row gap-4">
                    <button
                      onClick={() => setStep(3)}
                      className="flex-1 border border-purple-600 text-purple-600 py-3 rounded-lg font-bold hover:bg-purple-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmitProof}
                      disabled={!proofFile || loading}
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400"
                    >
                      {loading ? 'Uploading...' : '✓ Submit & Complete Purchase'}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Success Message */}
              {step === 4 && uploadComplete && (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 100 }}
                    className="mb-6"
                  >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <HiCheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                  </motion.div>
                  
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Purchase Successful! 🎉</h2>
                  <p className="text-gray-600 mb-6">
                    Your payment proof has been submitted and is awaiting verification.
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                    <p className="text-sm font-bold text-blue-900 mb-2">📊 What happens next:</p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>✓ Your payment is being verified</li>
                      <li>✓ We'll confirm within 2-4 hours</li>
                      <li>✓ You'll receive email notification</li>
                      <li>✓ Your order will be prepared for shipment</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <p className="text-sm font-bold text-green-900">Order Reference</p>
                    <p className="text-lg font-mono font-bold text-green-700">{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                  </div>

                  <button
                    onClick={() => navigate('/dashboard/orders')}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 mb-3"
                  >
                    View Order Status
                  </button>
                  
                  <button
                    onClick={() => navigate('/')}
                    className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h3 className="text-lg font-bold mb-4">Order Summary</h3>
              <div className="space-y-3 pb-4 border-b border-gray-300">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₦{subtotal.toLocaleString()}</span>
                </div>
                
                {totalSavings > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Discounts Applied</span>
                    <span className="text-green-600 font-bold">
                      -₦{totalSavings.toLocaleString()}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span className={shippingFee === 0 ? 'text-green-600 font-bold' : ''}>
                    {shippingFee === 0 ? 'FREE' : `₦${shippingFee.toLocaleString()}`}
                  </span>
                </div>
                
              </div>

              <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2 text-sm font-bold text-purple-900">
                  <HiMap className="w-4 h-4" />
                  Selected Shipping Destination
                </div>
                {selectedShippingLocation ? (
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="font-semibold">{selectedShippingLocation.name}</div>
                    <div>
                      {selectedShippingLocation.region} • {selectedShippingLocation.state}
                      {selectedShippingLocation.city ? `, ${selectedShippingLocation.city}` : ''}
                    </div>
                    <div>
                      {selectedShippingLocation.isFreeShipping ? (
                        <span className="text-green-600 font-semibold">Free shipping</span>
                      ) : (
                        <span className="text-purple-600 font-semibold">₦{selectedShippingLocation.shippingFee.toLocaleString()}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {selectedShippingLocation.estimatedDeliveryDays} day{selectedShippingLocation.estimatedDeliveryDays !== 1 ? 's' : ''} delivery estimate
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Choose a shipping location to see the fee and delivery estimate.</p>
                )}
              </div>

              <div className="flex justify-between font-bold text-lg mt-4">
                <span>Total</span>
                <span className="text-blue-600">₦{total.toLocaleString()}</span>
              </div>
              
              {totalSavings > 0 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-green-800">You save</span>
                    <span className="text-lg font-bold text-green-600">
                      ₦{totalSavings.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;