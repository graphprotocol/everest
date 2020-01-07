// import { BigInt, BigDecimal, Address, log } from '@graphprotocol/graph-ts'

import {
  ApplicationMade,
  MemberExited,
  MemberOwnerChanged,
  DelegateAdded,
  DelegateRevoked,
  MemberOffChainDataEdited,
  CharterUpdated,
  Withdrawal,
  MemberChallenged,
  SubmitVote,
  ChallengeFailed,
  ChallengeSucceeded,
} from '../types/Everest/Everest'

import { Project, User, Category } from '../types/schema'

export function handleApplicationMade(event: ApplicationMade): void {
  // We just get the application time and member
  // DID registry gets changeOwnerSigned()
  //     event DIDOwnerChanged(address indexed identity, address owner, uint256 previousChange);
  // project = new Project(id)
  // project.isChallenged = false
  // project.totalVotes = 0
}

export function handleMemberExited(event: MemberExited): void {
  // TODO: implement this
}

// next
export function handleMemberOwnerChanged(event: MemberOwnerChanged): void {
  // TODO: implement this
}

// next
export function handleDelegateAdded(event: DelegateAdded): void {
  // TODO: implement this
}

export function handleDelegateRevoked(event: DelegateRevoked): void {
  // TODO: implement this
}

// next
export function handleMemberOffChainDataEdited(event: MemberOffChainDataEdited): void {
  // TODO: implement this
}

export function handleCharterUpdated(event: CharterUpdated): void {
  // TODO: implement this
}

export function handleWithdrawal(event: Withdrawal): void {
  // TODO: implement this
}

export function handleMemberChallenged(event: MemberChallenged): void {
  // TODO: implement this
}

export function handleSubmitVote(event: SubmitVote): void {
  // TODO: implement this
}

export function handleChallengeFailed(event: ChallengeFailed): void {
  // TODO: implement this
}

export function handleChallengeSucceeded(event: ChallengeSucceeded): void {
  // TODO: implement this
}
