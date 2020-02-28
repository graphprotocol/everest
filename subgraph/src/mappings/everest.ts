import { BigInt, store, ipfs, json, Bytes, JSONValue, log } from '@graphprotocol/graph-ts'

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

import {
  Project,
  Everest,
  Challenge,
  Vote,
  Charter,
  Category,
  Total,
} from '../types/schema'

import { addQm } from './helpers'

// This runs before any ethereumDIDRegistry events run, and once an applicaiton is made, the
// identity is then part of Everest
export function handleNewMember(event: NewMember): void {
  let id = event.params.member.toHexString()
  let project = new Project(id)
  let total = Total.load('1')
  project.totalVotes = 0
  project.membershipStartTime = event.params.applicationTime.toI32()
  project.createdAt = event.block.timestamp.toI32()
  project.updatedAt = event.block.timestamp.toI32()
  project.save()

  if (total != null) {
    total.projectCount += 1
  } else {
    total = new Total('1')
    total.projectCount = 1
  }
  total.save()

  let everest = Everest.load('1')
  everest.reserveBankBalance = everest.reserveBankBalance.plus(event.params.fee)
  everest.save()
}

export function handleMemberExited(event: MemberExited): void {
  let id = event.params.member.toHexString()
  store.remove('Project', id)
}

export function handleCharterUpdated(event: CharterUpdated): void {
  let everest = Everest.load('1')
  everest.charter = event.params.data.toHexString()
  everest.save()

  parseCharterDetails(event.params.data, event.block.timestamp)
}

export function handleWithdrawal(event: Withdrawal): void {
  let everest = Everest.load('1')
  everest.reserveBankBalance = everest.reserveBankBalance.minus(event.params.amount)
  everest.save()
}

export function handleEverestDeployed(event: EverestDeployed): void {
  let everest = new Everest('1')
  everest.owner = event.params.owner
  everest.approvedToken = event.params.approvedToken
  everest.votingPeriodDuration = event.params.votingPeriodDuration.toI32()
  everest.challengeDeposit = event.params.challengeDeposit
  everest.applicationFee = event.params.applicationFee
  everest.reserveBankAddress = event.params.reserveBank
  everest.reserveBankBalance = BigInt.fromI32(0)
  everest.charter = event.params.charter.toHexString()
  everest.createdAt = event.block.timestamp.toI32()
  everest.save()

  parseCharterDetails(event.params.charter, event.block.timestamp)
}

export function handleMemberChallenged(event: MemberChallenged): void {
  let id = event.params.challengeID.toString()
  let challenge = new Challenge(id)
  challenge.endTime = event.params.challengeEndTime.toI32()
  challenge.votesFor = 0 // Don't need to record one here, since a SubmitVote event will be emitted
  challenge.votesAgainst = 0
  challenge.project = event.params.member.toHexString()
  challenge.owner = event.params.challenger
  challenge.createdAt = event.block.timestamp.toI32()
  challenge.resolved = false

  let hexHash = addQm(event.params.details) as Bytes
  let base58Hash = hexHash.toBase58()
  challenge.ipfsHash = base58Hash
  let ipfsData = ipfs.cat(base58Hash)
  if (ipfsData != null) {
    let data = json.fromBytes(ipfsData as Bytes).toObject()
    challenge.description = data.get('description').isNull()
      ? null
      : data.get('description').toString()
  }
  challenge.ipfsHash = base58Hash
  challenge.save()

  let project = Project.load(event.params.member.toHexString())
  project.currentChallenge = event.params.challengeID.toString()
  project.updatedAt = event.block.timestamp.toI32()
  project.save()

  let everest = Everest.load('1')
  everest.reserveBankBalance = everest.reserveBankBalance.plus(everest.challengeDeposit)
  everest.save()
}

// event.params.submitter is not in use, it represents a delegate vote
export function handleSubmitVote(event: SubmitVote): void {
  let id = event.params.challengeID
    .toString()
    .concat('-')
    .concat(event.params.memberOwner.toHexString())
  let vote = new Vote(id)
  let voteChoice = getVoteChoice(event.params.voteChoice)
  vote.choice = voteChoice
  vote.weight = event.params.voteWeight.toI32()
  vote.challenge = event.params.challengeID.toString()
  vote.voter = event.params.memberOwner.toHexString()
  vote.createdAt = event.block.timestamp.toI32()
  vote.save()

  let challenge = Challenge.load(event.params.challengeID.toString())
  if (voteChoice == 'Yes') {
    challenge.votesFor = challenge.votesFor + vote.weight
  } else if (voteChoice == 'No') {
    challenge.votesAgainst = challenge.votesAgainst + vote.weight
  }

  challenge.save()
}

