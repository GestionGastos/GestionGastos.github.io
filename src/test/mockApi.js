import { API_BASE_URL } from '../shared/config/apiConfig.js';

function jsonResponse(payload, status = 200, delay = 0) {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (status === 0) {
        reject(new TypeError('Failed to fetch'));
        return;
      }

      resolve({
        ok: status >= 200 && status < 300,
        status,
        headers: {
          get: (name) => (name.toLowerCase() === 'content-type' ? 'application/json' : null),
        },
        json: async () => payload,
      });
    }, delay);
  });
}

function encodeJwt(payload) {
  return `${btoa(JSON.stringify({ alg: 'none' }))}.${btoa(JSON.stringify(payload))}.sig`;
}

export function installApiMock(options = {}) {
  const users = options.users ?? [];
  const budgets = options.budgets ?? [];
  const delays = options.delays ?? {};
  const fail = options.fail ?? {};
  const calls = [];

  window.fetch = async (url, init = {}) => {
    const target = new URL(String(url), API_BASE_URL);
    const path = target.pathname.replace(/\/$/, '') || '/';
    const method = (init.method ?? 'GET').toUpperCase();
    const body = init.body ? JSON.parse(init.body) : null;
    calls.push({ path, method, body });

    if (fail.network && fail.network({ path, method })) {
      return jsonResponse(null, 0);
    }

    if (path.endsWith('/users/signup') && method === 'POST') {
      if (users.some((user) => user.email === body.email)) {
        return jsonResponse({ message: 'exists' }, 409);
      }
      users.push(body);
      return jsonResponse({ message: 'success' }, 200, delays.signup ?? 0);
    }

    if (path.endsWith('/users/login') && method === 'POST') {
      const user = users.find((item) => item.email === body.email && item.password === body.password);
      if (!user) {
        return jsonResponse({ message: 'Invalid Password' }, 401, delays.login ?? 0);
      }
      const token = encodeJwt({
        id: 'user-1',
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + 3600,
      });
      return jsonResponse({
        message: 'success',
        token,
        user: { _id: 'user-1', ...user },
      }, 200, delays.login ?? 0);
    }

    if (path.includes('/expense-type')) {
      return jsonResponse({ expenseTypes: [{ name: 'rent' }, { name: 'groceries' }] });
    }

    if (path.includes('/goal/budget') || path.endsWith('/goal')) {
      return jsonResponse({ goals: [] });
    }

    if (method === 'POST' && (path.includes('/budgets') || path.endsWith('/budget/create'))) {
      if (fail.saveBudget) {
        return jsonResponse({ message: 'fail' }, 500);
      }
      const budget = { _id: `budget-${budgets.length + 1}`, ...body };
      budgets.push(budget);
      return jsonResponse({ budget });
    }

    if (method === 'PUT' && path.includes('/budget/update/')) {
      const budgetId = path.split('/').at(-1);
      const budgetIndex = budgets.findIndex((budget) => budget._id === budgetId);
      if (budgetIndex >= 0) {
        budgets[budgetIndex] = { ...budgets[budgetIndex], ...body };
        return jsonResponse({ budget: budgets[budgetIndex] }, 200, delays.updateBudget ?? 0);
      }
      return jsonResponse({ message: 'not found' }, 404);
    }

    if (path.includes('/current')) {
      return jsonResponse({ budget: budgets[0] ? [budgets[0]] : [] });
    }

    if (path.includes('/budgets') || path.endsWith('/budget/budgets') || path.endsWith('/budget')) {
      return jsonResponse({ budgets });
    }

    return jsonResponse({ message: 'not found' }, 404);
  };

  return { users, budgets, calls, fail };
}
