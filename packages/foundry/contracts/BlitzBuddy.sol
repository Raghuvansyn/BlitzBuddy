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

    /// String args use `calldata` (not `memory`) because for external calls calldata is read directly from
    /// the transaction payload—no copy into memory—so it costs less gas and matches how callers send the data.
    function createRequest(
        string calldata title,
        string calldata description,
        string calldata category,
        uint32 durationMinutes,
        uint64 expiresAt
    ) external payable virtual {
        require(msg.value > 0, "Bounty required");
        require(expiresAt > block.timestamp, "Invalid expiry");
        require(bytes(title).length > 0, "Title required");

        uint256 id = nextRequestId;
        requests[id] = HelpRequest({
            id: id,
            requester: msg.sender,
            helper: address(0),
            title: title,
            description: description,
            category: category,
            bounty: msg.value,
            createdAt: uint64(block.timestamp),
            expiresAt: expiresAt,
            durationMinutes: durationMinutes,
            status: RequestStatus.Open
        });

        nextRequestId++;

        emit RequestCreated(id, msg.sender, title, msg.value, expiresAt);
    }

    function acceptRequest(uint256 id) external virtual {}

    function completeRequest(uint256 id) external virtual {}

    function cancelRequest(uint256 id) external virtual {}

    function expireRequest(uint256 id) external virtual {}

    function getAllRequests() external view virtual returns (HelpRequest[] memory);
}
