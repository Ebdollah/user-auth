import { Entity, ObjectIdColumn, Column } from "typeorm";

@Entity()
export class AccessToken {
  @ObjectIdColumn()
  id!: string;

  @Column()
  userId!: string;

  @Column()
  jwt!: string;
}
