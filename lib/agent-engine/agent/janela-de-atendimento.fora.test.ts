import { describe, expect, it } from 'vitest';
import { lerJanelaDeAtendimento, msAteAJanelaAbrir } from './janela-de-atendimento';

describe('janela de atendimento — modo fora (fork C&G)', () => {
  const tc = (modo?: string) => ({
    filters: { business_hours: { timezone: 'America/Sao_Paulo', start: '09:00', end: '17:00', weekdays: [1, 2, 3, 4, 5], ...(modo ? { modo } : {}) } },
  });

  it('lê o modo fora', () => {
    expect(lerJanelaDeAtendimento(tc('fora'))?.modo).toBe('fora');
  });
  it('sem modo, ou modo desconhecido, fica o de sempre', () => {
    expect(lerJanelaDeAtendimento(tc())?.modo).toBeUndefined();
    expect(lerJanelaDeAtendimento(tc('xyz'))?.modo).toBeUndefined();
  });
  it('dentro do horário a janela está aberta (é quando o modo fora cala o agente)', () => {
    const j = lerJanelaDeAtendimento(tc('fora'))!;
    // quinta, 26/11/2026, 10:00 em Brasília = 13:00 UTC
    expect(msAteAJanelaAbrir(j, new Date('2026-11-26T13:00:00Z'))).toBeNull();
    // quinta, 21:00 em Brasília = fora: o agente atende
    expect(msAteAJanelaAbrir(j, new Date('2026-11-27T00:00:00Z'))).not.toBeNull();
  });
});
