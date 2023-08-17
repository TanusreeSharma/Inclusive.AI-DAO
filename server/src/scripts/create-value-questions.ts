import AppDataSource from '@/database/data-source'
import { Pod, ValueQuestion } from '@/database/entity'
import { createPods } from '@/scripts/create-pods'

export async function createValueQuestions(initialize = true) {
  if (initialize) await AppDataSource.initialize()

  await createPods(false)

  const pods = await AppDataSource.getRepository(Pod)
    .createQueryBuilder('pod')
    .where('pod.isActive = :isActive', { isActive: true })
    .getMany()
  console.log(pods)

  const podQuadraticEqual = pods.filter((pod) => pod.slug === 'quadratic-equal')[0]
  const podQuadraticEarly = pods.filter((pod) => pod.slug === 'quadratic-early')[0]
  const podRankedEqual = pods.filter((pod) => pod.slug === 'ranked-equal')[0]
  const podRankedEarly = pods.filter((pod) => pod.slug === 'ranked-early')[0]

  //
  // Assign same value question for all pods (question is constant for now)
  //

  const valueTopic = 'Stereotypical Generative AI'
  const valueQuestion = `When generative models create images for underspecified prompts like 'a CEO', 'a doctor', or 'a nurse', they have the potential to produce either diverse or homogeneous outputs. How should AI models balance these possibilities?`
  const valueNote = `You can explore the implications of producing diverse versus homogeneous outputs in generative AI models.`

  const inserts = [podQuadraticEqual, podQuadraticEarly, podRankedEqual, podRankedEarly].map((pod) => ({
    topic: valueTopic,
    question: valueQuestion,
    note: valueNote,
    isActive: true,
    pod
  }))

  const res = await AppDataSource.getRepository(ValueQuestion)
    .createQueryBuilder('valueQuestion')
    .insert()
    .values(inserts)
    // .orIgnore('("question") DO NOTHING') // if question (exactly same) already exists, don't insert it
    .execute()
  console.log(res)

  console.log('Value Questions created')
}

// if filed is called directly
if (require.main === module) {
  createValueQuestions()
    .catch((err) => console.log(err))
    .finally(() => {
      AppDataSource.destroy()
      process.exit()
    })
}
