export function roundTo(n: number, decimals = 2): number {
    const f = 10 ** decimals;
    return Math.round((n + Number.EPSILON) * f) / f;
}
