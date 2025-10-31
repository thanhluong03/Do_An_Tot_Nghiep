import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
} from 'typeorm';

@Entity('password_code')
export class PasswordCode {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Column()
    code: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ default: false })
    used: boolean;
}
