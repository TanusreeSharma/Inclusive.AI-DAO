import { ValueQuestion } from '@/database/entity'
import { SnapshotSupportedTypes } from '@/types'
import { getSnapshotProposal } from '@/utils'

export async function assignSnapshotProposal(valueQuestionId: number, proposalId: string) {
  console.log('... assigning snapshot proposal ...')
  console.log(`>>> value question id: ${valueQuestionId}`)
  console.log(`>>> proposal id: ${proposalId}`)

  const question = await ValueQuestion.findOne({
    where: { id: valueQuestionId }
  })

  if (!question) throw new Error(`Value Question not found`)

  const proposal = await getSnapshotProposal(proposalId)
  if (!proposal) throw new Error(`Snapshot Proposal not found`)
  

  question.snapshotId = proposalId
  question.snapshotType = proposal.type as SnapshotSupportedTypes
  question.snapshotSpace = proposal.space.id
  question.snapshotStartDate = new Date(proposal.start * 1000)
  question.snapshotEndDate = new Date(proposal.end * 1000)
  question.snapshotChoices = proposal.choices
  await question.save()

  console.log('proposal', proposal)
  console.log('<<< saved proposal')

  return question
}
