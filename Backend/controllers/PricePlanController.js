const { PricePlan } = require('../models');

// Get all price plans
async function getAll(req, res) {
  try {
    const { includeInactive } = req.query;
    
    const where = includeInactive === 'true' ? {} : { isActive: true };
    
    const plans = await PricePlan.findAll({
      where,
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error('Error fetching price plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch price plans',
      error: error.message,
    });
  }
}

// Get a single price plan by ID
async function getById(req, res) {
  try {
    const { id } = req.params;

    const plan = await PricePlan.findByPk(id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Price plan not found',
      });
    }

    res.json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error('Error fetching price plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch price plan',
      error: error.message,
    });
  }
}

// Create a new price plan
async function create(req, res) {
  try {
    const { name, description, price, image, badge, offer, color, isActive, sortOrder } = req.body;

    // Validate required fields
    if (!name || !description || !price) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, and price are required',
      });
    }

    // Get max sort order if not provided
    let finalSortOrder = sortOrder;
    if (finalSortOrder === undefined || finalSortOrder === null) {
      const maxOrder = await PricePlan.max('sortOrder');
      finalSortOrder = (maxOrder || 0) + 1;
    }

    const plan = await PricePlan.create({
      name,
      description,
      price,
      image: image || null,
      badge: badge || null,
      offer: offer || null,
      color: color || 'bg-[#C5E17A]',
      isActive: isActive !== false,
      sortOrder: finalSortOrder,
    });

    res.status(201).json({
      success: true,
      message: 'Price plan created successfully',
      data: plan,
    });
  } catch (error) {
    console.error('Error creating price plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create price plan',
      error: error.message,
    });
  }
}

// Update a price plan
async function update(req, res) {
  try {
    const { id } = req.params;
    const { name, description, price, image, badge, offer, color, isActive, sortOrder } = req.body;

    const plan = await PricePlan.findByPk(id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Price plan not found',
      });
    }

    // Update fields
    await plan.update({
      name: name || plan.name,
      description: description || plan.description,
      price: price || plan.price,
      image: image !== undefined ? image : plan.image,
      badge: badge !== undefined ? badge : plan.badge,
      offer: offer !== undefined ? offer : plan.offer,
      color: color || plan.color,
      isActive: isActive !== undefined ? isActive : plan.isActive,
      sortOrder: sortOrder !== undefined ? sortOrder : plan.sortOrder,
    });

    res.json({
      success: true,
      message: 'Price plan updated successfully',
      data: plan,
    });
  } catch (error) {
    console.error('Error updating price plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update price plan',
      error: error.message,
    });
  }
}

// Delete a price plan
async function deletePlan(req, res) {
  try {
    const { id } = req.params;

    const plan = await PricePlan.findByPk(id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Price plan not found',
      });
    }

    // Soft delete - just set isActive to false
    await plan.update({ isActive: false });

    res.json({
      success: true,
      message: 'Price plan deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting price plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete price plan',
      error: error.message,
    });
  }
}

// Reorder price plans
async function reorder(req, res) {
  try {
    const { planIds } = req.body;

    if (!Array.isArray(planIds)) {
      return res.status(400).json({
        success: false,
        message: 'planIds must be an array',
      });
    }

    // Update sort order for each plan
    for (let i = 0; i < planIds.length; i++) {
      await PricePlan.update(
        { sortOrder: i + 1 },
        { where: { id: planIds[i] } }
      );
    }

    res.json({
      success: true,
      message: 'Price plans reordered successfully',
    });
  } catch (error) {
    console.error('Error reordering price plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder price plans',
      error: error.message,
    });
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: deletePlan,
  reorder,
};

