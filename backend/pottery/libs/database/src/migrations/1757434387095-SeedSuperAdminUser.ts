import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class SeedSuperAdminUser1757434387095 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SET search_path TO public`);

    // 1️⃣ Tạo SUPER_ADMIN role nếu chưa có
    let superAdminRole: any[] = await queryRunner.query(
      `SELECT * FROM public.roles WHERE name = $1 LIMIT 1`,
      ['SUPER_ADMIN']
    );

    if (!Array.isArray(superAdminRole) || superAdminRole.length === 0) {
      await queryRunner.query(
        `INSERT INTO public.roles (name, description, created_at)
         VALUES ($1, $2, NOW())`,
        ['SUPER_ADMIN', 'Super admin with all permissions']
      );

      superAdminRole = await queryRunner.query(
        `SELECT * FROM public.roles WHERE name = $1 LIMIT 1`,
        ['SUPER_ADMIN']
      );
    }

    const roleId = superAdminRole[0]?.id;
    if (!roleId) {
      throw new Error('❌ Role SUPER_ADMIN could not be created or retrieved.');
    }

    // 2️⃣ Gán toàn bộ permissions cho SUPER_ADMIN
    const availablePermissions = [
      'admin/categories',
      'admin/dashboard',
      'admin/importproduct',
      'admin/inventory',
      'admin/news',
      'admin/products',
      'admin/promotions',
      'admin/stores',
      'admin/supplier',
      'admin/vouchers',
      'admin/permissions',
    ];

    for (const permName of availablePermissions) {
      const exists: any[] = await queryRunner.query(
        `SELECT COUNT(*)::int AS count FROM public.permissions WHERE name = $1 AND role_id = $2`,
        [permName, roleId]
      );

      const count = exists?.[0]?.count ?? 0;
      if (count === 0) {
        await queryRunner.query(
          `INSERT INTO public.permissions (role_id, name, description, created_at)
           VALUES ($1, $2, 'SUPER ADMIN FULL ACCESS', NOW())`,
          [roleId, permName]
        );
      }
    }

    // 3️⃣ Tạo store mặc định nếu chưa có (đã sửa 'name' → 'store_name')
    let store: any[] = await queryRunner.query(
      `SELECT * FROM public.stores WHERE store_name = $1 LIMIT 1`,
      ['Default Store']
    );

    if (!Array.isArray(store) || store.length === 0) {
      await queryRunner.query(
        `INSERT INTO public.stores (store_name, address, created_at)
         VALUES ($1, $2, NOW())`,
        ['Default Store', 'Main admin store']
      );
      store = await queryRunner.query(
        `SELECT * FROM public.stores WHERE store_name = $1 LIMIT 1`,
        ['Default Store']
      );
    }

    const storeId = store[0]?.id;
    if (!storeId) {
      throw new Error('❌ Default store could not be created or retrieved.');
    }

    // 4️⃣ Tạo user admin (gắn store_id)
    const username = 'admin';
    const password = '12345';
    const passwordHash = await bcrypt.hash(password, 10);

    const existingUser: any[] = await queryRunner.query(
      `SELECT * FROM public.users WHERE username = $1 LIMIT 1`,
      [username]
    );

    if (!Array.isArray(existingUser) || existingUser.length === 0) {
      await queryRunner.query(
        `INSERT INTO public.users
         (role_id, store_id, username, password_hash, email, full_name, phone_number, address, is_active, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW())`,
        [
          roleId,
          storeId,
          username,
          passwordHash,
          'admin@gmail.com',
          'Super Admin',
          '0123456789',
          'Admin Address',
        ]
      );
    }

    console.log('✅ Seed SUPER_ADMIN role, store, and admin user created successfully.');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SET search_path TO public`);
    await queryRunner.query(`DELETE FROM public.users WHERE username = 'admin'`);

    const role: any[] = await queryRunner.query(
      `SELECT * FROM public.roles WHERE name = $1 LIMIT 1`,
      ['SUPER_ADMIN']
    );

    if (Array.isArray(role) && role.length > 0) {
      const roleId = role[0]?.id;
      await queryRunner.query(`DELETE FROM public.permissions WHERE role_id = $1`, [roleId]);
      await queryRunner.query(`DELETE FROM public.roles WHERE id = $1`, [roleId]);
    }

    // sửa 'name' → 'store_name' trong phần xóa
    await queryRunner.query(`DELETE FROM public.stores WHERE store_name = 'Default Store'`);

    console.log('🧹 SUPER_ADMIN, permissions, and store removed.');
  }
}
