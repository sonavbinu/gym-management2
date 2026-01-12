import { useState } from 'react';
import { memberAPI } from '../../services/api';
import React from 'react';

interface MemberFormProps {
  initialData?: any;
  onClose: () => void;
  onSaved: (msg?: string) => void;
}

const MemberForm: React.FC<MemberFormProps> = ({
  initialData,
  onClose,
  onSaved,
}) => {
  const isEdit = !!initialData;
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    firstName:
      initialData?.userId?.profile?.firstName ||
      initialData?.user?.profile?.firstName ||
      '',
    lastName:
      initialData?.userId?.profile?.lastName ||
      initialData?.user?.profile?.lastName ||
      '',
    email: initialData?.userId?.email || initialData?.user?.email || '',
    phone:
      initialData?.userId?.profile?.phone ||
      initialData?.user?.profile?.phone ||
      '',
    password: '',
    height: initialData?.personalInfo?.height || '',
    weight: initialData?.personalInfo?.weight || '',
    age: initialData?.personalInfo?.age || '',
    goal: initialData?.personalInfo?.goal || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [lastStepTime, setLastStepTime] = useState(0);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!formData.firstName) errors.firstName = 'First name is required';
    if (!formData.lastName) errors.lastName = 'Last name is required';
    if (!formData.email) errors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      errors.email = 'Invalid email format';
    if (!isEdit && !formData.password) errors.password = 'Password is required';
    else if (!isEdit && formData.password.length < 6)
      errors.password = 'Password must be at least 6 characters';
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Phone must be 10 digits';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    if (
      formData.height &&
      (Number(formData.height) < 50 || Number(formData.height) > 300)
    ) {
      errors.height = 'Height must be between 50-300 cm';
    }
    if (
      formData.weight &&
      (Number(formData.weight) < 20 || Number(formData.weight) > 500)
    ) {
      errors.weight = 'Weight must be between 20-500 kg';
    }
    if (
      formData.age &&
      (Number(formData.age) < 10 || Number(formData.age) > 120)
    ) {
      errors.age = 'Age must be between 10-120';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      setLastStepTime(Date.now());
    }
  };

  const handleBack = () => {
    setStep(1);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 2) return;

    if (Date.now() - lastStepTime < 500) return;

    if (!validateStep2()) return;

    setLoading(true);
    setError(null);
    try {
      if (isEdit) {
        await memberAPI.update(initialData.id || initialData._id, {
          personalInfo: {
            height: formData.height ? Number(formData.height) : undefined,
            weight: formData.weight ? Number(formData.weight) : undefined,
            age: formData.age ? Number(formData.age) : undefined,
            goal: formData.goal,
          },
        });
        onSaved('Member updated successfully! ✅');
      } else {
        // Create member via memberAPI
        await memberAPI.create({
          email: formData.email,
          password: formData.password,
          profile: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
          },
          personalInfo: {
            height: formData.height ? Number(formData.height) : undefined,
            weight: formData.weight ? Number(formData.weight) : undefined,
            age: formData.age ? Number(formData.age) : undefined,
            goal: formData.goal,
          },
        });

        onSaved('Member created successfully! 🎉');
      }
      onClose();
    } catch (e: any) {
      setError(
        e.response?.data?.message ||
          e.message ||
          'Failed to save member. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, title: 'Account', icon: '👤' },
    { num: 2, title: 'Personal Info', icon: '📋' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>👥</span>
                <span>{isEdit ? 'Edit Member' : 'Add New Member'}</span>
              </h2>
              <p className="text-blue-100 mt-1">
                {isEdit
                  ? 'Update member information'
                  : 'Create a new member account'}
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
                        ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step > s.num ? '✓' : s.icon}
                  </div>
                  <p
                    className={`text-sm mt-2 font-semibold ${
                      step >= s.num ? 'text-blue-600' : 'text-gray-400'
                    }`}
                  >
                    {s.title}
                  </p>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded ${
                      step > s.num ? 'bg-blue-500' : 'bg-gray-200'
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
              if (step < 2) {
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
                    disabled={isEdit}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                      fieldErrors.firstName
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-blue-500'
                    } ${isEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
                    disabled={isEdit}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                      fieldErrors.lastName
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-blue-500'
                    } ${isEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
                      : 'border-gray-200 focus:border-blue-500'
                  } ${isEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="member@example.com"
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
                        : 'border-gray-200 focus:border-blue-500'
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
                  disabled={isEdit}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                    fieldErrors.phone
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-blue-500'
                  } ${isEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="1234567890"
                />
                {fieldErrors.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    ⚠️ {fieldErrors.phone}
                  </p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  💡 Enter 10-digit phone number (optional)
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Personal Information */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <span>📏</span>
                    <span>Height (cm)</span>
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    min="50"
                    max="300"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                      fieldErrors.height
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                    placeholder="170"
                  />
                  {fieldErrors.height && (
                    <p className="text-red-500 text-sm mt-1">
                      ⚠️ {fieldErrors.height}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <span>⚖️</span>
                    <span>Weight (kg)</span>
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    min="20"
                    max="500"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                      fieldErrors.weight
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                    placeholder="70"
                  />
                  {fieldErrors.weight && (
                    <p className="text-red-500 text-sm mt-1">
                      ⚠️ {fieldErrors.weight}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <span>🎂</span>
                  <span>Age</span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="10"
                  max="120"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                    fieldErrors.age
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-blue-500'
                  }`}
                  placeholder="25"
                />
                {fieldErrors.age && (
                  <p className="text-red-500 text-sm mt-1">
                    ⚠️ {fieldErrors.age}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <span>🎯</span>
                  <span>Fitness Goal</span>
                </label>
                <textarea
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="e.g., Lose weight, Build muscle, Improve endurance..."
                />
                <p className="text-gray-500 text-xs mt-1">
                  💡 Describe your fitness goals (optional)
                </p>
              </div>

              {/* Preview */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border-2 border-blue-200">
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
                    <span className="font-semibold">Height:</span>{' '}
                    {formData.height ? `${formData.height} cm` : 'Not provided'}
                  </p>
                  <p>
                    <span className="font-semibold">Weight:</span>{' '}
                    {formData.weight ? `${formData.weight} kg` : 'Not provided'}
                  </p>
                  <p>
                    <span className="font-semibold">Age:</span>{' '}
                    {formData.age || 'Not provided'}
                  </p>
                  <p>
                    <span className="font-semibold">Goal:</span>{' '}
                    {formData.goal || 'Not provided'}
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
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{step === 1 ? 'Cancel' : 'Back'}</span>
            </button>

            {step < 2 ? (
              <button
                key="next-btn"
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Next</span>
              </button>
            ) : (
              <button
                key="submit-btn"
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>✓</span>
                    <span>{isEdit ? 'Update Member' : 'Create Member'}</span>
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

export default MemberForm;
