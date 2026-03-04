import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoalDecomposer } from './GoalDecomposer';
import { PersonalOnDeviceAI } from './PersonalOnDeviceAI';

// Mock PersonalOnDeviceAI
vi.mock('./PersonalOnDeviceAI', () => ({
    PersonalOnDeviceAI: {
        generate: vi.fn()
    }
}));

describe('GoalDecomposer', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should validate actionable steps (Type C)', async () => {
        const mockSteps = {
            type: 'steps',
            steps: [
                { title: 'Buy milk', isHeader: false, completed: false },
                { title: 'Drink milk', isHeader: false, completed: false }
            ]
        };

        PersonalOnDeviceAI.generate.mockResolvedValue({
            text: JSON.stringify(mockSteps),
            source: 'mock'
        });

        const result = await GoalDecomposer.clarifyGoal('Buy milk');
        expect(result).toEqual(mockSteps);
    });

    it('should validate clarifying question (Type A)', async () => {
        const mockQuestion = {
            type: 'question',
            question: 'What kind of milk?'
        };

        PersonalOnDeviceAI.generate.mockResolvedValue({
            text: JSON.stringify(mockQuestion),
            source: 'mock'
        });

        const result = await GoalDecomposer.clarifyGoal('Buy something');
        expect(result).toEqual(mockQuestion);
    });

    it('should handle malformed JSON gracefully', async () => {
        PersonalOnDeviceAI.generate.mockResolvedValue({
            text: 'Not JSON',
            source: 'mock'
        });

        const result = await GoalDecomposer.clarifyGoal('Bad response');
        expect(result.type).toBe('question'); // Fallback
        expect(result.question).toContain('Error');
    });

    it('should handle Zod validation error (invalid schema)', async () => {
        const invalidData = {
            type: 'steps',
            steps: [{ title: 123 }] // Expected string, got number
        };

        PersonalOnDeviceAI.generate.mockResolvedValue({
            text: JSON.stringify(invalidData),
            source: 'mock'
        });

        const result = await GoalDecomposer.clarifyGoal('Invalid data');
        expect(result.type).toBe('question'); // Fallback
        expect(result.question).toContain('Error');
    });
});
