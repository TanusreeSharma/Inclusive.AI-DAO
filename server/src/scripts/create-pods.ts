import AppDataSource from '@/database/data-source'
import { Pod } from '@/database/entity'

export async function createPods(initialize = true) {
  if (initialize) await AppDataSource.initialize()

  try {
    await AppDataSource.getRepository(Pod)
      .createQueryBuilder('pod')
      .insert()
      .values([
        {
          slug: 'quadratic-equal',
          name: 'Quadratic',
          description: 'Quadratic Voting, same amount of token for equal voting power',
          user: [],
          podTeam: [],
          valueQuestion: [],
          isActive: true
        },
        {
          slug: 'quadratic-early',
          name: 'Quadratic',
          description: 'Quadratic Voting, early adopters get more voting power (token)',
          isActive: true
        },
        {
          slug: 'ranked-equal',
          name: 'Ranked',
          description: 'Ranked Voting, same amount of token for equal voting power',
          isActive: true
        },
        {
          slug: 'ranked-early',
          name: 'Ranked',
          description: 'Ranked Voting, early adopters get more voting power (token)',
          isActive: true
        }
      ])
      .orIgnore('slug') // if slug already exists, don't insert it
      .execute()

    console.log('Pods created')
  } catch (err) {
    console.log(err)
  }
}

// if filed is called directly
if (require.main === module) {
  createPods()
    .catch((err) => console.log(err))
    .finally(() => {
      AppDataSource.destroy()
      process.exit()
    })
}
