import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSellerIdToProductsTable1700000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE products ADD COLUMN seller_id uuid`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE products DROP COLUMN seller_id`);
    }
}
