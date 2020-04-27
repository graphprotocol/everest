import React from 'react'

export default [
  {
    heading: '',
    body: (
      <p>
        Everest’s mission is to catalyze the shift to Web3 by organizing all the
        projects working toward this common goal. Decentralization will create
        transparency and opportunity, enabling anyone in the world to contribute
        their talents to a global economy.
        <br />
        <br />
        The Everest Registry will include any organization that believes in the
        goals of decentralization and the spirit of discovering and building
        radically new ways for humans to cooperate and organize. The registry
        uses the ERC-1056 identity standard for interoperability to allow
        project identities to be used across applications.
      </p>
    ),
  },
  {
    heading: 'Project Listing Guidelines',
    body: (
      <p>
        Everest depends on the community's efforts to maintain an accurate and
        useful registry. If a project has inaccurate information or is being
        misrepresented, a registry member should challenge the listing. Members
        are encouraged to vote or delegate their votes to someone who will
        actively participate.
      </p>
    ),
  },
  {
    heading: 'Everest Curation',
    body: (
      <div>
        <p>
          <strong>Adding a Project</strong> Anyone can add a project to Everest
          by paying a 10 DAI listing fee to the Reserve Bank. The listing fees
          are used to pay rewards for successful challenges and to pay for
          development and curation of the list.
          <br />
          <br />
          <strong>Project Owners and Delegates</strong> The creator of the
          listing is the default owner. The owner can edit the project, vote on
          behalf of the project and challenge other projects. Owners can
          transfer ownership at any time.
          <br />
          <br />
          Project owners can delegate their vote to another user, who can vote
          on and create challenges but cannot edit project details or transfer
          ownership. Users can be delegates and owners for multiple projects at
          the same time.
          <br />
          <br />
          <strong>Project Representatives</strong> If you are an employee or
          play a key role in the project, you should claim the project by
          selecting the “Project representative” option when creating the
          listing. If the organization is hierarchical, employees higher in the
          hierarchy take precedence. It’s preferable to have Project
          Representatives maintaining listings over community members to
          increase the authenticity of the data.
          <br />
          <br />
          Owners who are not representatives may see their projects challenged
          and removed. To mitigate the need to forcibly remove projects,
          non-representative owners should transfer ownership to Project
          Representatives upon request.
          <br />
          <br />
          <strong>Challenging Projects</strong> Owners and delegates can
          challenge listings on behalf of their projects if they believe the
          listing is conveying fraudulent or inaccurate information.
          <br />
          <br />
        </p>
        <div>
          Registry listings should only be challenged if there is reasonable
          belief that the project does not belong on the registry because of one
          ore more of the following reasons:
          <ol type="a" style={{ margin: '32px 0 32px 32px' }}>
            <li>
              The project details are inaccurate (eg. outdated information,
              broken links).
            </li>
            <li>The project's categories or sub-categories are inaccurate.</li>
            <li>
              The project is being misrepresented (eg. inaccurate data,
              fraudulent information about the project details or activities).
            </li>
            <li>
              The project is not, in a broad sense, working toward
              decentralization.
            </li>
          </ol>
          A description of the dispute must be included in the challenge to
          ensure that voters have sufficient information about the claim. For
          example: "Website link is incorrect", "Project owner is not a
          representative and refuses to transfer ownership", "Project is in the
          wrong category".
        </div>
      </div>
    ),
  },
  {
    heading: 'Challenge Reward',
    body: (
      <p>
        Anyone can challenge a listing by staking 10 DAI against the dispute. If
        the challenge is successful, the stake is returned and the challenger is
        additionally awarded 9 DAI. If the challenge is unsuccessful, the
        challenger loses their stake and it's added to the Reserve Bank. Once a
        challenge is complete, any user can click to resolve the challenge.
        Performing this action updates the state in the registry. Since this
        consumes gas, resolvers are awarded 1 DAI for resolving a challenge.
        <br />
        <br />
        <strong>Voting Rules</strong> Registry members can vote on active
        challenges to other projects to keep or remove them from the registry.
        Each project has one vote but votes are time-weighted with the square
        root of the length of time the project has been a part of the registry.
        <br />
        <br />
        Project owners or delegates will have up to 2 days after a challenge has
        been initiated to vote on the challenge and they can vote on behalf of
        multiple projects. A challenge is successful if there is at least one
        non-initiating vote and the weight of votes to remove the project
        exceeds the weight of votes to keep the project. If there is a tie vote,
        the challenge is not successful.
        <br />
        <br />
        <strong>Reserve Bank</strong> The Reserve Bank holds the deposits of all
        added projects. Any successful challengers and challenge resolvers are
        also rewarded DAI from the Reserve Bank. The funds accrued in the
        Reserve Bank will be used to support continued development of Everest
        and its ecosystem, to grow the registry’s utility to projects. The Graph
        currently holds the keys to the Reserve Bank.
      </p>
    ),
  },
  {
    heading: 'Community Maintenance',
    body: (
      <p>
        Everest was developed by{' '}
        <a
          href="https://thegraph.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          The Graph
        </a>{' '}
        and{' '}
        <a
          href="https://www.metacartel.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          MetaCartel
        </a>{' '}
        and will be maintained by the community through grants and bounties,
        paid by the Reserve Bank. Community members can contribute by adding and
        claiming projects and submitting pull requests to the Everest{' '}
        <a
          href="https://github.com/graphprotocol/everest"
          target="_blank"
          rel="noopener noreferrer"
        >
          Github repo
        </a>
        .
      </p>
    ),
  },
]
