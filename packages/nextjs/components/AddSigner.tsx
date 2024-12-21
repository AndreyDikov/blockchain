import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export default function AddSigner() {
  const [signerAddress, setSignerAddress] = useState("");

  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "MultiSigProposal",
  });

  const handleAddSigner = async () => {
    if (!signerAddress) {
      alert("Введите адрес подписанта");
      return;
    }

    try {
      await writeContractAsync({
        functionName: "addSigner",
        args: [signerAddress],
      });
      alert("Подписант успешно добавлен!");
      setSignerAddress("");
    } catch (error) {
      console.error("Ошибка при добавлении подписанта:", error);
    }
  };

  return (
    <div className="card">
      <h2>Добавить подписанта</h2>
      <input
        type="text"
        value={signerAddress}
        placeholder="Введите адрес подписанта"
        onChange={e => setSignerAddress(e.target.value)}
        className="input"
      />
      <button onClick={handleAddSigner} className="btn btn-primary">
        Добавить подписанта
      </button>
    </div>
  );
}
