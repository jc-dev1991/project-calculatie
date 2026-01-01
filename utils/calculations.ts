
import { Project, MaterialLine, LaborLine, ExtraCostLine, ProjectTotals, LaborType, MaterialCategory, MaterialUnit } from '../types';

export const calculateMaterialLine = (line: MaterialLine, projectMarginPct: number, projectMarginEnabled: boolean) => {
  let effectiveQuantity = line.quantity;

  // If it's sheet, solid wood, or spraying and dimensions are provided, calculate area or length
  const usesArea = line.category === MaterialCategory.PLAATMATERIAAL || 
                   line.category === MaterialCategory.MASSIEF || 
                   line.category === MaterialCategory.SPUITWERK;

  if (usesArea) {
    if (line.length && line.width && line.unit === MaterialUnit.M2) {
      // Area in m2: (L/1000 * W/1000) * number of pieces
      effectiveQuantity = (line.length / 1000) * (line.width / 1000) * line.quantity;
    } else if (line.length && line.unit === MaterialUnit.M1) {
      // Linear meters: (L/1000) * number of pieces
      effectiveQuantity = (line.length / 1000) * line.quantity;
    }
  }

  const totalCost = effectiveQuantity * line.unitCost;
  
  // Logic: Direct Purchase items ignore project-wide margin. 
  // They only use marginOverridePct (which defaults to 0).
  const margin = line.isDirectPurchase 
    ? line.marginOverridePct 
    : (line.marginOverrideEnabled ? line.marginOverridePct : (projectMarginEnabled ? projectMarginPct : 0));
    
  const salesPrice = totalCost * (1 + margin / 100);
  
  return { netCost: totalCost, wasteCost: 0, totalCost, salesPrice, effectiveQuantity };
};

export const calculateLaborLine = (line: LaborLine, projectMarginPct: number, projectMarginEnabled: boolean) => {
  const laborCost = line.hours * line.costRate;
  let laborSales = 0;

  if (line.type === LaborType.TRAVEL && !line.travelBillable) {
    laborSales = 0;
  } else if (line.sellRateEnabled) {
    laborSales = line.hours * line.sellRate;
  } else if (projectMarginEnabled) {
    laborSales = laborCost * (1 + projectMarginPct / 100);
  } else {
    laborSales = laborCost;
  }

  return { laborCost, laborSales };
};

export const calculateExtraLine = (line: ExtraCostLine) => {
  const sales = line.marginEnabled ? line.cost * (1 + line.marginPct / 100) : line.cost;
  return { cost: line.cost, sales };
};

export const calculateProjectTotals = (project: Project): ProjectTotals => {
  let materialsCostTotal = 0;
  let materialsSalesTotal = 0;
  let laborCostTotal = 0;
  let laborSalesTotal = 0;
  let extrasCostTotal = 0;
  let extrasSalesTotal = 0;

  project.materials.forEach(m => {
    const { totalCost, salesPrice } = calculateMaterialLine(m, project.materialMarginPct, project.materialMarginEnabled);
    materialsCostTotal += totalCost;
    materialsSalesTotal += salesPrice;
  });

  project.labor.forEach(l => {
    const { laborCost, laborSales } = calculateLaborLine(l, project.laborMarginPct, project.laborMarginEnabled);
    laborCostTotal += laborCost;
    laborSalesTotal += laborSales;
  });

  project.extras.forEach(e => {
    const { cost, sales } = calculateExtraLine(e);
    extrasCostTotal += cost;
    extrasSalesTotal += sales;
  });

  // CRITICAL CHANGE: subtotalCost only includes external purchases (materials + extras).
  // Internal labor cost is calculated for reference but is NOT subtracted from gross profit.
  const subtotalCost = materialsCostTotal + extrasCostTotal;
  const subtotalSales = materialsSalesTotal + laborSalesTotal + extrasSalesTotal;
  const vatAmount = subtotalSales * (project.vatRate / 100);
  const totalIncVat = subtotalSales + vatAmount;
  
  // Profit is now all sales minus only the external purchase costs.
  const grossProfit = subtotalSales - subtotalCost;
  const grossMarginPct = subtotalSales > 0 ? (grossProfit / subtotalSales) * 100 : 0;

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
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency }).format(val);
};

export const formatNumber = (val: number) => {
  return new Intl.NumberFormat('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
};
