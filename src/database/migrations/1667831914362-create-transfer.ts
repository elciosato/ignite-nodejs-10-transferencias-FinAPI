import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class createTransfer1667831914362 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns("statements", [
      new TableColumn({
        name: "statement_sender_id",
        type: "uuid",
        isNullable: true,
      }),
      new TableColumn({
        name: "sender_id",
        type: "uuid",
        isNullable: true,
      }),
    ]);
    await queryRunner.createForeignKeys("statements", [
      new TableForeignKey({
        name: "FKStatementSender",
        columnNames: ["statement_sender_id"],
        referencedTableName: "statements",
        referencedColumnNames: ["id"],
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }),
      new TableForeignKey({
        name: "FKSender",
        columnNames: ["sender_id"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }),
    ]);
    await queryRunner.query(
      "alter type statements_type_enum add value 'transfer';"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "alter table statements drop column statement_sender_id"
    );
    await queryRunner.query("alter table statements drop column sender_id");
  }
}
