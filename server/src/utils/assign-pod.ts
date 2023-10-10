import AppDataSource from '@/database/data-source'
import { Pod, User } from '@/database/entity'

export async function assignPodStatic() {
  const pod = await Pod.findOne({ where: { slug: 'quadratic-equal' } })
  if (!pod) throw new Error('Pod not found')
  return pod
}

export async function assignPodRoundRobin() {
  const pods = await AppDataSource.getRepository(Pod)
    .createQueryBuilder('pod')
    // Add userCount = len(pod.user) to each pod
    .loadRelationCountAndMap('pod.userCount', 'pod.user')
    .getMany() as (Pod & { userCount: number })[]

  // return pod with the least amount of users
  return pods.reduce((prev, curr) => {
    return prev.userCount < curr.userCount ? prev : curr
  }) as Pod
}

export async function staticAssignUserToPod(user: User) {
  // Assign everyone to the global pod for testing
  try {
    const pod = await Pod.findOne({ where: { slug: 'quadratic-equal' } })
    if (!pod) return null

    // Assign user to pod
    user.pod = pod
    await user.save()

    return pod
  } catch (err) {
    console.log(err)
    return null
  }
}

export async function dynamicAssignUserToPod() {}
