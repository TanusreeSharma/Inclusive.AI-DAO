import { DataSource } from 'typeorm'

import { envVars } from '@/config'
import * as ent from '@/database/entity'

const AppDataSource = new DataSource({
  type: 'postgres',
  host: envVars.POSTGRES_HOST,
  port: envVars.POSTGRES_PORT,
  username: envVars.POSTGRES_USER,
  password: envVars.POSTGRES_PASSWORD,
  database: envVars.POSTGRES_DB,
  synchronize: true,
  logging: true,
  entities: [ent.AiResponse, ent.Chat, ent.Profile, ent.Survey, ent.User],
  subscribers: [],
  migrations: []
})

export default AppDataSource
