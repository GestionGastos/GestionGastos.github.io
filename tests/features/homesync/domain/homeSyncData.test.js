import { describe, expect, it } from 'vitest';
import { summarizeChores, summarizeShopping } from '../../../../src/features/homesync/domain/homeSyncData.js';

describe('HomeSync summaries', () => {
  it('calculates item count, selected count, and tax-inclusive shopping totals', () => {
    expect(summarizeShopping([
      { quantity: 2, price: 100, tax: 19, checked: true },
      { quantity: 1, price: 50, tax: 0, checked: false },
    ])).toEqual({ net: 250, tax: 38, items: 2, selected: 1 });
  });

  it('counts chores in each workflow status', () => {
    expect(summarizeChores([{ status: 'pending' }, { status: 'progress' }, { status: 'done' }, { status: 'done' }]))
      .toEqual({ total: 4, pending: 1, progress: 1, done: 2 });
  });
});
