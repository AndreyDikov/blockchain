import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export default function VoteProposal() {
  const [proposalId, setProposalId] = useState("");

  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "MultiSigProposal",
  });

  const handleVote = async () => {
    if (!proposalId) {
      alert("Введите ID предложения");
      return;
    }

    try {
      await writeContractAsync({
        functionName: "vote",
        args: [BigInt(proposalId)],
      });
      alert("Ваш голос учтен!");
      setProposalId("");
    } catch (error) {
      console.error("Ошибка при голосовании:", error);
    }
  };

  return (
    <div className="card">
      <h2>Проголосовать за предложение</h2>
      <input
        type="number"
        value={proposalId}
        placeholder="Введите ID предложения"
        onChange={e => setProposalId(e.target.value)}
        className="input"
      />
      <button onClick={handleVote} className="btn btn-primary">
        Голосовать
      </button>
    </div>
  );
}
