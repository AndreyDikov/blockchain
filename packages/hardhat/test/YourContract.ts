import { expect } from "chai";
import { ethers } from "hardhat";
import { MultiSigProposal } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("MultiSigProposal", function () {
  let contract: MultiSigProposal,
    owner: HardhatEthersSigner,
    signer1: HardhatEthersSigner,
    signer2: HardhatEthersSigner,
    signer3: HardhatEthersSigner,
    nonSigner: HardhatEthersSigner;
  const requiredSignatures = 2;

  beforeEach(async function () {
    // Разворачиваем контракт
    [owner, signer1, signer2, signer3, nonSigner] = await ethers.getSigners();
    const MultiSigProposal = await ethers.getContractFactory("MultiSigProposal");
    contract = await MultiSigProposal.deploy(requiredSignatures);
    await contract.waitForDeployment();
  });

  describe("Инициализация контракта", function () {
    it("Контракт инициализируется с правильным владельцем и минимальными подписями", async function () {
      expect(await contract.owner()).to.equal(owner.address);
      expect(await contract.requiredSignatures()).to.equal(requiredSignatures);
    });
  });

  describe("Добавление и удаление подписантов", function () {
    it("Владелец может добавить подписанта", async function () {
      await contract.addSigner(signer1.address);
      expect(await contract.signers(signer1.address)).to.equal(true);
    });

    it("Не владелец не может добавить подписанта", async function () {
      await expect(contract.connect(nonSigner).addSigner(signer1.address)).to.be.revertedWith("Not owner");
    });

    it("Владелец может удалить подписанта", async function () {
      await contract.addSigner(signer1.address);
      await contract.removeSigner(signer1.address);
      expect(await contract.signers(signer1.address)).to.equal(false);
    });
  });

  describe("Добавление предложений", function () {
    it("Любой пользователь может добавить предложение", async function () {
      await contract.connect(nonSigner).addProposal("Test Proposal");
      const proposal = await contract.proposals(0);
      expect(proposal.description).to.equal("Test Proposal");
      expect(proposal.executed).to.equal(false);
    });

    it("Количество предложений увеличивается после добавления", async function () {
      await contract.addProposal("Proposal 1");
      await contract.addProposal("Proposal 2");
      expect(await contract.proposalCount()).to.equal(2);
    });
  });

  describe("Голосование за предложения", function () {
    beforeEach(async function () {
      await contract.addSigner(signer1.address);
      await contract.addSigner(signer2.address);
      await contract.addSigner(signer3.address);
      await contract.addProposal("Test Proposal");
    });

    it("Подписант может проголосовать за предложение", async function () {
      await contract.connect(signer1).vote(0);
      const proposal = await contract.proposals(0);
      expect(proposal.votes).to.equal(1);
    });

    it("Не подписант не может проголосовать", async function () {
      await expect(contract.connect(nonSigner).vote(0)).to.be.revertedWith("Not a signer");
    });

    it("Подписант не может проголосовать дважды", async function () {
      await contract.connect(signer1).vote(0);
      await expect(contract.connect(signer1).vote(0)).to.be.revertedWith("Already voted");
    });

    it("Предложение выполняется при достижении минимального порога голосов", async function () {
      await contract.connect(signer1).vote(0);
      await contract.connect(signer2).vote(0);
      const proposal = await contract.proposals(0);
      expect(proposal.executed).to.equal(true);
    });

    it("Голосование за уже выполненное предложение невозможно", async function () {
      await contract.connect(signer1).vote(0);
      await contract.connect(signer2).vote(0);
      await expect(contract.connect(signer3).vote(0)).to.be.revertedWith("Proposal already executed");
    });
  });

  describe("События", function () {
    it("Генерируется событие ProposalAdded при добавлении предложения", async function () {
      await expect(contract.addProposal("Proposal with Event"))
        .to.emit(contract, "ProposalAdded")
        .withArgs(0, "Proposal with Event");
    });

    it("Генерируется событие Voted при голосовании", async function () {
      await contract.addSigner(signer1.address);
      await contract.addProposal("Proposal with Vote Event");
      await expect(contract.connect(signer1).vote(0)).to.emit(contract, "Voted").withArgs(0, signer1.address);
    });

    it("Генерируется событие ProposalExecuted при выполнении предложения", async function () {
      await contract.addSigner(signer1.address);
      await contract.addSigner(signer2.address);
      await contract.addProposal("Proposal with Execution Event");
      await contract.connect(signer1).vote(0);
      await expect(contract.connect(signer2).vote(0)).to.emit(contract, "ProposalExecuted").withArgs(0);
    });
  });
});
