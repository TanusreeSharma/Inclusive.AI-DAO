import { AsyncParser } from '@json2csv/node'
import { exec } from 'child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'

import AppDataSource from '@/database/data-source'
import { selectNewUsers } from '@/utils/select-new-users'

async function selectNewUsersAndExport() {
  await AppDataSource.initialize()

  const users = await selectNewUsers()

  console.log('============================================')
  console.log(`New User Count: ${users.length}`)
  console.log('============================================')

  const gitRootPath = await new Promise<string | Error>((resolve, reject) => {
    exec('git rev-parse --show-toplevel', (err, stdout, stderr) => {
      if (err) {
        reject(err)
      } else {
        resolve(stdout.trim())
      }
    })
  })

  if (gitRootPath instanceof Error) {
    throw gitRootPath
  }

  const dataPath = path.join(gitRootPath, 'server', 'exported-data')
  // const fdChat = await fs.open(path.join(dataPath, 'chats.csv'), 'rw')
  const fileStreamUsers = fs.createWriteStream(path.join(dataPath, 'new-users.csv'))

  const parsedUsers = users.map((user) => ({
    id: user.id,
    address: user.address,
    createdAt: user.createdAt,
    pod: user.pod.slug
  }))

  const parserUsers = new AsyncParser({
    fields: ['id', 'address', 'createdAt', 'pod']
  })
  const pipeUsers = parserUsers.parse(parsedUsers).pipe(fileStreamUsers)

  await new Promise((resolve, reject) => {
    pipeUsers.on('finish', () => resolve(true))
    pipeUsers.on('error', (err) => reject(err))
  })
}

selectNewUsersAndExport()
  .then(() => {
    console.log('Done')
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
