import { Entity, ObjectIdColumn, Column, Index } from "typeorm";

@Entity()
@Index(["email"], { unique: true }) // Ensure MongoDB enforces unique email
@Index(["username"], { unique: true }) // Ensure unique username
export class User {
    @ObjectIdColumn()
    id!: string;

    @Column()
    username!: string;

    @Column()
    firstName!: string;

    @Column()
    lastName!: string;

    @Column()
    @Index({ unique: true }) // This helps reinforce uniqueness
    email!: string;

    @Column()
    password!: string;
}
