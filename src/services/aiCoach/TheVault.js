/**
 * TheVault: Persistent local knowledge base of AI-retrieved resources.
 */
export const TheVault = {
    /**
     * Saves a fragment (article, contact, price) to the local stash.
     */
    saveFragment(goalId, fragment) {
        const vault = JSON.parse(localStorage.getItem('knowledge_vault') || '{}');
        if (!vault[goalId]) vault[goalId] = [];

        // Prevent duplicates
        const exists = vault[goalId].find(f => f.title === fragment.title);
        if (!exists) {
            vault[goalId].push({
                ...fragment,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('knowledge_vault', JSON.stringify(vault));
        }
    },

    /**
     * Retrieves all known resources for a specific goal.
     */
    getGoalResources(goalId) {
        const vault = JSON.parse(localStorage.getItem('knowledge_vault') || '{}');
        return vault[goalId] || [];
    },

    /**
     * Search the entire vault.
     */
    search(query) {
        const vault = JSON.parse(localStorage.getItem('knowledge_vault') || '{}');
        const results = [];
        Object.values(vault).forEach(list => {
            list.forEach(item => {
                if (item.title.toLowerCase().includes(query.toLowerCase())) {
                    results.push(item);
                }
            });
        });
        return results;
    }
};
