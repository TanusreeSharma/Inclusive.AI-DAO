import AppDataSource from '@/database/data-source'
import { initialize } from '@/scripts/initialize'
import { assignProfilePics } from '@/utils'

async function main() {
  await AppDataSource.initialize()

  try {
    await initialize()
    // await assignProfilePics()
  } catch (err) {
    console.log(err)
  } finally {
    process.exit()
  }
}

main()
  .catch((err) => console.log(err))
  .finally(() => {
    process.exit()
  })
