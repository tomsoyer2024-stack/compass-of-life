import { describe, it, expect } from 'vitest';

// Arch Item 24: Sample Unit Test
describe('Calculator Business Logic', () => {
    it('should calculate compound interest correctly', () => {
        const principal = 1000;
        const rate = 0.05;
        const years = 1;
        // A = P(1 + r)^t
        const amount = principal * Math.pow((1 + rate), years);
        expect(amount).toBe(1050);
    });

    it('should format currency correctly', () => {
        const value = 1234.56;
        const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
        expect(formatter.format(value)).toBe('$1,234.56');
    });
});
