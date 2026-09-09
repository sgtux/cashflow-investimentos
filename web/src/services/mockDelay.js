// Simula a latência de uma chamada HTTP real, para o loading state da UI fazer sentido
// mesmo antes de existir uma API de verdade.
export const mockDelay = (value, ms = 300) => new Promise(resolve => setTimeout(() => resolve(value), ms))
