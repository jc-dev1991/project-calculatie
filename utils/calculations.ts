import { Project, MaterialLine, LaborLine, ExtraCostLine, ProjectTotals, LaborType, MaterialCategory, MaterialUnit } from '../types';

// Helper for currency rounding
const roundToTwo = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

export const calculateMaterialLine = (line: MaterialLine, projectMarginPct: number, projectMarginEnabled: boolean) => {
  if (!line) return { netCost: 0, wasteCost: 0, totalCost: 0, salesPrice: 0, effectiveQuantity: 0 };

  let effectiveQuantity = Number(line.quantity) || 0;

  const usesArea = line.category === MaterialCategory.PLAATMATERIAAL || 
                   line.category === MaterialCategory.MASSIEF || 
                   line.category === MaterialCategory.SPUITWERK;

  if (usesArea) {
    const len = Number(line.length) || 0;
    const wid = Number(line.width) || 0;
    
    if (len && wid && line.unit === MaterialUnit.M2) {
      effectiveQuantity = (len / 1000) * (wid / 1000) * effectiveQuantity;
    } else if (len && line.unit === MaterialUnit.M1) {
      effectiveQuantity = (len / 1000) * effectiveQuantity;
    }
  }

  const totalCost = roundToTwo(effectiveQuantity * (Number(line.unitCost) || 0));
  
  // Material margin logic
  let appliedMargin = 0;
  
  if (line.isDirectPurchase) {
    appliedMargin = Number(line.marginOverridePct) || 0;
  } else if (line.marginOverrideEnabled) {
    appliedMargin = Number(line.marginOverridePct) || 0;
  } else if (projectMarginEnabled) {
    appliedMargin = Number(projectMarginPct) || 0;
  }
    
  const salesPrice = roundToTwo(totalCost * (1 + appliedMargin / 100));
  
  return { netCost: totalCost, wasteCost: 0, totalCost, salesPrice, effectiveQuantity };
};

// --- HIER ZIT DE FIX VOOR DE UREN ---
export const calculateLaborLine = (line: LaborLine, projectMarginPct: number, projectMarginEnabled: boolean) => {
  if (!line) return { laborCost: 0, laborSales: 0 };

  // 1. Zorg dat we zeker weten dat we met getallen werken (voorkomt tekst-fouten)
  const hours = Number(line.hours) || 0;
  const costRate = Number(line.costRate) || 0;
  const sellRate = Number(line.sellRate) || 0;

  // 2. Bereken altijd de inkoopkosten (Kostprijs)
  const laborCost = roundToTwo(hours * costRate);
  
  let laborSales = 0;

  // 3. Bepaal de verkoopprijs
  if (line.type === LaborType.TRAVEL && !line.travelBillable) {
    // Reistijd niet facturabel = 0
    laborSales = 0;
  } else if (line.sellRateEnabled) {
    // SITUATIE A: Vinkje AAN -> Gebruik vast tarief
    laborSales = roundToTwo(hours * sellRate);
  } else {
    // SITUATIE B: Vinkje UIT -> Gebruik inkoop + winstmarge
    // Als margin enabled is, pak die, anders 0 (dus verkoop = inkoop)
    const margin = projectMarginEnabled ? (Number(projectMarginPct) || 0) : 0;
    
    // Formule: Kosten * (1 + marge/100)
    laborSales = roundToTwo(laborCost * (1 + margin / 100));
  }

  return { laborCost, laborSales };
};

export const calculateExtraLine = (line: ExtraCostLine) => {
  if (!line) return { cost: 0, sales: 0 };

  const cost = Number(line.cost) || 0;
  const margin = Number(line.marginPct) || 0;

  const sales = line.marginEnabled 
    ? roundToTwo(cost * (1 + margin / 100)) 
    : roundToTwo(cost);
    
  return { cost, sales };
};

export const calculateProjectTotals = (project: Project): ProjectTotals => {
  if (!project) return {
    materialsCostTotal: 0, materialsSalesTotal: 0, laborCostTotal: 0, laborSalesTotal: 0,
    extrasCostTotal: 0, extrasSalesTotal: 0, subtotalCost: 0, subtotalSales: 0,
    vatAmount: 0, totalIncVat: 0, grossProfit: 0, grossMarginPct: 0
  };

  let materialsCostTotal = 0;
  let materialsSalesTotal = 0;
  let laborCostTotal = 0;
  let laborSalesTotal = 0;
  let extrasCostTotal = 0;
  let extrasSalesTotal = 0;

  // 1. Materialen
  (project.materials || []).forEach(m => {
    const { totalCost, salesPrice } = calculateMaterialLine(m, project.materialMarginPct, project.materialMarginEnabled);
    materialsCostTotal += totalCost;
    materialsSalesTotal += salesPrice;
  });

  // 2. Arbeid
  // FIX: Haal algemene marge op. Als die niet bestaat, gebruik 0.
  // We zetten 'enabled' op true als er een marge is, of hardcoded true zodat we altijd minimaal de kostprijs rekenen.
  const generalMargin = Number((project as any).generalMargin) || 0;
  
  (project.labor || []).forEach(l => {
    // Hier roepen we de verbeterde functie aan
    const { laborCost, laborSales } = calculateLaborLine(l, generalMargin, true);
    laborCostTotal += laborCost;
    laborSalesTotal += laborSales;
  });

  // 3. Overige kosten
  (project.extras || []).forEach(e => {
    const { cost, sales } = calculateExtraLine(e);
    extrasCostTotal += cost;
    extrasSalesTotal += sales;
  });

  // Afrondingen
  materialsCostTotal = roundToTwo(materialsCostTotal);
  materialsSalesTotal = roundToTwo(materialsSalesTotal);
  laborCostTotal = roundToTwo(laborCostTotal);
  laborSalesTotal = roundToTwo(laborSalesTotal);
  extrasCostTotal = roundToTwo(extrasCostTotal);
  extrasSalesTotal = roundToTwo(extrasSalesTotal);

  const subtotalCost = roundToTwo(materialsCostTotal + extrasCostTotal + laborCostTotal);
  const subtotalSales = roundToTwo(materialsSalesTotal + laborSalesTotal + extrasSalesTotal);
  
  const vatRate = Number(project.vatRate) || 21;
  const vatAmount = roundToTwo(subtotalSales * (vatRate / 100));
  const totalIncVat = roundToTwo(subtotalSales + vatAmount);
  
  const grossProfit = roundToTwo(subtotalSales - subtotalCost);
  const grossMarginPct = subtotalSales > 0 ? roundToTwo((grossProfit / subtotalSales) * 100) : 0;

  return {
    materialsCostTotal,
    materialsSalesTotal,
    laborCostTotal,
    laborSalesTotal,
    extrasCostTotal,
    extrasSalesTotal,
    subtotalCost,
    subtotalSales,
    vatAmount,
    totalIncVat,
    grossProfit,
    grossMarginPct
  };
};

export const formatCurrency = (val: number, currency = 'EUR') => {
  if (isNaN(val)) return '€ 0,00';
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency }).format(val);
};

export const formatNumber = (val: number) => {
  if (isNaN(val)) return '0,00';
  return new Intl.NumberFormat('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
};