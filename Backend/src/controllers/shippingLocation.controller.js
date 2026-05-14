const shippingLocationModel = require('../models/ShippingLocation');

// @desc    Get all shipping locations (Public)
// @route   GET /api/shipping-locations
// @access  Public
const getShippingLocations = async (req, res) => {
  try {
    console.log('📍 Fetching shipping locations...');

    const locations = await shippingLocationModel
      .find({ isActive: true })
      .sort({ sortOrder: 1, region: 1, state: 1 })
      .select('-__v');

    console.log(`📍 Found ${locations.length} active shipping locations`);

    res.status(200).json({
      status: true,
      message: 'Shipping locations retrieved successfully',
      data: locations
    });
  } catch (error) {
    console.error('❌ Error fetching shipping locations:', error);
    res.status(500).json({
      status: false,
      message: 'Server error while fetching shipping locations'
    });
  }
};

// @desc    Get all shipping locations (Admin only)
// @route   GET /api/shipping-locations/admin
// @access  Private/Admin
const getAllShippingLocations = async (req, res) => {
  try {
    console.log('📍 Fetching all shipping locations for admin...');

    const { page = 1, limit = 50, search = '', region = '', state = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { region: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }
    if (region) query.region = { $regex: region, $options: 'i' };
    if (state) query.state = { $regex: state, $options: 'i' };

    const locations = await shippingLocationModel
      .find(query)
      .sort({ sortOrder: 1, region: 1, state: 1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('-__v');

    const total = await shippingLocationModel.countDocuments(query);

    console.log(`📍 Found ${locations.length} shipping locations (total: ${total})`);

    res.status(200).json({
      status: true,
      message: 'Shipping locations retrieved successfully',
      data: {
        locations,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching shipping locations:', error);
    res.status(500).json({
      status: false,
      message: 'Server error while fetching shipping locations'
    });
  }
};

// @desc    Get single shipping location
// @route   GET /api/shipping-locations/:id
// @access  Public
const getShippingLocation = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`📍 Fetching shipping location: ${id}`);

    const location = await shippingLocationModel.findById(id).select('-__v');

    if (!location) {
      return res.status(404).json({
        status: false,
        message: 'Shipping location not found'
      });
    }

    res.status(200).json({
      status: true,
      message: 'Shipping location retrieved successfully',
      data: location
    });
  } catch (error) {
    console.error('❌ Error fetching shipping location:', error);
    res.status(500).json({
      status: false,
      message: 'Server error while fetching shipping location'
    });
  }
};

// @desc    Create shipping location (Admin only)
// @route   POST /api/shipping-locations
// @access  Private/Admin
const createShippingLocation = async (req, res) => {
  try {
    const { name, description, region, state, city, shippingFee, isFreeShipping, estimatedDeliveryDays, sortOrder } = req.body;

    console.log('📍 Creating shipping location:', req.body);

    // Validate required fields
    if (!name || !region || !state) {
      return res.status(400).json({
        status: false,
        message: 'Name, region, and state are required'
      });
    }

    // If free shipping is true, set shipping fee to 0
    const finalShippingFee = isFreeShipping ? 0 : (shippingFee || 0);

    const location = new shippingLocationModel({
      name: name.trim(),
      description: description?.trim(),
      region: region.trim(),
      state: state.trim(),
      city: city?.trim(),
      shippingFee: finalShippingFee,
      isFreeShipping: !!isFreeShipping,
      estimatedDeliveryDays: estimatedDeliveryDays || 3,
      sortOrder: sortOrder || 0
    });

    await location.save();

    console.log('✅ Shipping location created:', location._id);

    res.status(201).json({
      status: true,
      message: 'Shipping location created successfully',
      data: location
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        status: false,
        message: 'A shipping location with this name already exists'
      });
    }
    console.error('❌ Error creating shipping location:', error);
    res.status(500).json({
      status: false,
      message: 'Server error while creating shipping location'
    });
  }
};

// @desc    Update shipping location (Admin only)
// @route   PUT /api/shipping-locations/:id
// @access  Private/Admin
const updateShippingLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, region, state, city, shippingFee, isFreeShipping, estimatedDeliveryDays, sortOrder, isActive } = req.body;

    console.log(`📍 Updating shipping location: ${id}`, req.body);

    // If free shipping is true, set shipping fee to 0
    const finalShippingFee = isFreeShipping ? 0 : (shippingFee || 0);

    const location = await shippingLocationModel.findByIdAndUpdate(
      id,
      {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() }),
        ...(region && { region: region.trim() }),
        ...(state && { state: state.trim() }),
        ...(city !== undefined && { city: city?.trim() }),
        shippingFee: finalShippingFee,
        isFreeShipping: !!isFreeShipping,
        ...(estimatedDeliveryDays && { estimatedDeliveryDays }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive })
      },
      { new: true }
    ).select('-__v');

    if (!location) {
      return res.status(404).json({
        status: false,
        message: 'Shipping location not found'
      });
    }

    console.log('✅ Shipping location updated:', location._id);

    res.status(200).json({
      status: true,
      message: 'Shipping location updated successfully',
      data: location
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        status: false,
        message: 'A shipping location with this name already exists'
      });
    }
    console.error('❌ Error updating shipping location:', error);
    res.status(500).json({
      status: false,
      message: 'Server error while updating shipping location'
    });
  }
};

// @desc    Delete shipping location (Admin only)
// @route   DELETE /api/shipping-locations/:id
// @access  Private/Admin
const deleteShippingLocation = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Deleting shipping location: ${id}`);

    const location = await shippingLocationModel.findByIdAndDelete(id);

    if (!location) {
      return res.status(404).json({
        status: false,
        message: 'Shipping location not found'
      });
    }

    console.log('✅ Shipping location deleted:', id);

    res.status(200).json({
      status: true,
      message: 'Shipping location deleted successfully',
      data: { deletedId: id }
    });
  } catch (error) {
    console.error('❌ Error deleting shipping location:', error);
    res.status(500).json({
      status: false,
      message: 'Server error while deleting shipping location'
    });
  }
};

module.exports = {
  getShippingLocations,
  getAllShippingLocations,
  getShippingLocation,
  createShippingLocation,
  updateShippingLocation,
  deleteShippingLocation
};