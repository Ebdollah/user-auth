import {
    Entity,
    ObjectIdColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { ObjectId } from 'mongodb';
  
  @Entity('user_settings')
  export class UserSettings {
    @ObjectIdColumn()
    id?: ObjectId; // MongoDB uses ObjectId
  
    @Column({ type: 'string' })
    userId!: string; // Store user ID as a string (UUID or ObjectId)
  
    @Column({ type: 'boolean', default: false })
    email2fa?: boolean; // Store boolean instead of tinyint
  
    @Column({ type: 'date', nullable: true })
    skipTimestamp?: Date | null;
  
    @Column()
    skipType?: 'Do Not Ask Again' | 'Remind me after 3 days' | null; // MongoDB does not enforce enums
  
    @CreateDateColumn({ type: 'date' })
    createdAt?: Date;
  
    @UpdateDateColumn({ type: 'date' })
    updatedAt?: Date;
  }
  