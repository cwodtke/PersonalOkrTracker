const API_URL = 'http://localhost:3001/api';

// Get userId from localStorage
const getUserId = () => localStorage.getItem('userId');

const headers = () => ({
  'Content-Type': 'application/json',
  'X-User-Id': getUserId()
});

// Auth
export const login = async (email) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return response.json();
};

export const verifyMagicLink = async (token) => {
  const response = await fetch(`${API_URL}/auth/verify/${token}`);
  return response.json();
};

// User
export const getUser = async () => {
  const response = await fetch(`${API_URL}/user`, { headers: headers() });
  return response.json();
};

export const updateUserSettings = async (settings) => {
  const response = await fetch(`${API_URL}/user/settings`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(settings)
  });
  return response.json();
};

// Objectives
export const getObjectives = async () => {
  const response = await fetch(`${API_URL}/objectives`, { headers: headers() });
  return response.json();
};

export const getCurrentObjectives = async () => {
  const response = await fetch(`${API_URL}/objectives/current`, { headers: headers() });
  return response.json();
};

export const getPastObjectives = async () => {
  const response = await fetch(`${API_URL}/objectives/past`, { headers: headers() });
  return response.json();
};

export const createObjective = async (objective) => {
  const response = await fetch(`${API_URL}/objectives`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(objective)
  });
  return response.json();
};

export const updateObjective = async (id, objective) => {
  const response = await fetch(`${API_URL}/objectives/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(objective)
  });
  return response.json();
};

export const deleteObjective = async (id) => {
  const response = await fetch(`${API_URL}/objectives/${id}`, {
    method: 'DELETE',
    headers: headers()
  });
  return response.json();
};

export const updateKeyResult = async (id, updates) => {
  const response = await fetch(`${API_URL}/key-results/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(updates)
  });
  return response.json();
};

// Health Metrics
export const getHealthMetrics = async () => {
  const response = await fetch(`${API_URL}/health-metrics`, { headers: headers() });
  return response.json();
};

export const createHealthMetric = async (metric) => {
  const response = await fetch(`${API_URL}/health-metrics`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(metric)
  });
  return response.json();
};

// Tasks
export const getTasks = async (view = 'all') => {
  const response = await fetch(`${API_URL}/tasks?view=${view}`, { headers: headers() });
  return response.json();
};

export const createTask = async (task) => {
  const response = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(task)
  });
  return response.json();
};

export const updateTask = async (id, task) => {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(task)
  });
  return response.json();
};

export const deleteTask = async (id) => {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: headers()
  });
  return response.json();
};

// Email
export const sendTestEmail = async () => {
  const response = await fetch(`${API_URL}/email/test`, {
    method: 'POST',
    headers: headers()
  });
  return response.json();
};
