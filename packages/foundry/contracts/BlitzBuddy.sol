// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

abstract contract BlitzBuddy is ReentrancyGuard {
    enum RequestStatus {
        Open,
        Accepted,
        Completed,
        Cancelled,
        Expired
    }

    struct HelpRequest {
        uint256 id;
        address requester;
        address helper;
        string title;
        string description;
        string category;
        uint256 bounty;
        uint64 createdAt;
        uint64 expiresAt;
        uint32 durationMinutes;
        RequestStatus status;
    }

    uint256 public nextRequestId;
    mapping(uint256 => HelpRequest) public requests;

    event RequestCreated(
        uint256 indexed id,
        address indexed requester,
        string title,
        uint256 bounty,
        uint64 expiresAt
    );

    event RequestAccepted(uint256 indexed id, address indexed helper);

    event RequestCompleted(uint256 indexed id, address indexed requester, address indexed helper);

    event RequestCancelled(uint256 indexed id, address indexed requester);

    event RequestExpired(uint256 indexed id);

    function createRequest(
        string calldata title,
        string calldata description,
        string calldata category,
        uint256 bounty,
        uint32 durationMinutes,
        uint64 expiresAt
    ) external virtual {}

    function acceptRequest(uint256 id) external virtual {}

    function completeRequest(uint256 id) external virtual {}

    function cancelRequest(uint256 id) external virtual {}

    function expireRequest(uint256 id) external virtual {}

    function getAllRequests() external view virtual returns (HelpRequest[] memory);
}
