// Node modules
const keccak256 = require('js-sha3').keccak_256
const BN = require('bn.js')
const ethers = require('ethers')

// Local imports
const Everest = artifacts.require('Everest.sol')
const Registry = artifacts.require('Registry.sol')
const EthereumDIDRegistry = artifacts.require('EthereumDIDRegistry.sol')
const Token = artifacts.require('Dai.sol')
const utils = require('./utils.js')

// Note:    Sadly, ganache-cli does not support eth_signTypedDatav3. So we need to manually
//          build and sign data for permit(). In the front end, the code would be much cleaner

const helpers = {
    /// @dev    Helper function to test everest.applySignedWithAttributeAndPermit(). It calls
    ///         many other functions in helpers.js to get the three signatures needed, and
    ///         then submits the transaction to everest
    applySignedWithAttributeAndPermit: async (newMemberWallet, ownerWallet, everest) => {
        const ownerAddress = ownerWallet.signingKey.address
        const newMemberAddress = newMemberWallet.signingKey.address
        // const everest = await Everest.deployed()
        const token = await Token.deployed()
        const registry = await Registry.deployed()

        const setAttributeData =
            Buffer.from('setAttribute').toString('hex') +
            utils.stringToBytes32(utils.offChainDataName) +
            utils.stripHexPrefix(utils.mockIPFSData) +
            utils.maxValidity

        // Get the signature for setting the attribute (i.e. Token data) on ERC-1056
        const setAttributeSignedSig = await module.exports.setAttributeSigned(
            newMemberWallet,
            setAttributeData
        )

        // Get the signature for changing ownership on ERC-1056 Registry
        const applySignedSig = await module.exports.applySigned(newMemberWallet, ownerWallet)
        // Get the signature for permitting Everest to transfer DAI on users behalf
        const permitSig = await module.exports.daiPermit(ownerWallet, everest.address)
        const reserveBankAddress = await everest.reserveBank()
        const reserveBankBalanceStart = await token.balanceOf(reserveBankAddress)
        const ownerBalanceStart = await token.balanceOf(ownerAddress)

        // Send all three meta transactions to Everest to be executed in one tx
        const tx = await everest.applySignedWithAttributeAndPermit(
            newMemberAddress,
            [setAttributeSignedSig.v, applySignedSig.v, permitSig.v],
            [setAttributeSignedSig.r, applySignedSig.r, permitSig.r],
            [setAttributeSignedSig.s, applySignedSig.s, permitSig.s],
            ownerAddress,
            '0x' + utils.stringToBytes32(utils.offChainDataName),
            utils.mockIPFSData,
            '0x' + utils.maxValidity,
            { from: ownerAddress }
        )

        // Tx logs order
        // 1. NewMember
        // 2. Owner changed
        // 3. Permit
        // 4. Transfer
        // 5. Set Attribute

        // Token Checks
        const ownerBalanceEnd = (await token.balanceOf(ownerAddress)).toString()
        const reserveBankBalanceEnd = await token.balanceOf(reserveBankAddress)
        const updatedAllowance = await token.allowance(ownerAddress, everest.address)

        assert.equal(
            ownerBalanceEnd.toString(),
            ownerBalanceStart.sub(utils.applyFeeBN).toString(),
            'Owner did not transfer application fee'
        )
        assert.equal(
            reserveBankBalanceEnd.toString(),
            reserveBankBalanceStart.add(utils.applyFeeBN).toString(),
            'Bank didnt receive application fee'
        )
        assert.equal(
            updatedAllowance.toString(),
            '115792089237316195423570985008687907853269984665640564039457584007913129639935',
            'Allowance was not set to max from owner to Everest'
        )

        // ERC-1056 Checks
        // Check Ownership change
        const didReg = await EthereumDIDRegistry.deployed()
        const identityOwner = await didReg.identityOwner(newMemberAddress)
        assert.equal(ownerAddress, identityOwner, 'Ownership was not transferred')

        // Check set attribute worked
        const setAttributeLogData = tx.receipt.rawLogs[2].data
        const mockDataFromLogs = setAttributeLogData.slice(
            setAttributeLogData.length - 64,
            setAttributeLogData.length
        )
        const ipfsMockDataStripped = utils.stripHexPrefix(utils.mockIPFSData)
        assert.equal(mockDataFromLogs, ipfsMockDataStripped, 'Logs do not include ipfs hash')

        // Everest checks
        const membershipStartTime = Number(
            (await registry.getMemberStartTime(newMemberAddress)).toString()
        )
        assert(membershipStartTime > 0, 'Membership start time not updated')

        console.log(`Member ${newMemberAddress} successfully added`)
    },

    /// @dev    Creates the signature for changeOwner()
    applySigned: async (newMemberWallet, ownerWallet) => {
        const memberAddress = newMemberWallet.signingKey.address
        const memberPrivateKey = Buffer.from(
            utils.stripHexPrefix(newMemberWallet.signingKey.privateKey),
            'hex'
        )
        const ownerAddress = ownerWallet.signingKey.address
        const sig = await module.exports.signDataDIDRegistry(
            memberAddress,
            memberPrivateKey,
            memberAddress,
            Buffer.from('changeOwner').toString('hex') + utils.stripHexPrefix(ownerAddress),
            'changeOwner'
        )
        return sig
    },

    /// @dev    Calls setAttribute on the EthereumDIDRegisty. No signature needed, it is called
    ///         directly by the real owner.
    setAttribute: async (memberAddress, ownerWallet) => {
        const didReg = await EthereumDIDRegistry.deployed()
        const ownerAddress = ownerWallet.signingKey.address
        const tx = await didReg.setAttribute(
            memberAddress,
            '0x' + utils.stringToBytes32(utils.offChainDataName),
            utils.mockIPFSData,
            '0x' + utils.maxValidity,
            { from: ownerAddress }
        )
        const event = tx.logs[0]
        assert.equal(event.event, 'DIDAttributeChanged')
        assert.equal(event.args.identity, memberAddress)
        assert.equal(event.args.name, '0x' + utils.stringToBytes32(utils.offChainDataName))
        assert.equal(event.args.value, utils.mockIPFSData)
    },

    /// @dev Is used in applySignedWithAttribute() to create the signature
    setAttributeSigned: async (newMemberWallet, data) => {
        const memberAddress = newMemberWallet.signingKey.address
        const signerAddress = memberAddress
        const signerPrivateKey = Buffer.from(
            utils.stripHexPrefix(newMemberWallet.signingKey.privateKey),
            'hex'
        )
        const sig = await module.exports.signDataDIDRegistry(
            memberAddress,
            signerPrivateKey,
            signerAddress,
            data,
            'setAttribute'
        )
        return sig
    },

    /// @dev    Returns the signature for either the changeOwner() or the setAttribute() function
    ///         from ethereumDIDRegistry
    signDataDIDRegistry: async (identity, signingKey, signingAddress, data, functionName) => {
        const didReg = await EthereumDIDRegistry.deployed()
        let nonce = await didReg.nonce(signingAddress)
        if (functionName == 'changeOwner') {
            // Add one, because we know this is being called second in the metatx
            nonce = Number(nonce.toString()) + 1
        }
        const paddedNonce = utils.leftPad(Buffer.from([nonce], 64).toString('hex'))
        let dataToSign

        if (functionName == 'changeOwner') {
            dataToSign =
                '1900' +
                utils.stripHexPrefix(didReg.address) +
                paddedNonce +
                utils.stripHexPrefix(identity.toLowerCase()) +
                data
        } else if (functionName == 'setAttribute') {
            dataToSign =
                '1900' +
                utils.stripHexPrefix(didReg.address) +
                paddedNonce +
                utils.stripHexPrefix(identity.toLowerCase()) +
                data
        }
        const hash = Buffer.from(keccak256.buffer(Buffer.from(dataToSign, 'hex')))

        // This is how to sign directly with a private key
        const rawSigner = new ethers.utils.SigningKey(signingKey)
        let splitSig = rawSigner.signDigest(hash)

        return {
            r: splitSig.r,
            s: splitSig.s,
            v: splitSig.v
        }
    },

    /// @dev    Creates the dai domain separator. Note it depends on the choice of the Chain ID
    createDaiDomainSeparator: async () => {
        const domain = keccak256(
            'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'
        )
        const daiName = 'Dai Stablecoin'
        const daiVersion = '1'
        const hashedName = keccak256(daiName)
        const hashedVersion = keccak256(daiVersion)

        // ChainID of uint256 9545 used for development, in bytes32
        const paddedChainID = '0000000000000000000000000000000000000000000000000000000000002549'
        const daiAddress = (await Token.deployed()).address
        const paddedDaiAddress = utils.leftPad(utils.stripHexPrefix(daiAddress))
        const data = domain + hashedName + hashedVersion + paddedChainID + paddedDaiAddress
        const hash = Buffer.from(keccak256.buffer(Buffer.from(data, 'hex')))
        return hash
    },

    /// @dev Creates the permit() signature
    signPermit: async (holderAddress, spenderAddress, holderPrivateKey, nonce) => {
        const paddedNonce = utils.leftPad(Buffer.from([nonce], 64).toString('hex'))
        // We set expiry to 0 always, as that will be default for the Everest calling
        const paddedExpiry = utils.leftPad(Buffer.from([0], 64).toString('hex'))
        // We set to 1 == true, as that will be default for the Everest calling
        const paddedTrue = utils.leftPad(Buffer.from([1], 64).toString('hex'))

        /*  Expected DAI_DOMAIN_SEPARATOR value on first test deploy (dependant on mock dai addr):
            Where mock dai addr = 0xCfEB869F69431e42cdB54A4F4f105C19C080A601 :
            0xcf69a4130104a154c155546e3966369c03a442bdff846f0bc1aae6f9e9a3b68f
        */
        const DAI_DOMAIN_SEPARATOR = await module.exports.createDaiDomainSeparator()

        /*  Expected structEncoded value on first test run (dependant on mock dai address)
            Where mock dai addr = 0xCfEB869F69431e42cdB54A4F4f105C19C080A601
            (note all are concatenated, spaces are for readability)
            Note we do not have 0x at the front of the byte string: 

            ea2aa0a1be11a07ed86d755c93467f4f82362b452371d1ba94d1715123511acb
            000000000000000000000000ffcf8fdee72ac11b5c542428b35eef5769c409f
            000000000000000000000000290fb167208af455bb137780163b7b7a9a10c16
            0000000000000000000000000000000000000000000000000000000000000000
            0000000000000000000000000000000000000000000000000000000000000000
            0000000000000000000000000000000000000000000000000000000000000001 
        */
        const structEncoded =
            utils.DAI_PERMIT_TYPEHASH +
            // abi.encode in solidity automatically removes the checksum, so we must use toLowerCase
            utils.leftPad(utils.stripHexPrefix(holderAddress.toLowerCase())) +
            utils.leftPad(utils.stripHexPrefix(spenderAddress.toLowerCase())) +
            paddedNonce +
            paddedExpiry +
            paddedTrue

        /*  Expected hashedStruct value:
            01b930e8948f5be49f019425c83bcf1657b07efb06fb959192051e9c412abace
        */
        const hashedStruct = Buffer.from(keccak256.buffer(Buffer.from(structEncoded, 'hex')))
        const stringHashedStruct = hashedStruct.toString('hex')
        const stringDomainSeparator = DAI_DOMAIN_SEPARATOR.toString('hex')

        /*  Expected digestData value on first test run (dependant on mock dai address)
            Where mock dai addr = 0xCfEB869F69431e42cdB54A4F4f105C19C080A601
            (note all are concatenated, spaces are for readability)
            Note we do not have 0x at the front of the byte string: 

            1901
            cf69a4130104a154c155546e3966369c03a442bdff846f0bc1aae6f9e9a3b68f
            01b930e8948f5be49f019425c83bcf1657b07efb06fb959192051e9c412abace
        */
        const digestData = '1901' + stringDomainSeparator + stringHashedStruct

        /*  Expected digest value and first test deploy on ganache:
            fc60391b0087e420dc8e15ae01ef93d0814572bbd80b3111248897d3a0d9f941
        */
        const digest = Buffer.from(keccak256.buffer(Buffer.from(digestData, 'hex')))

        const rawSigner = new ethers.utils.SigningKey(holderPrivateKey)
        let splitSig = rawSigner.signDigest(digest)

        return {
            r: splitSig.r,
            s: splitSig.s,
            v: splitSig.v
        }
    },

    /// @dev    Wrapper function around signPermit(). Note: holder == owner and spender == Everest
    daiPermit: async (holderWallet, spenderAddress) => {
        const token = await Token.deployed()
        const holderAddress = holderWallet.signingKey.address
        const nonce = (await token.nonces(holderAddress)).toString()
        const holderPrivateKey = Buffer.from(
            utils.stripHexPrefix(holderWallet.signingKey.privateKey),
            'hex'
        )
        const sig = await module.exports.signPermit(
            holderAddress,
            spenderAddress,
            holderPrivateKey,
            nonce
        )
        return sig
    },

    /// @dev Helper function to challenge a Member, and do checks
    challenge: async (challenger, challengee, details, challengerOwner, everest) => {
        const token = await Token.deployed()
        const reserveBankAddress = await everest.reserveBank()
        const reserveBankBalanceStart = await token.balanceOf(reserveBankAddress)
        const challengerBalanceStart = await token.balanceOf(challengerOwner)

        // Check member exists
        assert(await everest.isMember(challengee), 'Member was not added')

        const tx = await everest.challenge(challenger, challengee, details, {
            from: challengerOwner
        })

        // Check balances
        const reserveBankBalanceAfterChallenge = await token.balanceOf(reserveBankAddress)
        const challengerBalanceAfterChallenge = await token.balanceOf(challengerOwner)
        assert.equal(
            reserveBankBalanceStart.add(utils.challengeDepositBN).toString(),
            reserveBankBalanceAfterChallenge.toString(),
            'Reserve bank did not receive challenge deposit'
        )
        assert.equal(
            challengerBalanceStart.sub(utils.challengeDepositBN).toString(),
            challengerBalanceAfterChallenge.toString(),
            'Challenger did not send the deposit'
        )

        // Get challengeID
        const challengeID = tx.logs[0].args.challengeID.toString()
        assert(await everest.memberChallengeExists(challengee), 'Challenge was not created')
        return challengeID
    },

    /// @dev helper function to resolve a challenge, and do checks
    resolveChallenge: async (challengeID, challengerOwner, caller, everest) => {
        const token = await Token.deployed()
        const reserveBankAddress = await everest.reserveBank()
        const reserveBankBalanceAfterChallenge = await token.balanceOf(reserveBankAddress)
        const challengerBalanceAfterChallenge = await token.balanceOf(challengerOwner)
        const callerBalanceAfterChallenge = await token.balanceOf(caller)

        // Increase time so challenge can be resolved
        await utils.increaseTime(utils.votePeriod + 1)
        // We call from caller, to show that anyone can challenge
        const result = await everest.resolveChallenge(challengeID, { from: caller })
        const challengeResult = result.logs[0].event

        // Check balances
        const reserveBankBalanceAfterResolve = await token.balanceOf(reserveBankAddress)
        const callerBalanceAfterResolve = await token.balanceOf(caller)


        if (challengeResult === 'ChallengeSucceeded') {
            const challengerBalanceAfterResolve = await token.balanceOf(challengerOwner)
            assert.equal(
                reserveBankBalanceAfterChallenge
                    .sub(utils.challengeDepositBN.add(utils.applyFeeBN))
                    .toString(),
                reserveBankBalanceAfterResolve.toString(),
                'Reserve bank did not send out challenge deposit and application fee'
            )
            assert.equal(
                challengerBalanceAfterChallenge
                    .add(utils.challengeDepositBN.add(utils.applyFeeBN).sub(utils.challengeRewardBN))
                    .toString(),
                challengerBalanceAfterResolve.toString(),
                'Challenger did not get their deposit and challengees application fee'
            )
        } else if (challengeResult === 'ChallengeFailed') {
            assert.equal(
                reserveBankBalanceAfterChallenge.sub(utils.challengeRewardBN).toString(),
                reserveBankBalanceAfterResolve.toString(),
                'Reserve bank did not send out caller fee'
            )
            assert.equal(
                callerBalanceAfterChallenge.add(utils.challengeRewardBN).toString(),
                callerBalanceAfterResolve.toString(),
                'Caller did not get caller fee'
            )
        }
    }
}

module.exports = helpers
