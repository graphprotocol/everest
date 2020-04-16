pragma solidity 0.5.8;

import "./lib/Ownable.sol";
import "./lib/SafeMath.sol";
import "./lib/dai.sol";
import "./lib/AddressUtils.sol";

/* Note, in Everest V1, the Reserve Bank is not upgradeable.
 * What will be done is when Everest V2 is deployed, all the tokens
 * stored in the Reserve Bank will be transferred to the new Reserve Bank.
 * The new Reverse Bank is likely to be upgradeable, and have more functionality.
 * However, the ownership of ReserveBank can still be transferred by the Everest owner
 *
 * Also, when the switch over happens from V1 to V2, it is okay the empty the reserve bank right
 * away. This is because all existing challenges will fail on V1, since Everest V1 will no
 * longer be the owner of the Registry, and any challenge will not be able to withdraw
 * from the Reserve Bank.
 */

contract ReserveBank is Ownable {
    using SafeMath for uint256;
    using AddressUtils for address;

    Dai public token;

    constructor(address _daiAddress) public {
        require(_daiAddress.isContract(), "The address should be a contract");
        token = Dai(_daiAddress);
    }

    /**
    @dev                Allow the owner of the contract (Everest) to withdraw the funds.
    @param _receiver    The address receiving the tokens
    @param _amount      The amount being withdrawn
    @return             True if successful
    */
    function withdraw(address _receiver, uint256 _amount)
        external
        onlyOwner
        returns (bool)
    {
        require(_receiver != address(0), "Receiver must not be 0 address");
        return token.transfer(_receiver, _amount);
    }
}
