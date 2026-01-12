import api from './api';

export const getPlans = () => api.get('/subscriptions/plans');

export const getMyCurrentSubscription = () =>
  api.get('/subscriptions/me/current');

export const getMySubscriptionHistory = () =>
  api.get('/subscriptions/me/history');

export const subscribeMe = (data: {
  planId: string;
  paymentMethod: 'card' | 'upi' | 'cash';
}) => api.post('/subscriptions/me/subscribe', data);

export const pauseMySubscription = (id: string) =>
  api.patch(`/subscriptions/me/${id}/pause`);

export const resumeMySubscription = (id: string) =>
  api.patch(`/subscriptions/me/${id}/resume`);
