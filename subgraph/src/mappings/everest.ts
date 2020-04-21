/* Note:
 * There are some small differences in the abis of everest_old and everest, but not of them
 * effect how the mappings need to work, so they are the exact same for both contracts
 */

import { BigInt, store, ipfs, json, Bytes, Address } from '@graphprotocol/graph-ts'

import {
  NewMember,
  MemberExited,
  EverestDeployed,
  CharterUpdated,
  Withdrawal,
  MemberChallenged,
  SubmitVote,
  ChallengeFailed,
  ChallengeSucceeded,
} from '../types/Everest/Everest'

import { Dai } from '../types/Everest/Dai'

import { Project, Everest, Challenge, Vote, User } from '../types/schema'

import {
  addQm,
  spliceProjectFromCategories,
  getVoteChoice,
  parseCategoryDetails,
} from './helpers'

// This runs before any ethereumDIDRegistry events run, and once an applicaiton is made, the
// identity is then part of Everest
export function handleNewMember(event: NewMember): void {
  let id = event.params.member.toHexString()
  let project = new Project(id)
  project.totalVotes = 0
  project.membershipStartTime = event.params.startTime.toI32()
  project.createdAt = event.block.timestamp.toI32()
  project.updatedAt = event.block.timestamp.toI32()
  project.isRepresentative = false
  project.categories = []
  project.save()

  let everest = Everest.load('1')
  let dai = Dai.bind(everest.approvedToken as Address)
  everest.reserveBankBalance = dai.balanceOf(everest.reserveBankAddress as Address)
  everest.projectCount = everest.projectCount + 1
  everest.save()
}

export function handleMemberExited(event: MemberExited): void {
  let id = event.params.member.toHexString()
  let project = Project.load(id)
  spliceProjectFromCategories(project.categories, id)
  store.remove('Project', id)

  let everest = Everest.load('1')
  everest.projectCount = everest.projectCount - 1
  everest.save()
}

export function handleCategoriesUpdated(event: CharterUpdated): void {
  let everest = Everest.load('1')
  everest.categories = event.params.data
  everest.save()

  parseCategoryDetails(event.params.data, event.block.timestamp)
}

export function handleCharterUpdated(event: CharterUpdated): void {
  let everest = Everest.load('1')
  everest.charter = event.params.data
  everest.save()
}

export function handleWithdrawal(event: Withdrawal): void {
  let everest = Everest.load('1')
  let dai = Dai.bind(everest.approvedToken as Address)
  everest.reserveBankBalance = dai.balanceOf(everest.reserveBankAddress as Address)
  everest.save()
}

export function handleEverestDeployed(event: EverestDeployed): void {
  let everest = Everest.load('1')
  if (everest == null) {
    everest = new Everest('1')
    everest.reserveBankBalance = BigInt.fromI32(0)
    everest.projectCount = 0
    everest.claimedProjects = 0

    everest.createdAt = event.block.timestamp.toI32()
  }
  everest.owner = event.params.owner
  everest.approvedToken = event.params.approvedToken
  everest.votingPeriodDuration = event.params.votingPeriodDuration.toI32()
  everest.challengeDeposit = event.params.challengeDeposit
  everest.applicationFee = event.params.applicationFee
  everest.everestAddress = event.address
  everest.reserveBankAddress = event.params.reserveBank
  everest.charter = event.params.charter
  everest.categories = event.params.categories
  everest.challengedProjects = 0 // need to reset since no challenges are copied over at the moment
  everest.categoriesCount = 0 // need to reset for new categories getting updated
  everest.save()

  parseCategoryDetails(event.params.categories, event.block.timestamp)
}

