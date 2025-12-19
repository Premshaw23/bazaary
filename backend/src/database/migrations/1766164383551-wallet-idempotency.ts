import { MigrationInterface, QueryRunner } from "typeorm";

export class WalletIdempotency1766164383551 implements MigrationInterface {
    name = 'WalletIdempotency1766164383551'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_75d800c5223bbea81955509e7d"`);
        await queryRunner.query(`ALTER TABLE "wallet_ledger" ALTER COLUMN "sellerId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "wallet_ledger" DROP COLUMN "reason"`);
        await queryRunner.query(`CREATE TYPE "public"."wallet_ledger_reason_enum" AS ENUM('ORDER_PAID', 'PLATFORM_FEE', 'PAYOUT', 'PAYOUT_REQUEST')`);
        // Step 1: Add as nullable
        await queryRunner.query(`ALTER TABLE "wallet_ledger" ADD "reason" "public"."wallet_ledger_reason_enum"`);
        // Step 2: Backfill existing rows (choose a default, e.g., 'ORDER_PAID')
        await queryRunner.query(`UPDATE "wallet_ledger" SET "reason" = 'ORDER_PAID' WHERE "reason" IS NULL`);
        // Step 3: Set NOT NULL
        await queryRunner.query(`ALTER TABLE "wallet_ledger" ALTER COLUMN "reason" SET NOT NULL`);
                // Step 3.5: Remove duplicates before creating unique index
                await queryRunner.query(`
                    DELETE FROM "wallet_ledger" a
                    USING "wallet_ledger" b
                    WHERE
                        a."orderId" = b."orderId"
                        AND a."reason" = b."reason"
                        AND a.ctid > b.ctid
                `);
        // Step 4: Add unique index
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_d9d2ba99e4e37bf4ab2ecb089f" ON "wallet_ledger" ("orderId", "reason") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_d9d2ba99e4e37bf4ab2ecb089f"`);
        await queryRunner.query(`ALTER TABLE "wallet_ledger" DROP COLUMN "reason"`);
        await queryRunner.query(`DROP TYPE "public"."wallet_ledger_reason_enum"`);
        await queryRunner.query(`ALTER TABLE "wallet_ledger" ADD "reason" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "wallet_ledger" ALTER COLUMN "sellerId" SET NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_75d800c5223bbea81955509e7d" ON "wallet_ledger" ("orderId") `);
    }

}
