/*
 * This script allows us to migration contract upgrades
 * Right now in V1 everest, we keep the Registry to be the persistent storage, while all other
 * contracts are upgradeble. We do this by allows the Registry to be owned.
 *
 * In Order to Upgrade the contracts, the following steps must be taken.
 * 1. Deploy a new Reserve Bank, owned by the new OWNER
 * 2. Deploy a new Everest, owned by the new OWNER
 * 3. Change the new Reserve Bank to be owned by the new Everest. This is done by calling
 *    everest.transferOwnershipReserveBank()
 * 4. Change the ownership of the Registry to be the new Everest. This is done by calling
 *    everest.transferOwnershipRegistry()
 * 5. Withdraw the funds from the old Everest, and send them to the new Everest.
 *
 * Note on the upgrade of the contracts
 *  - ChallengeIDs should start at the new uint from the previous everest. This should
 *    be read directly from the contract so no mistakes are made
 *  - If the application fee is changed, the reserve could be underfunded. Pay attention to
 *    this, and if necessary, top up the Reserve Bank with funds
 *  - Once ownership of the Registry is changed, no members can be registered through V1,
 *    since all changes to Registry require ownership to do so, so it effectively stops the
 *    V1 code from being able to sign up new members.
 *  - No members can exit because of ownership
 *  - No member can challenge because it tries to editChallengeID()
 *  - Submiting votes would work on existing challenges
 *  - resolving challenges would not work since it tried deleteMember() and editChallengeID()
 *  - IN SUMMARY - nothing works except voting on challenges that exist. It means a challenge
 *    that is currently in existence, is nullfied. It should no longer be displayed in the
 *    front end. The users who started the challenges should be manually refunded
 */
