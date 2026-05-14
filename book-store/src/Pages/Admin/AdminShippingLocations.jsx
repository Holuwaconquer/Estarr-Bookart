import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiPencil, HiTrash, HiSearch, HiX, HiPlus, HiMap, HiTruck, HiClock } from 'react-icons/hi';
import toast from 'react-hot-toast';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { shippingLocationAPI } from '../../services/api';

const AdminShippingLocations = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRegion, setFilterRegion] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    region: '',
    state: '',
    city: '',
    shippingFee: 0,
    isFreeShipping: false,
    estimatedDeliveryDays: 3,
    sortOrder: 0,
    isActive: true
  });

  // Fetch locations
  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      console.log('📍 Fetching shipping locations...');
      const response = await shippingLocationAPI.getAllLocations();
      console.log('📍 Locations response:', response);

      const locationData = response.data?.locations || response.data || [];
      console.log('📍 Extracted locations:', locationData);

      setLocations(Array.isArray(locationData) ? locationData : []);
    } catch (error) {
      console.error('❌ Failed to fetch locations:', error);
      toast.error('Failed to fetch shipping locations');
    } finally {
      setLoading(false);
    }
  };

  const handleEditLocation = (location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name || '',
      description: location.description || '',
      region: location.region || '',
      state: location.state || '',
      city: location.city || '',
      shippingFee: location.shippingFee || 0,
      isFreeShipping: location.isFreeShipping || false,
      estimatedDeliveryDays: location.estimatedDeliveryDays || 3,
      sortOrder: location.sortOrder || 0,
      isActive: location.isActive !== false
    });
    setShowModal(true);
  };

  const handleCreateLocation = () => {
    setEditingLocation(null);
    setFormData({
      name: '',
      description: '',
      region: '',
      state: '',
      city: '',
      shippingFee: 0,
      isFreeShipping: false,
      estimatedDeliveryDays: 3,
      sortOrder: 0,
      isActive: true
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name.trim()) {
        toast.error('Location name is required');
        return;
      }
      if (!formData.region.trim()) {
        toast.error('Region is required');
        return;
      }
      if (!formData.state.trim()) {
        toast.error('State is required');
        return;
      }

      if (editingLocation) {
        await shippingLocationAPI.updateLocation(editingLocation._id, formData);
        toast.success('Shipping location updated successfully');
      } else {
        await shippingLocationAPI.createLocation(formData);
        toast.success('Shipping location created successfully');
      }

      setShowModal(false);
      fetchLocations();
    } catch (error) {
      console.error('Failed to save location:', error);
      toast.error(error.message || 'Failed to save shipping location');
    }
  };

  const handleDeleteLocation = async (locationId, locationName) => {
    if (window.confirm(`Are you sure you want to delete "${locationName}"? This action cannot be undone.`)) {
      try {
        await shippingLocationAPI.deleteLocation(locationId);
        toast.success('Shipping location deleted successfully');
        setLocations(locations.filter(l => l._id !== locationId));
      } catch (error) {
        toast.error('Failed to delete shipping location');
      }
    }
  };

  const handleToggleActive = async (location) => {
    try {
      await shippingLocationAPI.updateLocation(location._id, {
        isActive: !location.isActive
      });
      toast.success(`Location ${!location.isActive ? 'activated' : 'deactivated'}`);
      fetchLocations();
    } catch (error) {
      toast.error('Failed to update location status');
    }
  };

  const filteredLocations = locations.filter(location => {
    const matchesSearch =
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (location.city && location.city.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRegion = filterRegion === 'all' || location.region === filterRegion;

    return matchesSearch && matchesRegion;
  });

  const uniqueRegions = [...new Set(locations.map(l => l.region))];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page Content */}
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Shipping Locations
              </h1>
              <p className="text-gray-400 mt-2">Manage shipping destinations and fees</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateLocation}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all"
            >
              <HiPlus className="w-5 h-5" />
              Add Location
            </motion.button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Total Locations</p>
                  <p className="text-3xl font-bold">{locations.length}</p>
                </div>
                <HiMap className="w-8 h-8 text-cyan-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Active Locations</p>
                  <p className="text-3xl font-bold">{locations.filter(l => l.isActive).length}</p>
                </div>
                <HiTruck className="w-8 h-8 text-green-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Free Shipping</p>
                  <p className="text-3xl font-bold">{locations.filter(l => l.isFreeShipping).length}</p>
                </div>
                <HiClock className="w-8 h-8 text-blue-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Regions</p>
                  <p className="text-3xl font-bold">{uniqueRegions.length}</p>
                </div>
                <HiMap className="w-8 h-8 text-purple-400" />
              </div>
            </motion.div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <HiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, region, state, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            >
              <option value="all">All Regions</option>
              {uniqueRegions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin">
                <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full"></div>
              </div>
            </div>
          ) : filteredLocations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No shipping locations found</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-900">
                      <th className="px-6 py-4 text-left text-sm font-semibold">Location</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Region</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Shipping Fee</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Delivery</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredLocations.map((location, index) => (
                      <motion.tr
                        key={location._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm">
                          <div>
                            <p className="font-medium">{location.name}</p>
                            <p className="text-gray-400 text-xs">{location.state}{location.city ? `, ${location.city}` : ''}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">{location.region}</td>
                        <td className="px-6 py-4 text-sm">
                          {location.isFreeShipping ? (
                            <span className="text-green-400 font-medium">FREE</span>
                          ) : (
                            <span className="text-cyan-400 font-medium">{formatCurrency(location.shippingFee)}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {location.estimatedDeliveryDays} day{location.estimatedDeliveryDays !== 1 ? 's' : ''}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => handleToggleActive(location)}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              location.isActive
                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            }`}
                          >
                            {location.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleEditLocation(location)}
                              className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors"
                            >
                              <HiPencil className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDeleteLocation(location._id, location.name)}
                              className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                            >
                              <HiTrash className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg p-8 max-w-2xl w-full border border-gray-700 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{editingLocation ? 'Edit Shipping Location' : 'Add Shipping Location'}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Location Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  placeholder="e.g., Lagos Mainland"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  placeholder="Optional description..."
                  rows={3}
                />
              </div>

              {/* Region and State */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Region *</label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    placeholder="e.g., South West"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">State *</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    placeholder="e.g., Lagos"
                    required
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  placeholder="e.g., Ikeja (optional)"
                />
              </div>

              {/* Shipping Fee and Free Shipping */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Shipping Fee (₦)</label>
                  <input
                    type="number"
                    value={formData.shippingFee}
                    onChange={(e) => setFormData({ ...formData, shippingFee: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    placeholder="0"
                    min="0"
                    step="0.01"
                    disabled={formData.isFreeShipping}
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFreeShipping}
                      onChange={(e) => setFormData({ ...formData, isFreeShipping: e.target.checked, shippingFee: e.target.checked ? 0 : formData.shippingFee })}
                      className="mr-3 w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                    />
                    <span className="text-sm font-medium">Free Shipping</span>
                  </label>
                </div>
              </div>

              {/* Delivery Days and Sort Order */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Estimated Delivery Days</label>
                  <input
                    type="number"
                    value={formData.estimatedDeliveryDays}
                    onChange={(e) => setFormData({ ...formData, estimatedDeliveryDays: parseInt(e.target.value) || 3 })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    placeholder="3"
                    min="1"
                    max="30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-3 w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                  />
                  <span className="text-sm font-medium">Active (available for selection)</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all"
                >
                  {editingLocation ? 'Update Location' : 'Create Location'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminShippingLocations;