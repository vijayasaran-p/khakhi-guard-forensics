import { generateLinkageGraphAndRisk } from '../services/riskEngine.js';
import { prisma } from '../db/client.js';

describe('Risk Engine & Linkage Graph Generator', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should generate deterministic risk score and valid graph elements', async () => {
    const result = await generateLinkageGraphAndRisk('KG-2026-0818');

    expect(result).toBeDefined();
    expect(result.overallRiskScore).toBeGreaterThanOrEqual(20);
    expect(result.overallRiskScore).toBeLessThanOrEqual(99);
    expect(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).toContain(result.riskLevel);

    // Nodes validation
    expect(result.nodes).toBeInstanceOf(Array);
    expect(result.nodes.length).toBeGreaterThan(0);
    const caseNode = result.nodes.find(n => n.type === 'case');
    expect(caseNode).toBeDefined();

    // Edges validation
    expect(result.edges).toBeInstanceOf(Array);
    expect(result.edges.length).toBeGreaterThan(0);

    // Explainable formula validation
    expect(result.breakdown.explainedFormula).toContain('Base');
    expect(result.narrative.summary).toBeDefined();
    expect(result.narrative.statutoryAffirmation).toContain('Section 63');
  });
});
