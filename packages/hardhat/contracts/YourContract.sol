// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract MultiSigProposal {
    address public owner;

    mapping(address => bool) public signers;

    uint public requiredSignatures;

    struct Proposal {
        uint id;
        string description;
        uint votes;
        bool executed;
        mapping(address => bool) hasVoted;
    }

    mapping(uint => Proposal) public proposals;

    uint public proposalCount;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlySigner() {
        require(signers[msg.sender], "Not a signer");
        _;
    }

    event ProposalAdded(uint id, string description);
    event Voted(uint id, address voter);
    event ProposalExecuted(uint id);

    constructor(uint _requiredSignatures) {
        owner = msg.sender;
        requiredSignatures = _requiredSignatures;
    }

    function addSigner(address _signer) external onlyOwner {
        signers[_signer] = true;
    }

    function removeSigner(address _signer) external onlyOwner {
        signers[_signer] = false;
    }

    function addProposal(string memory _description) external {
        Proposal storage newProposal = proposals[proposalCount];
        newProposal.id = proposalCount;
        newProposal.description = _description;
        newProposal.executed = false;
        proposalCount++;

        emit ProposalAdded(newProposal.id, _description);
    }

    function vote(uint _id) external onlySigner {
        Proposal storage proposal = proposals[_id];
        require(bytes(proposal.description).length != 0, "Proposal not found");
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.hasVoted[msg.sender], "Already voted");

        proposal.hasVoted[msg.sender] = true;
        proposal.votes++;

        emit Voted(_id, msg.sender);

        if (proposal.votes >= requiredSignatures) {
            executeProposal(_id);
        }
    }

    function executeProposal(uint _id) internal {
        Proposal storage proposal = proposals[_id];
        require(!proposal.executed, "Proposal already executed");
        require(proposal.votes >= requiredSignatures, "Not enough votes");

        proposal.executed = true;
        emit ProposalExecuted(_id);
    }
}
