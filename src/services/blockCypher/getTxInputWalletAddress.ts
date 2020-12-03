import Axios from 'axios';
import { blockCypherEndpoints } from '.';
import { BlockCypherTransactionData } from './model';

export const getTxInputWalletAddress = async (
  txId: string,
): Promise<string> => {
  const { data } = await Axios.get<BlockCypherTransactionData>(
    `${blockCypherEndpoints.transactions}/${txId}`,
  );
  const walletAddress = data.inputs[0].addresses[0]; // CTO: could there be more than one address?

  return walletAddress;
};
