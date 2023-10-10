import { DataSource, DataSourceOptions } from 'typeorm'

import { envVars } from '@/config'
import * as ents from '@/database/entity'

const hasRedis = ['sea', 'sjc', 'den', 'iad'].includes(envVars.FLY_REGION)

let redisCacheConfig = {}
if (hasRedis) {
  // && envVars.NODE_ENV === 'production'
  const redisUrlRegion = envVars[`REDIS_URL_${envVars.FLY_REGION.toUpperCase()}`]
  // if (redisUrlRegion) {
  //   console.log('redisUrlRegion', redisUrlRegion)
  //   redisCacheConfig = {
  //     cache: {
  //       type: 'ioredis' as 'ioredis',
  //       options: {
  //         url: redisUrlRegion,
  //         legacyMode: true
  //       }
  //     }
  //   }
  // }
  if (redisUrlRegion) {
    // console.log('redisUrlRegion', redisUrlRegion)
    const [auth, host] = redisUrlRegion.split('@')
    const [_, username, password] = auth.split(':')
    const [url, port = '6379'] = host.split(':')
    redisCacheConfig = {
      cache: {
        // type: 'ioredis' as 'ioredis',
        type: 'redis' as 'redis',
        options: {
          // url: redisUrlRegion,
          host: url,
          port,
          username: username ? username.replace('//', '') : '',
          password,
          legacyMode: true
          // family: 6,
        },
        // ignoreErrors: true,
        duration: 600_000 // 600s = 10m
      }
    }
    // console.log(redisCacheConfig)
  }
}

let dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  synchronize: envVars.NODE_ENV !== 'production', // typically unsafe to sync in production
  // synchronize: true,
  logging: false,
  dropSchema: envVars.DROP_SCHEMA === 'true' || envVars.DROP_SCHEMA === true ? true : false,
  // 'src/database/entity/index.ts' or 'src/database/entity/*.ts'
  entities: [ents.AiResponse, ents.Chat, ents.Pod, ents.Profile, ents.Survey, ents.User, ents.ValueQuestion],
  subscribers: [],
  migrations: [],
  // ...redisCacheConfig
  // cache: true
}

// if (envVars.PRIMARY_REGION !== envVars.FLY_REGION) {
//   dataSourceOptions = {
//     ...dataSourceOptions,
//     url: envVars.DATABASE_URL.replace('5432', '5433')
//   }
// } else {
//   dataSourceOptions = {
//     ...dataSourceOptions,
//     url: envVars.DATABASE_URL
//   }
// }

// https://community.fly.io/t/multi-region-database-guide/1600/25?page=2
if (envVars.PRIMARY_REGION !== envVars.FLY_REGION) {
  dataSourceOptions = {
    ...dataSourceOptions,
    replication: {
      master: {
        url: envVars.DATABASE_URL
      },
      slaves: [
        {
          url: envVars.DATABASE_URL.replace('5432', '5433')
        }
      ]
    }
  }
} else {
  dataSourceOptions = {
    ...dataSourceOptions,
    url: envVars.DATABASE_URL
  }
}

console.log('dataSourceOptions', dataSourceOptions)
const AppDataSource = new DataSource(dataSourceOptions)

export default AppDataSource
