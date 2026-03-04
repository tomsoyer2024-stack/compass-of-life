/**
 * ActionDrafts: Zero-effort task completion.
 * Generates drafts for the user so they only have to press 'Send'.
 */
export const ActionDrafts = {
    /**
     * Generates a WhatsApp draft.
     */
    generateWhatsApp(phone, text) {
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
        return {
            type: 'whatsapp',
            url,
            label: 'Open WhatsApp Draft'
        };
    },

    /**
     * Generates a Google Search query for Almaty logistics.
     */
    generateSearch(query) {
        const url = `https://www.google.com/search?q=${encodeURIComponent(query + " в Алматы")}`;
        return {
            type: 'search',
            url,
            label: 'Find in Almaty'
        };
    },

    /**
     * Copy to clipboard helper.
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            return false;
        }
    }
};
