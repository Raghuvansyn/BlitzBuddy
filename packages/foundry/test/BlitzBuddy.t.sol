// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/BlitzBuddy.sol";

contract BlitzBuddyTest is Test {
    BlitzBuddy public blitzBuddy;

    function setUp() public {
        blitzBuddy = new BlitzBuddy();
    }

    function testInitialNextRequestId() public view {
        assertEq(blitzBuddy.nextRequestId(), 0);
    }
}
