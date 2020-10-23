const apiBase = '/api/v1';

export const apiEndpoints = {
  ping: `${apiBase}/ping`,
  login: `${apiBase}/token/login`,
  refreshToken: `${apiBase}/token/refresh`,
  status: `${apiBase}/status`,
  trades: `${apiBase}/trades`,
  count: `${apiBase}/count`,
  profit: `${apiBase}/profit`,
  performance: `${apiBase}/performance`,
  balance: `${apiBase}/balance`,
  daily: `${apiBase}/daily`,
};
