import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'
import { RoleEntity } from './role.entity';
import { NewsEntity } from './new.entity';
import { ConversationEntity } from './conversation.entity';
import { StoreEntity } from './store.entity';
import { DeliveryProofEntity } from './delivery_proof.entity';
import { DriverLocationEntity } from './driver_location.entity';
import { OrderStatusHistoryEntity } from './order_status_history.entity';
@Entity('users')
export class UserEntity extends BaseEntity {

    @Column({ type: 'integer', nullable: false })
    role_id: number

    @Column({ type: 'varchar', length: 100, nullable: false })
    username: string

    @Column({ type: 'varchar', length: 100, nullable: false })
    password_hash: string

    @Column({ type: 'varchar', length: 255, nullable: true })
    email: string

    @Column({ type: 'varchar', length: 100, nullable: true })
    full_name: string

    @Column({ type: 'varchar', length: 12, nullable: true })
    phone_number: string

    @Column({ type: 'text', nullable: false })
    address: string

    @Column({ type: 'bytea', nullable: true })
    avatar_image: Buffer

    @Column({ type: 'boolean', nullable: true })
    is_active: boolean

    @ManyToOne(() => RoleEntity, (role) => role.id)
    @JoinColumn({ name: 'role_id' })
    role: RoleEntity;

    @OneToMany(() => NewsEntity, (news) => news.user)
    news: NewsEntity[];

    @OneToMany(() => ConversationEntity, (conversation) => conversation.user)
    conversations: ConversationEntity[];

    @Column({ type: 'integer', nullable: true })
    store_id: number;

    @ManyToOne(() => StoreEntity, (store) => store.users)
    @JoinColumn({ name: 'store_id' })
    store: StoreEntity;


    @OneToMany(() => DeliveryProofEntity, (deliveryProof) => deliveryProof.user)
    deliveryProofs: DeliveryProofEntity[];

    @OneToMany(() => DriverLocationEntity, (driverLocation) => driverLocation.user)
    driverLocations: DriverLocationEntity[];

    @OneToMany(() => OrderStatusHistoryEntity, (orderStatusHistory) => orderStatusHistory.user)
    orderStatusHistories: OrderStatusHistoryEntity[];
}