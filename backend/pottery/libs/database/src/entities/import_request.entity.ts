import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { StoreEntity } from './store.entity';
import { ImportRequestDetailEntity } from './import_request_detail.entity';

export enum importRequestStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
}

@Entity('import_requests')
export class ImportRequestEntity extends BaseEntity {
    @Column({ type: 'integer', nullable: false })
    store_id: number;

    @Column({
        type: 'enum',
        enum: importRequestStatus,
        nullable: true,
    })
    import_request_status: importRequestStatus

    @Column({ type: 'varchar', nullable: true })
    note: string;

    @Column({ type: 'varchar', nullable: true })
    reject_reason: string;

    @ManyToOne(() => StoreEntity, { eager: true })
    @JoinColumn({ name: 'store_id' })
    store: StoreEntity;

    @OneToMany(() => ImportRequestDetailEntity, (importRequestDetail) => importRequestDetail.importRequest)
    importRequestDetails: ImportRequestDetailEntity[];
}
