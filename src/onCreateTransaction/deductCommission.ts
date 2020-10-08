import { toBTCDigits } from '../utils/toBTCDigits';

// returns commission and new amount to 8 decimal places
export const deductCommission = (
  amount: number,
  commissionPercentage: number,
): {
  commission: number;
  newAmount: number;
} => {
  const commission = toBTCDigits((amount * commissionPercentage) / 100);
  const newAmount = toBTCDigits(amount - commission);

  return {
    commission,
    newAmount,
  };
};
