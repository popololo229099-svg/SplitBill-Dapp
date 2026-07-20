import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as StellarSdk from '@stellar/stellar-sdk';

@Injectable()
export class AppService {
  private server: StellarSdk.Horizon.Server;
  private networkPassphrase: string;

  constructor(private configService: ConfigService) {
    this.server = new StellarSdk.Horizon.Server(
      this.configService.get('STELLAR_HORIZON_URL', 'https://horizon-testnet.stellar.org'),
    );
    this.networkPassphrase = this.configService.get(
      'STELLAR_NETWORK_PASSPHRASE',
      'Test SDF Network ; September 2015',
    );
  }

  getStatus() {
    return { network: 'testnet', status: 'ok' };
  }

  async sendXlm(destination: string, amount: string, secretKey: string) {
    const sourceKeypair = StellarSdk.Keypair.fromSecret(secretKey);
    const sourcePublicKey = sourceKeypair.publicKey();

    const account = await this.server.loadAccount(sourcePublicKey);

    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination,
          asset: StellarSdk.Asset.native(),
          amount,
        }),
      )
      .setTimeout(30)
      .build();

    transaction.sign(sourceKeypair);
    const result = await this.server.submitTransaction(transaction);
    return { hash: result.hash, successful: result.successful };
  }
}