// Note a failed challenge means the Project gets to stay on the list
export function handleChallengeFailed(event: ChallengeFailed): void {
  let everest = Everest.load('1')
  everest.reserveBankBalance = everest.reserveBankBalance.minus(everest.challengeDeposit)
  everest.save()

  let challenge = Challenge.load(event.params.challengeID.toString())
  challenge.resolved = true
  challenge.save()

  let project = Project.load(event.params.member.toHexString())
  let pastChallenges = project.pastChallenges
  pastChallenges.push(project.currentChallenge)
  project.pastChallenges = pastChallenges
  project.updatedAt = event.block.timestamp.toI32()
  project.currentChallenge = null
  project.save()
}

// Note a successful challenge means the project is removed from the list
export function handleChallengeSucceeded(event: ChallengeSucceeded): void {
  let everest = Everest.load('1')
  everest.reserveBankBalance = everest.reserveBankBalance.minus(everest.challengeDeposit)
  everest.save()

  let challenge = Challenge.load(event.params.challengeID.toString())
  challenge.resolved = true
  challenge.save()

  store.remove('Project', event.params.member.toHexString())
}

function getVoteChoice(voteChoice: number): string {
  let value = 'Null'
  if (voteChoice == 1) {
    value = 'Yes'
  } else if (voteChoice == 2) {
    value = 'No'
  }
  return value
}

function parseCharterDetails(ipfsHash: Bytes, timestamp: BigInt): void {
  let charter = Charter.load(ipfsHash.toHexString())
  if (charter == null) {
    charter = new Charter(ipfsHash.toHexString())
  }
  let hexHash = addQm(ipfsHash) as Bytes
  let base58Hash = hexHash.toBase58()
  let ipfsData = ipfs.cat(base58Hash)

  if (ipfsData != null) {
    let data = json.fromBytes(ipfsData as Bytes).toObject()
    charter.charterDescription = data.get('charterDescription').isNull()
      ? null
      : data.get('charterDescription').toString()
    charter.name = data.get('name').isNull() ? null : data.get('name').toString()
    charter.description = data.get('description').isNull()
      ? null
      : data.get('description').toString()
    charter.website = data.get('website').isNull() ? null : data.get('website').toString()
    charter.twitter = data.get('twitter').isNull() ? null : data.get('twitter').toString()
    charter.avatar = data.get('avatar').isNull() ? null : data.get('avatar').toString()
    charter.image = data.get('image').isNull() ? null : data.get('image').toString()
    charter.categories = data.get('categories').isNull()
      ? null
      : data.get('categories').toString()
    charter.isRepresentative = data.get('isRepresentative').isNull()
      ? null
      : data.get('isRepresentative').toString()

    let categories = data.get('bootstrap-categories')
    let parsedArray: Array<string>
    if (categories != null) {
      let categoriesArray = categories.toArray()
      for (let i = 0; i < categoriesArray.length; i++) {
        createCategory(categoriesArray[i], timestamp)
      }
    }
  }

  charter.createdAt = timestamp.toI32()
  charter.save()
}

function createCategory(categoryJSON: JSONValue, timestamp: BigInt): void {
  let categoryData = categoryJSON.toObject()
  let slug: string = categoryData.get('slug').isNull()
    ? null
    : categoryData.get('slug').toString()

  let category = Category.load(slug)
  if (category == null) {
    category = new Category(slug)
    category.name = categoryData.get('name').isNull()
      ? null
      : categoryData.get('name').toString()
    category.description = categoryData.get('description').isNull()
      ? null
      : categoryData.get('description').toString()
    category.createdAt = timestamp.toI32()

    let subcategories = categoryData.get('subcategories')
    if (subcategories != null) {
      let subCategoriesArray = subcategories.toArray()
      for (let i = 0; i < subCategoriesArray.length; i++) {
        let subCategoryData = subCategoriesArray[i].toObject()
        let subSlug: string = subCategoryData.get('slug').isNull()
          ? null
          : subCategoryData.get('slug').toString()

        let subCategory = Category.load(subSlug)
        if (subCategory == null) {
          subCategory = new Category(subSlug)
          subCategory.name = subCategoryData.get('name').isNull()
            ? null
            : subCategoryData.get('name').toString()
          subCategory.description = subCategoryData.get('description').isNull()
            ? null
            : subCategoryData.get('description').toString()
          subCategory.createdAt = timestamp.toI32()
          subCategory.parentCategory = slug
          subCategory.save()
        }
      }
    }
    category.save()
  }
}
