import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddBalanceAfterAndReferenceToWalletLedger1703088000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("wallet_ledger", new TableColumn({
            name: "balanceAfter",
            type: "decimal",
            precision: 12,
            scale: 2,
            isNullable: true,
        }));
        await queryRunner.addColumn("wallet_ledger", new TableColumn({
            name: "reference",
            type: "varchar",
            length: "255",
            isNullable: true,
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("wallet_ledger", "balanceAfter");
        await queryRunner.dropColumn("wallet_ledger", "reference");
    }
}
