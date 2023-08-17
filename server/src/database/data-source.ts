import { DataSource } from 'typeorm'

import { envVars } from '@/config'
import * as ents from '@/database/entity'

const AppDataSource = new DataSource({
  type: 'postgres',
  url: envVars.POSTGRES_URL,
  host: envVars.POSTGRES_HOST,
  // port: envVars.POSTGRES_PORT,
  username: envVars.POSTGRES_USER,
  password: envVars.POSTGRES_PASSWORD,
  database: envVars.POSTGRES_DB,
  synchronize: true,
  logging: true,
  // 'src/database/entity/index.ts' or 'src/database/entity/*.ts'
  entities: [
    ents.AiResponse,
    ents.Chat,
    ents.Pod,
    ents.PodTeam,
    ents.Profile,
    ents.Survey,
    ents.User,
    ents.ValueQuestion,
  ],
  subscribers: [],
  migrations: []
})

export default AppDataSource
