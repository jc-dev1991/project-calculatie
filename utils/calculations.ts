
import { Project, MaterialLine, LaborLine, ExtraCostLine, ProjectTotals, LaborType, MaterialCategory, MaterialUnit } from '../types';

// Helper for currency rounding
const roundToTwo = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

export const calculateMaterialLine = (line: MaterialLine, projectMarginPct: number, projectMarginEnabled: boolean) => {
  if (!line) return { netCost: 0, wasteCost: 0, totalCost: 0, salesPrice: 0, effectiveQuantity: 0 };

  let effectiveQuantity = line.quantity || 0;

  // If it's sheet, solid wood, or spraying and dimensions are provided, calculate area or length
  const usesArea = line.category === MaterialCategory.PLAATMATERIAAL || 
                   line.category === MaterialCategory.MASSIEF || 
                   line.category === MaterialCategory.SPUITWERK;

  if (usesArea) {
    if (line.length && line.width && line.unit === MaterialUnit.M2) {
      // Area in m2: (L/1000 * W/1000) * number of pieces
      effectiveQuantity = (line.length / 1000) * (line.width / 1000) * (line.quantity || 0);
    } else if (line.length && line.unit === MaterialUnit.M1) {
      // Linear meters: (L/1000) * number of pieces
      effectiveQuantity = (line.length / 1000) * (line.quantity || 0);
    }
  }

  // Use raw unit cost, but calculate total cost with rounding
  const totalCost = roundToTwo(effectiveQuantity * (line.unitCost || 0));
  
  // Logic: Direct Purchase items ignore project-wide margin. 
  // They only use marginOverridePct (which defaults to 0).
  const margin = line.isDirectPurchase 
    ? (line.marginOverridePct || 0) 
    : (line.marginOverrideEnabled ? (line.marginOverridePct || 0) : (projectMarginEnabled ? (projectMarginPct || 0) : 0));
    
  const salesPrice = roundToTwo(totalCost * (1 + margin / 100));
  
  return { netCost: totalCost, wasteCost: 0, totalCost, salesPrice, effectiveQuantity };
};

export const calculateLaborLine = (line: LaborLine, projectMarginPct: number, projectMarginEnabled: boolean) => {
  if (!line) return { laborCost: 0, laborSales: 0 };

  const laborCost = roundToTwo((line.hours || 0) * (line.costRate || 0));
  let laborSales = 0;

  if (line.type === LaborType.TRAVEL && !line.travelBillable) {
    laborSales = 0;
  } else if (line.sellRateEnabled) {
    laborSales = roundToTwo((line.hours || 0) * (line.sellRate || 0));
  } else if (projectMarginEnabled) {
    laborSales = roundToTwo(laborCost * (1 + (projectMarginPct || 0) / 100));
  } else {
    laborSales = laborCost;
  }

  return { laborCost, laborSales };
};

export const calculateExtraLine = (line: ExtraCostLine) => {
  if (!line) return { cost: 0, sales: 0 };

  const sales = line.marginEnabled 
    ? roundToTwo((line.cost || 0) * (1 + (line.marginPct || 0) / 100)) 
    : roundToTwo(line.cost || 0);
  return { cost: line.cost || 0, sales };
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

  (project.materials || []).forEach(m => {
    const { totalCost, salesPrice } = calculateMaterialLine(m, project.materialMarginPct, project.materialMarginEnabled);
    materialsCostTotal += totalCost;
    materialsSalesTotal += salesPrice;
  });

  (project.labor || []).forEach(l => {
    const { laborCost, laborSales } = calculateLaborLine(l, project.laborMarginPct, project.laborMarginEnabled);
    laborCostTotal += laborCost;
    laborSalesTotal += laborSales;
  });

  (project.extras || []).forEach(e => {
    const { cost, sales } = calculateExtraLine(e);
    extrasCostTotal += cost;
    extrasSalesTotal += sales;
  });

  // Apply strict rounding to totals after summation to avoid micro-precision errors
  materialsCostTotal = roundToTwo(materialsCostTotal);
  materialsSalesTotal = roundToTwo(materialsSalesTotal);
  laborCostTotal = roundToTwo(laborCostTotal);
  laborSalesTotal = roundToTwo(laborSalesTotal);
  extrasCostTotal = roundToTwo(extrasCostTotal);
  extrasSalesTotal = roundToTwo(extrasSalesTotal);

  // CRITICAL CHANGE: subtotalCost only includes external purchases (materials + extras).
  // Internal labor cost is calculated for reference but is NOT subtracted from gross profit.
  const subtotalCost = roundToTwo(materialsCostTotal + extrasCostTotal);
  const subtotalSales = roundToTwo(materialsSalesTotal + laborSalesTotal + extrasSalesTotal);
  const vatRate = project.vatRate || 21;
  const vatAmount = roundToTwo(subtotalSales * (vatRate / 100));
  const totalIncVat = roundToTwo(subtotalSales + vatAmount);
  
  // Profit is now all sales minus only the external purchase costs.
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
