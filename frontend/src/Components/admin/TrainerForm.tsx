import React, { useEffect, useState } from 'react';
import { trainerAPI } from '../../services/api';

interface TrainerFormProps {
  initialData?: any;
  onClose: () => void;
  onSaved: (msg?: string) => void;
}

const TrainerForm: React.FC<TrainerFormProps> = ({
  initialData,
  onClose,
  onSaved,
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    specialization: '',
    experience: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [lastStepTime, setLastStepTime] = useState(0);

  useEffect(() => {
    if (initialData) {
      const user = initialData.userId || initialData.user || {};
      setFormData({
        email: user.email || initialData.email || '',
        password: '',
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        phone: user.profile?.phone || '',
        specialization: (initialData.specialization || []).join(', '),
        experience: initialData.experience || 0,
      });
    }
  }, [initialData]);

  const isEdit = Boolean(initialData);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field error when user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!formData.email) errors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      errors.email = 'Invalid email format';
    if (!isEdit && !formData.password) errors.password = 'Password is required';
    else if (!isEdit && formData.password.length < 6)
      errors.password = 'Password must be at least 6 characters';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    if (!formData.firstName) errors.firstName = 'First name is required';
    if (!formData.lastName) errors.lastName = 'Last name is required';
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Phone must be 10 digits';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = () => {
    const errors: Record<string, string> = {};
    if (formData.experience < 0)
      errors.experience = 'Experience cannot be negative';
    if (!formData.specialization)
      errors.specialization = 'At least one specialization is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      setLastStepTime(Date.now());
    } else if (step === 2 && validateStep2()) {
      setStep(3);
      setLastStepTime(Date.now());
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Only allow submission on the final step
    if (step !== 3) return;

    // Prevent phantom clicks from previous step transition
    if (Date.now() - lastStepTime < 500) return;

    if (!validateStep3()) return;

    setLoading(true);
    setError(null);
    try {
      if (!isEdit) {
        // Create new trainer
        await trainerAPI.create({
          email: formData.email,
          password: formData.password,
          profile: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
          },
          specialization: formData.specialization
            .split(',')
            .map(s => s.trim())
            .filter(Boolean),
          experience: Number(formData.experience),
        });
        onSaved('Trainer created successfully! 🎉');
      } else {
        // Update existing trainer
        const id = initialData.id || initialData._id;
        await trainerAPI.update(id, {
          profile: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
          },
          specialization: formData.specialization
            .split(',')
            .map(s => s.trim())
            .filter(Boolean),
          experience: Number(formData.experience),
        });
        onSaved('Trainer updated successfully! ✅');
      }

      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to save trainer. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, title: 'Account', icon: '🔐' },
    { num: 2, title: 'Profile', icon: '👤' },
    { num: 3, title: 'Details', icon: '🏋️' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>🏃</span>
                <span>{isEdit ? 'Edit Trainer' : 'Add New Trainer'}</span>
              </h2>
              <p className="text-green-100 mt-1">
                {isEdit
                  ? 'Update trainer information'
                  : 'Create a new trainer account'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-all"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {steps.map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all ${
                      step >= s.num
                        ? 'bg-gradient-to-br from-green-500 to-blue-500 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step > s.num ? '✓' : s.icon}
                  </div>
                  <p
                    className={`text-sm mt-2 font-semibold ${
                      step >= s.num ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    {s.title}
                  </p>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded ${
                      step > s.num ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form
          onSubmit={handleSubmit}
          className="p-6"
          onKeyDown={e => {
            if (e.key === 'Enter') {
              if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;

              e.preventDefault();
              if (step < 3) {
                handleNext();
              } else {
                handleSubmit(e);
              }
            }
          }}
        >
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <p className="text-red-600 font-semibold">{error}</p>
            </div>
          )}

          {/* Step 1: Account Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <span>📧</span>
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isEdit}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                    fieldErrors.email
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-green-500'
                  } ${isEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="trainer@example.com"
                />
                {fieldErrors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    ⚠️ {fieldErrors.email}
                  </p>
                )}
              </div>

              {!isEdit && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <span>🔒</span>
                    <span>Password</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                      fieldErrors.password
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-green-500'
                    }`}
                    placeholder="Minimum 6 characters"
                  />
                  {fieldErrors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      ⚠️ {fieldErrors.password}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    💡 Use a strong password with letters and numbers
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Profile Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <span>👤</span>
                    <span>First Name</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                      fieldErrors.firstName
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-green-500'
                    }`}
                    placeholder="John"
                  />
                  {fieldErrors.firstName && (
                    <p className="text-red-500 text-sm mt-1">
                      ⚠️ {fieldErrors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <span>👤</span>
                    <span>Last Name</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                      fieldErrors.lastName
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-green-500'
                    }`}
                    placeholder="Doe"
                  />
                  {fieldErrors.lastName && (
                    <p className="text-red-500 text-sm mt-1">
                      ⚠️ {fieldErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <span>📱</span>
                  <span>Phone Number</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                    fieldErrors.phone
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-green-500'
                  }`}
                  placeholder="1234567890"
                />
                {fieldErrors.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    ⚠️ {fieldErrors.phone}
                  </p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  💡 Enter 10-digit phone number
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Trainer Details */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <span>⏱️</span>
                  <span>Experience (Years)</span>
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  min="0"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                    fieldErrors.experience
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-green-500'
                  }`}
                  placeholder="5"
                />
                {fieldErrors.experience && (
                  <p className="text-red-500 text-sm mt-1">
                    ⚠️ {fieldErrors.experience}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <span>🏋️</span>
                  <span>Specializations</span>
                </label>
                <textarea
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                    fieldErrors.specialization
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-green-500'
                  }`}
                  placeholder="Yoga, Weightlifting, Cardio, CrossFit"
                />
                {fieldErrors.specialization && (
                  <p className="text-red-500 text-sm mt-1">
                    ⚠️ {fieldErrors.specialization}
                  </p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  💡 Enter comma-separated specializations
                </p>
              </div>

              {/* Preview */}
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 border-2 border-green-200">
                <p className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <span>👁️</span>
                  <span>Preview</span>
                </p>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-semibold">Name:</span>{' '}
                    {formData.firstName} {formData.lastName}
                  </p>
                  <p>
                    <span className="font-semibold">Email:</span>{' '}
                    {formData.email}
                  </p>
                  <p>
                    <span className="font-semibold">Phone:</span>{' '}
                    {formData.phone || 'Not provided'}
                  </p>
                  <p>
                    <span className="font-semibold">Experience:</span>{' '}
                    {formData.experience} years
                  </p>
                  <p>
                    <span className="font-semibold">Specializations:</span>{' '}
                    {formData.specialization || 'None'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={step === 1 ? onClose : handleBack}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all flex items-center gap-2"
            >
              <span>{step === 1 ? 'Cancel' : 'Back'}</span>
            </button>

            {step < 3 ? (
              <button
                key="next-btn"
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <span>Next</span>
              </button>
            ) : (
              <button
                key="submit-btn"
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>✓</span>
                    <span>{isEdit ? 'Update Trainer' : 'Create Trainer'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrainerForm;
