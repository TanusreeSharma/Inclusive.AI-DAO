import AppDataSource from '@/database/data-source'
import { Pod, User } from '@/database/entity'

export async function staticAssignUserToPod(userOrEmail: User | string) {
  // Assign everyone to the global pod for testing
  const pod = await AppDataSource.getRepository(Pod)
    .createQueryBuilder('pod')
    .where('pod.slug = :slug', { slug: 'quadratic-equal' })
    .getOne()

  if (!pod) return null

  const _user =
    typeof userOrEmail === 'string'
      ? await AppDataSource.getRepository(User).findOne({ where: { id: userOrEmail } })
      : userOrEmail

  console.log(await AppDataSource.getRepository(User).findOne({ where: { id: userOrEmail as string } }))
  console.log(pod, _user, userOrEmail)
  if (!_user) return null
  // Assign user to pod
  _user.pod = pod
  await _user.save()

  return pod
}

export async function dynamicAssignUserToPod() {}
