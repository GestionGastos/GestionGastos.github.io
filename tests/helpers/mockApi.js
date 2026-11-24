import { API_BASE_URL } from '../../src/shared/config/apiConfig.js';

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
  const shoppingLists = options.shoppingLists ?? [];
  const tasks = options.tasks ?? [];
  const goals = options.goals ?? [];
  const serviceRecords = options.serviceRecords ?? { accounts: [], plans: [], routines: [] };
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

    if (path.endsWith('/users/update_password') && method === 'PUT') return jsonResponse({ message: 'success' });
    if (path.endsWith('/users/delete') && method === 'DELETE') return jsonResponse({ message: 'success', user: { deleted: true } });

    if (path.includes('/expense-type')) {
      return jsonResponse({ expenseTypes: [{ _id: '1123456789abcdef01234567', name: 'rent' }, { _id: '2123456789abcdef01234567', name: 'groceries' }] });
    }

    if (path.includes('/goal/budget')) {
      return jsonResponse({ goals: goals.filter((goal) => goal.type === 'saving' || goal.type === 'budget') });
    }

    if (path === '/goal' && method === 'GET') return jsonResponse({ goals });
    if (path === '/goal' && method === 'POST') { const goal = { _id: `e${String(goals.length).padStart(23, '0')}`, ...body }; goals.push(goal); return jsonResponse({ goal }, 201); }
    if (path.startsWith('/goal/') && method === 'PUT') { const goal = goals.find((item) => item._id === path.split('/').at(-1)); if (goal) Object.assign(goal, body); return jsonResponse({ goal: goal ?? body }); }
    if (path.startsWith('/goal/') && method === 'DELETE') { const index = goals.findIndex((item) => item._id === path.split('/').at(-1)); if (index >= 0) goals.splice(index, 1); return jsonResponse({ message: 'success' }); }

    if (path === '/shopping/categories') return jsonResponse({ categories: [{ _id: '0123456789abcdef01234567', name: 'Mercado' }] });
    if (path === '/shopping/establishments') return jsonResponse({ establishments: [] });
    if (path === '/shopping' && method === 'GET') return jsonResponse({ lists: shoppingLists });
    if (path === '/shopping' && method === 'POST') {
      const list = { _id: `a${String(shoppingLists.length).padStart(23, '0')}`, name: body.name, items: [] };
      shoppingLists.push(list);
      return jsonResponse({ list }, 201);
    }
    if (path.startsWith('/shopping/') && method === 'GET') {
      const list = shoppingLists.find((item) => item._id === path.split('/')[2]);
      return list ? jsonResponse({ list }) : jsonResponse({ message: 'not found' }, 404);
    }
    if (path.startsWith('/shopping/') && path.endsWith('/items') && method === 'POST') {
      const list = shoppingLists.find((item) => item._id === path.split('/')[2]);
      if (!list) return jsonResponse({ message: 'not found' }, 404);
      const item = { _id: `b${String(list.items.length).padStart(23, '0')}`, ...body, totalWithTax: body.quantity * body.unitPrice * (1 + body.taxRate / 100) };
      list.items.push(item);
      return jsonResponse({ list }, 201);
    }
    if (path.startsWith('/shopping/') && path.includes('/items/') && method === 'PUT') {
      const [, , listId, , itemId] = path.split('/');
      const list = shoppingLists.find((item) => item._id === listId);
      const item = list?.items.find((entry) => entry._id === itemId);
      if (!item) return jsonResponse({ message: 'not found' }, 404);
      Object.assign(item, body);
      return jsonResponse({ list });
    }

    if (path === '/tasks' && method === 'GET') return jsonResponse({ tasks });
    if (path === '/tasks' && method === 'POST') {
      const task = { _id: `c${String(tasks.length).padStart(23, '0')}`, ...body };
      tasks.push(task);
      return jsonResponse({ task }, 201);
    }
    if (path.startsWith('/tasks/') && method === 'PATCH') {
      const task = tasks.find((item) => item._id === path.split('/').at(-1));
      if (!task) return jsonResponse({ message: 'not found' }, 404);
      Object.assign(task, body);
      return jsonResponse({ task });
    }

    const serviceResource = path.startsWith('/collection-accounts') ? ['accounts', '/collection-accounts']
      : path.startsWith('/restaurant-plans') ? ['plans', '/restaurant-plans']
        : path.startsWith('/fitness/routines') ? ['routines', '/fitness/routines'] : null;
    if (serviceResource) {
      const [collection, base] = serviceResource;
      const records = serviceRecords[collection];
      if (path === base && method === 'GET') return jsonResponse({ [collection]: records });
      if (path === base && method === 'POST') {
        const entityName = { accounts: 'account', plans: 'plan', routines: 'routine' }[collection];
        const entity = { _id: `d${String(records.length).padStart(23, '0')}`, ...body };
        records.push(entity);
        return jsonResponse({ [entityName]: entity }, 201);
      }
      if (path.startsWith(`${base}/`) && method === 'PATCH') {
        const record = records.find((item) => item._id === path.split('/').at(-1));
        if (!record) return jsonResponse({ message: 'not found' }, 404);
        Object.assign(record, body);
        const entityName = { accounts: 'account', plans: 'plan', routines: 'routine' }[collection];
        return jsonResponse({ [entityName]: record });
      }
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

  return { users, budgets, goals, shoppingLists, tasks, serviceRecords, calls, fail };
}
