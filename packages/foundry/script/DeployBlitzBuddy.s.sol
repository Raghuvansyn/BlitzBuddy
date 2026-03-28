// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DeployHelpers.s.sol";
import "../contracts/BlitzBuddy.sol";

/**
 * @notice Deploy script for BlitzBuddy
 * @dev yarn deploy --file DeployBlitzBuddy.s.sol --network sepolia
 */
contract DeployBlitzBuddy is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        new BlitzBuddy();
    }
}
