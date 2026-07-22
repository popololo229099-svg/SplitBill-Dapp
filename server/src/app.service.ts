import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as StellarSdk from '@stellar/stellar-sdk';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  private server: StellarSdk.Horizon.Server;
  private networkPassphrase: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.server = new StellarSdk.Horizon.Server(
      this.configService.get(
        'STELLAR_HORIZON_URL',
        'https://horizon-testnet.stellar.org',
      ),
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

  async recordTransaction(data: {
    senderAddress: string;
    recipientAddress: string;
    amount: string;
    txHash?: string;
    status?: string;
  }) {
    return this.prisma.transaction.create({
      data: {
        senderAddress: data.senderAddress,
        recipientAddress: data.recipientAddress,
        amount: data.amount,
        txHash: data.txHash ?? null,
        status: data.status ?? 'pending',
      },
    });
  }

  async getTransactions() {
    return this.prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
