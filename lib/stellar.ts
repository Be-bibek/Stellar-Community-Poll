import { StellarWalletsKit, FreighterModule } from '@creit.tech/stellar-wallets-kit';
import { Networks, TransactionBuilder, Server, Operation } from '@stellar/stellar-sdk';

let kitInstance: any = null;

export function getStellarKit() {
  if (typeof window === 'undefined') return null;
  if (!kitInstance) {
    try {
      kitInstance = StellarWalletsKit.init({
        network: Networks.TESTNET as any,
        modules: [new FreighterModule()],
      });
    } catch (e) {
      console.error('Error initializing StellarWalletsKit:', e);
    }
  }
  return kitInstance;
}

export async function connectStellarWallet(): Promise<string> {
  const kit = getStellarKit();
  if (!kit) {
    throw new Error('Stellar Wallets Kit is not initialized');
  }

  return new Promise((resolve, reject) => {
    try {
      // Use the static class method as explicitly requested by user instructions
      StellarWalletsKit.authModal({
        onConnect: (connection: any) => {
          if (connection && connection.address) {
            resolve(connection.address);
          } else if (typeof connection === 'string') {
            resolve(connection);
          } else {
            reject(new Error('No address returned from Stellar wallet connection'));
          }
        },
        onClose: () => {
          reject(new Error('Wallet connection modal closed'));
        },
      });
    } catch (error) {
      console.error('authModal failed, trying openModal fallback:', error);
      // Fallback to openModal if static authModal is not behaving as expected
      try {
        kit.openModal({
          onConnect: (connection: any) => {
            if (connection && connection.address) {
              resolve(connection.address);
            } else if (typeof connection === 'string') {
              resolve(connection);
            } else {
              reject(new Error('No address returned from Stellar wallet'));
            }
          },
          onClose: () => {
            reject(new Error('Connection modal closed'));
          }
        });
      } catch (fallbackError) {
        reject(fallbackError);
      }
    }
  });
}

export async function fundWithFriendbot(address: string): Promise<boolean> {
  try {
    const response = await fetch(`https://friendbot.stellar.org/?addr=${encodeURIComponent(address)}`);
    return response.ok;
  } catch (e) {
    console.error('Friendbot funding failed:', e);
    return false;
  }
}

export async function buildVoteTransaction(publicKey: string, pollId: string, optionId: string) {
  const server = new Server('https://horizon-testnet.stellar.org');
  
  try {
    // Load account from Horizon testnet
    const account = await server.loadAccount(publicKey);
    
    // Build standard manageData operation transaction
    const transaction = new TransactionBuilder(account, {
      fee: '100', // 100 Stroops
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.manageData({
          name: `vote:${pollId}`.substring(0, 64),
          value: optionId.substring(0, 64),
        })
      )
      .setTimeout(180)
      .build();

    return {
      transaction,
      xdr: transaction.toXDR(),
      isNew: false,
    };
  } catch (error: any) {
    console.warn('Account load failed (probably unfunded):', error);
    if (error?.response?.status === 404) {
      return {
        transaction: null,
        xdr: null,
        isNew: true,
      };
    }
    throw error;
  }
}

export async function submitSignedXDR(signedXdr: string) {
  const server = new Server('https://horizon-testnet.stellar.org');
  try {
    const transaction = TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET);
    const response = await server.submitTransaction(transaction);
    return {
      success: true,
      hash: response.hash,
      ledger: response.ledger,
    };
  } catch (error: any) {
    console.error('Transaction submission failed:', error);
    throw error;
  }
}
