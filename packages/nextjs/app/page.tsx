"use client";

import AddProposal from "../components/AddProposal";
import AddSigner from "../components/AddSigner";
import VoteProposal from "../components/VoteProposal";

export default function HomePage() {
  return (
    <div className="container">
      <h1 className={"text-center"}>Управление MultiSigProposal</h1>
      <div className="grid">
        <AddProposal />
        <VoteProposal />
        <AddSigner />
      </div>
    </div>
  );
}
