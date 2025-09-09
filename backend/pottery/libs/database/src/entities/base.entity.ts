import {
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
  } from 'typeorm'
  
  export abstract class BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number

    // @CreateDateColumn sẽ tự động thêm timestamp khi bản ghi được tạo
    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date

    // @UpdateDateColumn sẽ tự động cập nhật timestamp mỗi khi bản ghi được lưu
    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date

    // @DeleteDateColumn cho phép đánh dấu bản ghi đã xóa mềm (soft delete)
    @DeleteDateColumn({ type: 'timestamptz', nullable: true })
    deleted_at: Date | null
  }
  