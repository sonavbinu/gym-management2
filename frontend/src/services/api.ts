import axios from 'axios';
import type {
  AuthResponse,
  LoginData,
  RegisterData,
  Member,
  Trainer,
  Subscription,
  Payment,
} from '../types';

const API_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  console.log(' Request interceptor:', {
    url: config.url,
    hasToken: !!token,
    tokenLength: token?.length || 0,
    authHeaderBefore: config.headers.Authorization,
  });
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
    console.log(' Token added to request');
    console.log(
      ' Auth header after:',
      config.headers['Authorization']?.substring(0, 30) + '...'
    );
  } else {
    console.log(' No token found in localStorage');
  }
  console.log(' Final headers:', config.headers);
  return config;
});

// Transform _id to id in responses
api.interceptors.response.use(
  response => {
    if (response.data) {
      response.data = transformIds(response.data);
    }
    return response;
  },
  error => {
    console.error('API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers,
    });
    return Promise.reject(error);
  }
);

// Helper function to transform _id to id recursively
function transformIds(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(transformIds);
  } else if (obj !== null && typeof obj === 'object') {
    const transformed: any = {};
    for (const key in obj) {
      if (key === '_id') {
        transformed.id = obj[key];
        transformed._id = obj[key];
      } else {
        transformed[key] = transformIds(obj[key]);
      }
    }
    return transformed;
  }
  return obj;
}

//auth api
export const authAPI = {
  login: (data: LoginData) => api.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterData) =>
    api.post<AuthResponse>('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};
//member api
export const memberAPI = {
  getAll: () => api.get<Member[]>('/members'),
  create: (data: any) => api.post<Member>('/members', data),
  getById: (id: string) => api.get<Member>(`/members/${id}`),
  getMyProfile: () => api.get<Member>('/members/me'),
  updateMyProfile: (data: any) => api.put<Member>('/members/profile', data),
  update: (id: string, data: any) => api.put<Member>(`/members/${id}`, data),
  delete: (id: string) => api.delete(`/members/${id}`),
};

//trainer api
export const trainerAPI = {
  getAll: () => api.get<Trainer[]>('/trainers'),
  getById: (id: string) => api.get<Trainer>(`/trainers/${id}`),
  getMyAssignedMembers: () => api.get<Member[]>('/trainers/my-members'),
  getMySubscriptions: () =>
    api.get<Subscription[]>('/trainers/my-subscriptions'),
  getProfile: () => api.get<Trainer>('/trainers/me'),
  create: (data: any) => api.post<Trainer>('/trainers', data),
  assignMember: (data: { trainerId: string; memberId: string }) =>
    api.post('/trainers/assign', data),
  unassignMember: (data: { trainerId: string; memberId: string }) =>
    api.post('/trainers/unassign', data),
  update: (id: string, data: any) => api.put<Trainer>(`/trainers/${id}`, data),
  delete: (id: string) => api.delete(`/trainers/${id}`),
};

//subscription api
export const subscriptionAPI = {
  getPlans: () => api.get('/subscriptions/plans'),
  create: (data: any) => api.post<Subscription>('/subscriptions', data),
  assignToMember: (memberId: string, data: any) =>
    api.post(`/subscriptions/assign/${memberId}`, data),
  getMemberSubscriptions: (memberId: string) =>
    api.get<Subscription[]>(`/subscriptions/member/${memberId}`),
  getAllSubscriptions: () => api.get<Subscription[]>('/subscriptions'),
  getMySubscriptions: () => api.get<Subscription[]>('/subscriptions/my'),
  pause: (id: string) => api.patch<Subscription>(`/subscriptions/${id}/pause`),
  resume: (id: string) =>
    api.patch<Subscription>(`/subscriptions/${id}/resume`),
  pauseMy: (id: string) =>
    api.patch<Subscription>(`/subscriptions/my/${id}/pause`),
  resumeMy: (id: string) =>
    api.patch<Subscription>(`/subscriptions/my/${id}/resume`),
  cancelMy: (id: string) => api.patch(`/subscriptions/my/${id}/cancel`),
  subscribeMe: (data: {
    planId: string;
    paymentMethod: 'card' | 'upi' | 'cash';
  }) => api.post('/subscriptions/me/subscribe', data),
  getAll: () => api.get<Subscription[]>('/subscriptions'),
  // plan CRUD
  createPlan: (data: { name: string; duration: number; price: number }) =>
    api.post('/subscriptions/plans', data),
  updatePlan: (id: string, data: any) =>
    api.put(`/subscriptions/plans/${id}`, data),
  deletePlan: (id: string) => api.delete(`/subscriptions/plans/${id}`),
  delete: (id: string) => api.delete(`/subscriptions/${id}`),
};

//payment api
export const paymentAPI = {
  getMemberPayments: (memberId: string) =>
    api.get<Payment[]>(`/payments/member/${memberId}`),
  getAll: () => api.get<Payment[]>('/payments'),
  getMyPayments: () => api.get<Payment[]>('/payments/my'),
  create: (data: { planId: string; paymentMethod: string }) =>
    api.post('/payments/create', data),
};

//schedule api
export const scheduleAPI = {
  getMemberSchedule: (memberId: string) =>
    api.get(`/schedules/member/${memberId}`),
  create: (data: any) => api.post('/schedules', data),
  update: (id: string, data: any) => api.put(`/schedules/${id}`, data),
  updateExerciseStatus: (
    scheduleId: string,
    data: { day: string; exerciseIndex: number; completed: boolean }
  ) => api.patch(`/schedules/${scheduleId}/status`, data),
  getMemberStats: (memberId: string) =>
    api.get(`/schedules/member/${memberId}/stats`),
};

export default api;
