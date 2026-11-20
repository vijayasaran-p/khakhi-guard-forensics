import { MockCryptoProvider } from '../pipelines/cryptoPipeline.js';

describe('Crypto Provider Pipeline', () => {
  it('should return deterministic 4-hop chain for EVM address', async () => {
    const provider = new MockCryptoProvider();
    const testWallet = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
    const hops = await provider.traceWallet(testWallet);

    expect(hops).toHaveLength(4);
    expect(hops[0].hop).toBe(1);
    expect(hops[0].to).toBe(testWallet);
    expect(hops[3].hop).toBe(4);
    expect(hops[3].isFrozen).toBe(true);
  });
});
