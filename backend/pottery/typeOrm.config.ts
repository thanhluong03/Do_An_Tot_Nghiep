import { DataSource } from 'typeorm'
import { config } from 'dotenv'
config()
const typeOrmConfig = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logging: true,
  migrations: ['libs/database/src/migrations/*.ts'],
  entities: ['libs/database/src/entities/*.ts'],
})

export default typeOrmConfig
