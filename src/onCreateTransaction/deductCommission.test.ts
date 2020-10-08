import { toBTCDigits } from '../utils/toBTCDigits';
import { deductCommission } from './deductCommission';

describe('deductCommission', () => {
  it('works', () => {
    const amount = toBTCDigits(0.00513081);
    const commissionPercentage = 2.5;
    const result = deductCommission(amount, commissionPercentage);
    expect(result.commission).toBeGreaterThan(0); // just be a number
    expect(result.newAmount).toBeGreaterThan(0);
    expect(toBTCDigits(result.commission + result.newAmount)).toEqual(amount); // they should add up again
  });
});
