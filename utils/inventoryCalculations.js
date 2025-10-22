// utils/inventoryCalculations.js
export const calculateMaterialSummary = (inventoryRecords) => {
  const summary = {};

  inventoryRecords.forEach((record) => {
    if (!summary[record.master_material_id]) {
      summary[record.master_material_id] = {
        master_material_id: record.master_material_id,
        total_quantity: 0,
        total_value: 0,
        average_unit_cost: 0,
        total_receipts: 0,
        last_received_date: null,
      };
    }

    const materialSummary = summary[record.master_material_id];
    materialSummary.total_quantity += parseFloat(record.quantity);
    materialSummary.total_value += parseFloat(record.total_value);
    materialSummary.total_receipts += 1;

    if (
      !materialSummary.last_received_date ||
      new Date(record.received_date) >
        new Date(materialSummary.last_received_date)
    ) {
      materialSummary.last_received_date = record.received_date;
    }
  });

  // Calculate average unit cost
  Object.values(summary).forEach((item) => {
    item.average_unit_cost = item.total_value / item.total_quantity;
  });

  return Object.values(summary);
};

// Hook to fetch material summary
export const useMaterialSummary = () => {
  const [materialSummary, setMaterialSummary] = useState([]);

  useEffect(() => {
    const fetchSummary = async () => {
      const { data: inventory } = await supabase.from("inventory").select("*");

      if (inventory) {
        const summary = calculateMaterialSummary(inventory);
        setMaterialSummary(summary);
      }
    };

    fetchSummary();
  }, []);

  return materialSummary;
};
