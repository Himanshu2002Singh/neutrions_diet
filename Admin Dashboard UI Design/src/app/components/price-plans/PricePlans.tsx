import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, DollarSign, Tag, FileText, Image, Check, X, GripVertical } from 'lucide-react';

// Price Plan interface
interface PricePlan {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string | null;
  badge: string | null;
  offer: string | null;
  color: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Color options for plans
const COLOR_OPTIONS = [
  { value: 'bg-[#C5E17A]', label: 'Light Green', hex: '#C5E17A' },
  { value: 'bg-[#FFC878]', label: 'Orange', hex: '#FFC878' },
  { value: 'bg-[#CE93D8]', label: 'Purple', hex: '#CE93D8' },
  { value: 'bg-[#4FC3F7]', label: 'Light Blue', hex: '#4FC3F7' },
  { value: 'bg-[#FF8A65]', label: 'Coral', hex: '#FF8A65' },
];

// Default image placeholder
const DEFAULT_IMAGE = '/images/meal_planer.jpg';

export default function PricePlans() {
  const [plans, setPlans] = useState<PricePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricePlan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    badge: '',
    offer: '',
    color: 'bg-[#C5E17A]',
    isActive: true,
  });

  // Fetch plans from backend
  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('neutrion-auth-token');
      const response = await fetch('https://api.nutreazy.in/api/price-plans?includeInactive=true', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setPlans(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch plans');
      }
    } catch (err: any) {
      console.error('Error fetching plans:', err);
      setError(err.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Open modal for creating new plan
  const handleCreateNew = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
      badge: '',
      offer: '',
      color: 'bg-[#C5E17A]',
      isActive: true,
    });
    setShowModal(true);
  };

  // Open modal for editing existing plan
  const handleEdit = (plan: PricePlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      image: plan.image || '',
      badge: plan.badge || '',
      offer: plan.offer || '',
      color: plan.color,
      isActive: plan.isActive,
    });
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('neutrion-auth-token');
      const url = editingPlan
        ? `https://api.nutreazy.in/api/price-plans/${editingPlan.id}`
        : 'https://api.nutreazy.in/api/price-plans';
      const method = editingPlan ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setShowModal(false);
        fetchPlans();
      } else {
        throw new Error(data.message || 'Failed to save plan');
      }
    } catch (err: any) {
      console.error('Error saving plan:', err);
      alert(err.message || 'Failed to save plan');
    }
  };

  // Handle delete (soft delete)
  const handleDelete = async (planId: number) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;

    try {
      const token = localStorage.getItem('neutrion-auth-token');
      const response = await fetch(`https://api.nutreazy.in/api/price-plans/${planId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        fetchPlans();
      } else {
        throw new Error(data.message || 'Failed to delete plan');
      }
    } catch (err: any) {
      console.error('Error deleting plan:', err);
      alert(err.message || 'Failed to delete plan');
    }
  };

  // Toggle plan active status
  const handleToggleActive = async (plan: PricePlan) => {
    try {
      const token = localStorage.getItem('neutrion-auth-token');
      const response = await fetch(`https://api.nutreazy.in/api/price-plans/${plan.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !plan.isActive }),
      });

      const data = await response.json();

      if (data.success) {
        fetchPlans();
      } else {
        throw new Error(data.message || 'Failed to update plan');
      }
    } catch (err: any) {
      console.error('Error toggling plan status:', err);
      alert(err.message || 'Failed to update plan');
    }
  };

  // Get color preview style
  const getColorStyle = (colorValue: string) => {
    const colorMap: Record<string, string> = {
      'bg-[#C5E17A]': '#C5E17A',
      'bg-[#FFC878]': '#FFC878',
      'bg-[#CE93D8]': '#CE93D8',
      'bg-[#4FC3F7]': '#4FC3F7',
      'bg-[#FF8A65]': '#FF8A65',
    };
    return {
      backgroundColor: colorMap[colorValue] || colorValue,
    };
  };

  if (loading && plans.length === 0) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Price Plans</h1>
          <p className="text-gray-600 mt-2">Loading...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-6">
                <div className="h-6 bg-gray-200 rounded mb-3" />
                <div className="h-4 bg-gray-200 rounded mb-4" />
                <div className="h-5 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Price Plans</h1>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
        <button
          onClick={fetchPlans}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Price Plans</h1>
          <p className="text-gray-600 mt-2">Manage your pricing plans and subscriptions</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="bg-[#FF6B4A] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus size={20} />
          Add New Plan
        </button>
      </div>

      {/* Plans Grid */}
      {plans.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <DollarSign className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Price Plans Yet</h3>
          <p className="text-gray-600 mb-6">Create your first pricing plan to get started</p>
          <button
            onClick={handleCreateNew}
            className="bg-[#FF6B4A] text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Create Your First Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-opacity ${
                plan.isActive ? '' : 'opacity-60'
              }`}
            >
              {/* Card Header with Color */}
              <div
                className={`${plan.color} h-48 flex items-center justify-center p-4 relative`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute top-3 right-3 bg-white text-black text-xs px-2 py-1 rounded-full font-semibold">
                    {plan.badge}
                  </div>
                )}
                {/* Offer */}
                {plan.offer && (
                  <div className="absolute top-3 left-3 bg-[#FF6B4A] text-white text-xs px-2 py-1 rounded-full font-semibold">
                    {plan.offer}
                  </div>
                )}
                {/* Image */}
                <img
                  src={plan.image || DEFAULT_IMAGE}
                  alt={plan.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>

              {/* Card Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                  <span className="text-xl font-bold text-[#FF6B4A]">{plan.price}</span>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{plan.description}</p>

                {/* Status Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      plan.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-xs text-gray-500">Sort: {plan.sortOrder}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleEdit(plan)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(plan)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      plan.isActive
                        ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                        : 'text-green-600 bg-green-50 hover:bg-green-100'
                    }`}
                  >
                    <Check size={16} />
                    {plan.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPlan ? 'Edit Price Plan' : 'Create New Price Plan'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Personal Meal Plan"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B4A] focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  placeholder="Describe what this plan includes..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B4A] focus:border-transparent"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., From $99/month"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B4A] focus:border-transparent"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B4A] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to use default image
                </p>
              </div>

              {/* Badge and Offer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Badge (optional)
                  </label>
                  <input
                    type="text"
                    name="badge"
                    value={formData.badge}
                    onChange={handleInputChange}
                    placeholder="e.g., Popular, Premium"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B4A] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Offer Text (optional)
                  </label>
                  <input
                    type="text"
                    name="offer"
                    value={formData.offer}
                    onChange={handleInputChange}
                    placeholder="e.g., 20% OFF First Month"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B4A] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Color
                </label>
                <div className="flex flex-wrap gap-3">
                  {COLOR_OPTIONS.map((color) => (
                    <label
                      key={color.value}
                      className={`cursor-pointer relative w-10 h-10 rounded-full transition-transform hover:scale-110 ${
                        formData.color === color.value ? 'ring-2 ring-offset-2 ring-[#FF6B4A]' : ''
                      }`}
                      style={{ backgroundColor: color.hex }}
                    >
                      <input
                        type="radio"
                        name="color"
                        value={color.value}
                        checked={formData.color === color.value}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      {formData.color === color.value && (
                        <Check
                          className="absolute inset-0 m-auto text-white"
                          size={16}
                        />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-[#FF6B4A] border-gray-300 rounded focus:ring-[#FF6B4A]"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Plan is active and visible to users
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#FF6B4A] rounded-lg hover:opacity-90 transition-opacity"
                >
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

