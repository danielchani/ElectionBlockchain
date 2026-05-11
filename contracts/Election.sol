// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Election {
    struct Candidate {
        uint256 id;
        string name;
        string positions;
        uint256 voteCount;
        bool exists;
    }

    struct Voter {
        bool registered;
        bool voted;
        uint256 rewardBalance;
    }

    address public owner;
    uint256 public startTime;
    uint256 public endTime;
    bool public electionConfigured;

    Candidate[] private candidates;
    mapping(bytes32 => Voter) private voters;
    bytes32[] private voterHashes;

    event ElectionWindowUpdated(uint256 startTime, uint256 endTime);
    event CandidateAdded(uint256 indexed candidateId, string name, string positions);
    event VoterRegistered(bytes32 indexed voterHash);
    event VoteCast(bytes32 indexed voterHash, uint256 indexed candidateId);
    event SystemReset();

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can perform this action");
        _;
    }

    modifier electionActive() {
        require(electionConfigured, "Election window is not configured");
        require(block.timestamp >= startTime, "Election has not started yet");
        require(block.timestamp <= endTime, "Election has already ended");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setElectionWindow(uint256 _startTime, uint256 _endTime) external onlyOwner {
        require(_endTime > _startTime, "End time must be after start time");

        startTime = _startTime;
        endTime = _endTime;
        electionConfigured = true;

        emit ElectionWindowUpdated(_startTime, _endTime);
    }

    function addCandidate(
        string calldata name,
        string calldata positions
    ) external onlyOwner returns (uint256) {
        require(bytes(name).length > 0, "Candidate name is required");

        uint256 candidateId = candidates.length;

        candidates.push(
            Candidate({
                id: candidateId,
                name: name,
                positions: positions,
                voteCount: 0,
                exists: true
            })
        );

        emit CandidateAdded(candidateId, name, positions);

        return candidateId;
    }

    function registerVoter(bytes32 voterHash) public onlyOwner {
        require(voterHash != bytes32(0), "Invalid voter hash");

        if (!voters[voterHash].registered) {
            voters[voterHash].registered = true;
            voterHashes.push(voterHash);

            emit VoterRegistered(voterHash);
        }
    }

    function vote(bytes32 voterHash, uint256 candidateId) external onlyOwner electionActive {
        require(voters[voterHash].registered, "Voter is not registered");
        require(!voters[voterHash].voted, "Voter has already voted");
        require(candidateId < candidates.length, "Invalid candidate");
        require(candidates[candidateId].exists, "Candidate does not exist");

        voters[voterHash].voted = true;
        voters[voterHash].rewardBalance += 1;
        candidates[candidateId].voteCount += 1;

        emit VoteCast(voterHash, candidateId);
    }

    function getCandidate(
        uint256 candidateId
    )
        external
        view
        returns (
            uint256 id,
            string memory name,
            string memory positions,
            uint256 voteCount,
            bool exists
        )
    {
        require(candidateId < candidates.length, "Invalid candidate");

        Candidate memory candidate = candidates[candidateId];

        return (
            candidate.id,
            candidate.name,
            candidate.positions,
            candidate.voteCount,
            candidate.exists
        );
    }

    function getCandidates() external view returns (Candidate[] memory) {
        return candidates;
    }

    function getCandidateCount() external view returns (uint256) {
        return candidates.length;
    }

    function getVoter(
        bytes32 voterHash
    ) external view returns (bool registered, bool voted, uint256 rewardBalance) {
        Voter memory voter = voters[voterHash];

        return (voter.registered, voter.voted, voter.rewardBalance);
    }

    function getElectionInfo()
        external
        view
        returns (
            uint256 electionStartTime,
            uint256 electionEndTime,
            bool configured,
            uint256 candidateCount
        )
    {
        return (startTime, endTime, electionConfigured, candidates.length);
    }

    function resetElection() external onlyOwner {
        for (uint256 i = 0; i < voterHashes.length; i++) {
            delete voters[voterHashes[i]];
        }

        delete voterHashes;
        delete candidates;

        startTime = 0;
        endTime = 0;
        electionConfigured = false;

        emit SystemReset();
    }
}
