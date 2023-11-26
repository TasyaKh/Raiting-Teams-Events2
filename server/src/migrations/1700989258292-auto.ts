import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1700989258292 implements MigrationInterface {
    name = 'Auto1700989258292'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "events" RENAME COLUMN "status" TO "status_id"`);
        await queryRunner.query(`ALTER TABLE "requisition" ADD "comment_leader" character varying`);
        await queryRunner.query(`ALTER TABLE "events" ALTER COLUMN "date_update" SET DEFAULT '"2023-11-26T09:01:03.976Z"'`);
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "status_id"`);
        await queryRunner.query(`ALTER TABLE "events" ADD "status_id" integer`);
        await queryRunner.query(`ALTER TABLE "teams" ALTER COLUMN "linksSocialNetwork" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_19fa01fc1212bbc25d4b1ae5654" UNIQUE ("bitrix_id")`);
        await queryRunner.query(`ALTER TABLE "events" ADD CONSTRAINT "FK_723091d08c3c5415a1999597464" FOREIGN KEY ("status_id") REFERENCES "dictionary"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "events" DROP CONSTRAINT "FK_723091d08c3c5415a1999597464"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_19fa01fc1212bbc25d4b1ae5654"`);
        await queryRunner.query(`ALTER TABLE "teams" ALTER COLUMN "linksSocialNetwork" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "status_id"`);
        await queryRunner.query(`ALTER TABLE "events" ADD "status_id" boolean`);
        await queryRunner.query(`ALTER TABLE "events" ALTER COLUMN "date_update" SET DEFAULT '2023-08-15 11:27:37.414'`);
        await queryRunner.query(`ALTER TABLE "requisition" DROP COLUMN "comment_leader"`);
        await queryRunner.query(`ALTER TABLE "events" RENAME COLUMN "status_id" TO "status"`);
    }

}
