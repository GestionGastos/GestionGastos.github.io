import { authHeaders, httpClient } from "../../../shared/infrastructure/httpClient.js";

export async function getGoals(userId, token) {
    const headers = authHeaders(token);

    try {
        return await httpClient('/goal/', {headers});
    } catch(error) {
        if (error.status && error.status !== 404) {
            throw error;
        }
    }
}

export async function getCurrentBudgetGoals(token) {
    const headers = authHeaders(token);

    try {
        return await httpClient(`/goal/budget`, { headers })
    } catch(error) {
        if (error.status && error.status !== 404) {
            throw error;
        }
    }
}

export async function createGoal(token, goal) {
    const headers = authHeaders(token);

    try {
        return await httpClient('/goal/', {
            method: 'POST',
            headers,
            body: JSON.stringify(goal),
        });
    } catch(error) {
        if (error.status && error.status !== 404) {
            throw error;
        }
    }
}

export async function updateGoal(token, goal) {
    const headers = authHeaders(token);

    try {
        return await httpClient(`/goal/${goal._id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(goal)
        });
    } catch(error) {
        if (error.status && error.status !== 404) {
            throw error;
        }
    }
}

export async function deleteGoal(token, goal) {
    try {
        return await httpClient(`/goal/${goal._id}`, { method: 'DELETE', headers: authHeaders(token) });
    } catch (error) {
        if (error.status !== 404) throw error;
        // Current backend exposes PUT but not DELETE; use its validated update route to persist a soft deletion.
        return updateGoal(token, { ...goal, status: 'deleted' });
    }
}

export async function getGoalContributions(token, goalId) {
    const response = await httpClient(`/goal/${goalId}/contributions`, { headers: authHeaders(token) });
    return response?.contributions ?? [];
}

export async function createGoalContribution(token, goalId, { budgetId, amount }) {
    const idempotencyKey = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return httpClient(`/goal/${goalId}/contributions`, {
        method: 'POST',
        headers: { ...authHeaders(token), 'Idempotency-Key': idempotencyKey },
        body: JSON.stringify({ budgetId, amount, idempotencyKey }),
    });
}

export async function refundGoalContribution(token, goalId, contributionId) {
    return httpClient(`/goal/${goalId}/contributions/${contributionId}/refund`, { method: 'POST', headers: authHeaders(token) });
}
