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

    event RequestCompleted(uint256 indexed id, address indexed helper, uint256 payout);

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

    function acceptRequest(uint256 requestId) external {
        // `storage` aliases the struct already persisted in `requests`; writes go to state. With `memory`,
        // Solidity would copy the mapping value into memory and updates would only affect that temporary copy.
        HelpRequest storage req = requests[requestId];

        require(req.status == RequestStatus.Open, "Not open");
        require(block.timestamp < req.expiresAt, "Expired");
        require(msg.sender != req.requester, "Cannot accept own request");

        req.helper = msg.sender;
        req.status = RequestStatus.Accepted;

        emit RequestAccepted(requestId, msg.sender);
    }

    function completeRequest(uint256 requestId) external nonReentrant {
        HelpRequest storage req = requests[requestId];

        // 1. CHECKS
        require(msg.sender == req.requester, "Not requester");
        require(req.status == RequestStatus.Accepted, "Not accepted");

        // 2. EFFECTS — update all contract state before any external call (checks-effects-interactions).
        // We clear `req.bounty` and mark `Completed` *before* sending ETH so a malicious helper cannot
        // re-enter (e.g. via `receive`/`fallback`) and observe a state where the bounty is still owed/payable
        // a second time. `nonReentrant` adds another lock, but CEI keeps funds safe if this code is ever
        // refactored or combined with other paths.
        uint256 amount = req.bounty;
        req.status = RequestStatus.Completed;
        req.bounty = 0;

        // 3. INTERACTIONS
        address helper = req.helper;
        (bool success,) = helper.call{ value: amount }("");
        require(success, "Transfer failed");

        emit RequestCompleted(requestId, helper, amount);
    }

    function cancelRequest(uint256 requestId) external nonReentrant {
        HelpRequest storage req = requests[requestId];

        // 1. CHECKS
        require(msg.sender == req.requester, "Not requester");
        require(req.status == RequestStatus.Open, "Not open");

        // 2. EFFECTS — same CEI rationale as `completeRequest`: finalize state before ETH so reentry cannot
        // observe a still-funded Open request or double-refund.
        uint256 amount = req.bounty;
        req.status = RequestStatus.Cancelled;
        req.bounty = 0;

        // 3. INTERACTIONS
        address requester = req.requester;
        (bool success,) = requester.call{ value: amount }("");
        require(success, "Transfer failed");

        emit RequestCancelled(requestId, requester);
    }

    function expireRequest(uint256 requestId) external nonReentrant {
        HelpRequest storage req = requests[requestId];

        // 1. CHECKS — callable by anyone once the listing is past expiry.
        require(req.status == RequestStatus.Open, "Not open");
        require(block.timestamp >= req.expiresAt, "Not expired");

        // 2. EFFECTS
        uint256 amount = req.bounty;
        req.status = RequestStatus.Expired;
        req.bounty = 0;

        // 3. INTERACTIONS
        address requester = req.requester;
        (bool success,) = requester.call{ value: amount }("");
        require(success, "Transfer failed");

        emit RequestExpired(requestId);
    }

    function getAllRequests() external view virtual returns (HelpRequest[] memory);
}