export function handleMemberChallenged(event: MemberChallenged): void {
  let id = event.params.challengeID.toString()
  let challenge = new Challenge(id)
  challenge.endTime = event.params.challengeEndTime.toI32()
  challenge.keepVotes = 0 // Don't need to record a vote here, since a SubmitVote event will be emitted
  challenge.removeVotes = 0
  challenge.project = event.params.member.toHexString()
  challenge.owner = event.params.challenger.toHexString()
  challenge.createdAt = event.block.timestamp.toI32()
  challenge.resolved = false

  let hexHash = addQm(event.params.details) as Bytes
  let base58Hash = hexHash.toBase58()
  challenge.ipfsHash = base58Hash
  let ipfsData = ipfs.cat(base58Hash)
  if (ipfsData != null) {
    let data = json.fromBytes(ipfsData as Bytes).toObject()
    let details = data.get('details')
    if (details != null) {
      let descriptionObj = details.toObject()
      challenge.description = descriptionObj.get('description').isNull()
        ? null
        : descriptionObj.get('description').toString()
    }
  }
  challenge.ipfsHash = base58Hash
  challenge.save()

  let challengedProject = Project.load(event.params.member.toHexString())
  challengedProject.currentChallenge = id
  challengedProject.updatedAt = event.block.timestamp.toI32()
  challengedProject.save()

  let challengerProject = Project.load(event.params.challenger.toHexString())
  let previousChallenges = challengerProject.createdChallenges
  if (previousChallenges == null) {
    previousChallenges = []
  }
  previousChallenges.push(id)
  challengerProject.createdChallenges = previousChallenges
  challengerProject.updatedAt = event.block.timestamp.toI32()
  challengerProject.save()

  let everest = Everest.load('1')
  let dai = Dai.bind(everest.approvedToken as Address)
  everest.reserveBankBalance = dai.balanceOf(everest.reserveBankAddress as Address)
  everest.challengedProjects = everest.challengedProjects + 1
  everest.save()

  let user = User.load(event.params.challenger.toHexString())
  if (user == null) {
    user = new User(event.params.challenger.toHexString())
    user.createdAt = event.block.timestamp.toI32()
  }
  user.save()
}

// event.params.submitter is not in use, it represents a delegate vote
export function handleSubmitVote(event: SubmitVote): void {
  let id = event.params.challengeID
    .toString()
    .concat('-')
    .concat(event.params.votingMember.toHexString())
  let vote = new Vote(id)
  let voteChoice = getVoteChoice(event.params.voteChoice)
  vote.choice = voteChoice
  vote.weight = event.params.voteWeight.toI32()
  vote.challenge = event.params.challengeID.toString()
  vote.voter = event.params.votingMember.toHexString()
  vote.createdAt = event.block.timestamp.toI32()
  vote.save()

  let challenge = Challenge.load(event.params.challengeID.toString())
  if (voteChoice == 'Yes') {
    challenge.removeVotes = challenge.removeVotes + vote.weight
  } else if (voteChoice == 'No') {
    challenge.keepVotes = challenge.keepVotes + vote.weight
  }

  challenge.save()
}

// Note a failed challenge means the Project gets to stay on the list
export function handleChallengeFailed(event: ChallengeFailed): void {
  let everest = Everest.load('1')
  let dai = Dai.bind(everest.approvedToken as Address)
  everest.reserveBankBalance = dai.balanceOf(everest.reserveBankAddress as Address)
  everest.challengedProjects = everest.challengedProjects - 1
  everest.save()

  let challenge = Challenge.load(event.params.challengeID.toString())
  challenge.resolved = true
  challenge.save()

  let project = Project.load(event.params.member.toHexString())
  let pastChallenges = project.pastChallenges
  if (pastChallenges == null) {
    pastChallenges = []
  }
  pastChallenges.push(event.params.challengeID.toString())
  project.pastChallenges = pastChallenges
  project.updatedAt = event.block.timestamp.toI32()
  project.currentChallenge = null
  project.save()
}

// Note a successful challenge means the project is removed from the list
export function handleChallengeSucceeded(event: ChallengeSucceeded): void {
  let everest = Everest.load('1')
  let dai = Dai.bind(everest.approvedToken as Address)
  everest.reserveBankBalance = dai.balanceOf(everest.reserveBankAddress as Address)
  everest.projectCount = everest.projectCount - 1
  everest.challengedProjects = everest.challengedProjects - 1
  everest.save()

  let challenge = Challenge.load(event.params.challengeID.toString())
  challenge.resolved = true
  challenge.save()

  let id = event.params.member.toHexString()
  let project = Project.load(id)
  spliceProjectFromCategories(project.categories, id)
  store.remove('Project', id)
}
