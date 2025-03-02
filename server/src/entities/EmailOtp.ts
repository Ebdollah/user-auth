import {
    Entity,
    ObjectIdColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { ObjectId } from 'mongodb';
  
  @Entity('email_otp')
  export class EmailOtp {
    @ObjectIdColumn()
    id?: ObjectId; // MongoDB uses ObjectId
  
    @Column()
    userId!: string; // Store user ID as a string (UUID or ObjectId)
  
    @Column()
    otpCode!: string; // Store OTP as a string (6 characters)
  
    @Column()
    otpToken!: string; // Store OTP token as a string
  
    @CreateDateColumn({ type: 'date' })
    createdAt?: Date;
  
    @UpdateDateColumn({ type: 'date' })
    updatedAt?: Date;
  
    @Column({ type: 'date', nullable: true })
    verifiedAt?: Date | null;
  }
  