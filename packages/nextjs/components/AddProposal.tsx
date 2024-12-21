import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export default function AddProposal() {
  const [description, setDescription] = useState("");

  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "MultiSigProposal",
  });

  const handleAddProposal = async () => {
    if (!description) {
      alert("Введите описание предложения");
      return;
    }

    try {
      await writeContractAsync({
        functionName: "addProposal",
        args: [description],
      });
      alert("Предложение добавлено!");
      setDescription("");
    } catch (error) {
      console.error("Ошибка при добавлении предложения:", error);
    }
  };

  return (
    <div className="card">
      <h2>Добавить предложение</h2>
      <input
        type="text"
        value={description}
        placeholder="Введите описание"
        onChange={e => setDescription(e.target.value)}
        className="input"
      />
      <button onClick={handleAddProposal} className="btn btn-primary">
        Добавить
      </button>
    </div>
  );
}
