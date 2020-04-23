# Quantstamp Audit Report Response

This document addresses all the issues in the Quantstamp audit report

# Issues
## QSP-1 Upgrading Everest requires data migration (High Risk)
We built Everest so that it could be upgraded this way. For example, challenges and votes get
deleted upon completion in Everest, so we don't need to migrate that data at all. All we really
need is the member data, which is why we put it in the registry. The registry is contains the
only data that we need to keep for an upgrade.

We do plan for an upgrade to happen for V2 that would make the whole entire protocol upgradeable,
likely with proxy contracts.

We will fix the following right now:
- Allowing the deploying of Everest to pass a challengeID to start on, so that we don't overlap
  on challenges.
- Add setters for the three other parameters so that a minor change would not require a full deploy:
  - votingPeriodDuration
  - challengeDeposit
  - applicationFee
- We put in a pause for challenges so that the upgrade process can go smoother. We realized that
  a challenge would get in a stuck state from the migration, if it was existing. This was, we 
  can ensure the data does not get corrupted.

## QSP-2 didAddress is undefined for the mainnet deployment
This was found after the commit hash we gave to Quantstamp to review, so it is already fixed.

## QSP-3 votingPeriodDuration is set to 172800 sec (2 days)
This was found after the commit hash we gave to Quantstamp to review, so it is already fixed.

## QSP-4 Values for charter and categories must be updated for mainnet
This was found after the commit hash we gave to Quantstamp to review, so it is already fixed.

## QSP-5 Centralization of Power
We agree that the current centralization of power should be better documented. For now we will
document it in the README. After we launch Everest and get some user feedback, we may include
this information in the front end as well.

## QSP-6 Block Timestamp Manipulation
We are aware of this and we are okay with this. Everest will have a low amount of DAI relative to
many other contracts on mainnet. To manipulate the block times for this contract would not be
worth it, since the voting period is 2 days, the possible 90 seconds of delay won't make a
difference.

## QSP-7 Unlocked Pragma
We will lock all of them to 0.5.8.

## QSP-8 MockDAI token holder setup should only be done for testnet
This was found after the commit hash we gave to Quantstamp to review, so it is already fixed.

## QSP-9 Clone-and-Own
We will hold out on the recommendations. We understand that using the NPM package could allow for
bug fixes, but it could also introduce bugs, and it allows for external dependencies on contracts
outside of our repository, which opens an attack vector. We understand that both are viable options,
and that we chose the explicit copying of the files as our preference.

## QSP-10 Race Conditions / Front-Running
We understand this race condition, and we are fine with it, since it is a very small reward and it
is only meant to incentivize the state change.

## QSP-11 permit() is given an infinite approval
Unfortunately, permit() is a function on Multi Collateral Dai, and they chose to implement it like
this. We want to use DAI, so we must use it as is. 

We will add external documentation noting this. 

## QSP-12 Challenger still gets challenge reward after exiting
Yes this is fine. But it is a good edge case and a good catch.

## QSP-13 Missing validation on input address parameters
We will implement all of these require statements

# Automated analysis
We will implement what we see necessary here.