// Dados de demonstração — simulam um usuário aportando mensalmente numa carteira variada:
// FIIs (MXRF11, HGLG11, XPML11), uma ação (BBAS3) e renda fixa (Tesouro Selic e um CDB),
// para o dashboard ter algo interessante para mostrar (composição por ativo, evolução
// mensal, histórico mês a mês, cotas acumuladas). Isso é substituído por dados reais assim
// que a API Java (ver docs/api-especificacao.md) existir.

export const seedAssets = [
  { id: 1, ticker: 'MXRF11', name: 'Maxi Renda FII', assetType: 'FII', inactiveAt: null },
  { id: 2, ticker: 'BBAS3', name: 'Banco do Brasil', assetType: 'ACAO', inactiveAt: null },
  { id: 3, ticker: 'HGLG11', name: 'CSHG Logística FII', assetType: 'FII', inactiveAt: null },
  { id: 4, ticker: 'XPML11', name: 'XP Malls FII', assetType: 'FII', inactiveAt: null },
  { id: 5, ticker: 'TSELIC29', name: 'Tesouro Selic 2029', assetType: 'TESOURO', inactiveAt: null },
  { id: 6, ticker: 'CDBBTG26', name: 'CDB BTG Pactual 110% CDI', assetType: 'CDB', inactiveAt: null }
]

export const seedContributions = [
  // MXRF11 (FII) — ~R$200/mês, sempre em cotas inteiras (não dá para comprar meia cota)
  { id: 1, assetId: 1, quantity: 21, unitPrice: 9.70, totalValue: 203.70, contributionDate: '2026-04-08', notes: '' },
  { id: 2, assetId: 1, quantity: 20, unitPrice: 9.80, totalValue: 196.00, contributionDate: '2026-05-08', notes: '' },
  { id: 3, assetId: 1, quantity: 21, unitPrice: 9.75, totalValue: 204.75, contributionDate: '2026-06-08', notes: '' },
  { id: 4, assetId: 1, quantity: 20, unitPrice: 9.90, totalValue: 198.00, contributionDate: '2026-07-08', notes: '' },
  { id: 5, assetId: 1, quantity: 20, unitPrice: 10.05, totalValue: 201.00, contributionDate: '2026-08-08', notes: '' },
  { id: 6, assetId: 1, quantity: 20, unitPrice: 10.15, totalValue: 203.00, contributionDate: '2026-09-05', notes: '' },

  // BBAS3 (ação ON) — aportes esporádicos
  { id: 7, assetId: 2, quantity: 8, unitPrice: 25.30, totalValue: 202.40, contributionDate: '2026-08-12', notes: '' },
  { id: 8, assetId: 2, quantity: 8, unitPrice: 24.80, totalValue: 198.40, contributionDate: '2026-09-03', notes: 'Aporte extra' },

  // HGLG11 (FII de logística)
  { id: 9, assetId: 3, quantity: 1, unitPrice: 158.00, totalValue: 158.00, contributionDate: '2026-05-08', notes: '' },
  { id: 10, assetId: 3, quantity: 1, unitPrice: 160.50, totalValue: 160.50, contributionDate: '2026-06-08', notes: '' },
  { id: 11, assetId: 3, quantity: 2, unitPrice: 159.00, totalValue: 318.00, contributionDate: '2026-07-08', notes: '' },
  { id: 12, assetId: 3, quantity: 1, unitPrice: 162.00, totalValue: 162.00, contributionDate: '2026-08-08', notes: '' },
  { id: 13, assetId: 3, quantity: 1, unitPrice: 164.50, totalValue: 164.50, contributionDate: '2026-09-05', notes: '' },

  // XPML11 (FII de shoppings)
  { id: 14, assetId: 4, quantity: 2, unitPrice: 104.00, totalValue: 208.00, contributionDate: '2026-06-10', notes: '' },
  { id: 15, assetId: 4, quantity: 2, unitPrice: 103.50, totalValue: 207.00, contributionDate: '2026-07-10', notes: '' },
  { id: 16, assetId: 4, quantity: 2, unitPrice: 105.00, totalValue: 210.00, contributionDate: '2026-08-10', notes: '' },
  { id: 17, assetId: 4, quantity: 2, unitPrice: 106.20, totalValue: 212.40, contributionDate: '2026-09-04', notes: '' },

  // Tesouro Selic 2029 (renda fixa — compra de frações de título)
  { id: 18, assetId: 5, quantity: 1.50, unitPrice: 100.00, totalValue: 150.00, contributionDate: '2026-04-15', notes: '' },
  { id: 19, assetId: 5, quantity: 2.00, unitPrice: 100.80, totalValue: 201.60, contributionDate: '2026-05-15', notes: '' },
  { id: 20, assetId: 5, quantity: 1.80, unitPrice: 101.50, totalValue: 182.70, contributionDate: '2026-06-15', notes: '' },
  { id: 21, assetId: 5, quantity: 2.00, unitPrice: 102.30, totalValue: 204.60, contributionDate: '2026-07-15', notes: '' },
  { id: 22, assetId: 5, quantity: 1.90, unitPrice: 103.10, totalValue: 195.89, contributionDate: '2026-08-15', notes: '' },
  { id: 23, assetId: 5, quantity: 1.50, unitPrice: 103.90, totalValue: 155.85, contributionDate: '2026-09-01', notes: '' },

  // CDB BTG 110% CDI (renda fixa — aplicações pontuais)
  { id: 24, assetId: 6, quantity: 3.00, unitPrice: 100.00, totalValue: 300.00, contributionDate: '2026-04-20', notes: 'Aplicação inicial' },
  { id: 25, assetId: 6, quantity: 2.00, unitPrice: 100.00, totalValue: 200.00, contributionDate: '2026-08-20', notes: '' }
]

// Simula a cotação / marcação a mercado atual (no app real, isso vem da brapi.dev via a API
// Java; para renda fixa seria o preço marcado a mercado do título).
export const seedQuotes = {
  MXRF11: 10.20,
  BBAS3: 26.10,
  HGLG11: 166.00,
  XPML11: 107.50,
  TSELIC29: 104.50,
  CDBBTG26: 103.20
}
