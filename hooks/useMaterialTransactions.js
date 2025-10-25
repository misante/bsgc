// hooks/useMaterialTransactions.js
import { useState, useEffect, useCallback } from "react";

export const useMaterialTransactions = (materialId) => {
  const [transactions, setTransactions] = useState([]);
  const [currentStock, setCurrentStock] = useState(0);
  const [unit, setUnit] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(
    async (id = materialId) => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/materials/${id}/transactions`);

        if (!response.ok) {
          throw new Error(`Failed to fetch transactions: ${response.status}`);
        }

        const data = await response.json();
        setTransactions(data.transactions || []);
        setCurrentStock(data.current_stock);
        setUnit(data.unit);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [materialId]
  );

  useEffect(() => {
    if (materialId) {
      fetchTransactions();
    }
  }, [materialId, fetchTransactions]);

  const refreshTransactions = useCallback(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    error,
    refreshTransactions,
    currentStock,
    unit,
  };
};
