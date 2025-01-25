const API_BASE_URL = 'http://localhost:8000';

export const api = {
    startSession: async (problemCount: number) => {
        const response = await fetch(`${API_BASE_URL}/session/start?problem_count=${problemCount}`, {
            method: 'POST'
        });
        return response.json();
    },

    submitPseudocode: async (sessionId: string, pseudocode: string) => {
        console.log("submitPseudocode", sessionId, pseudocode);
        const response = await fetch(`${API_BASE_URL}/session/${sessionId}/submit-pseudocode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pseudocode })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to submit pseudocode');
        }
        return response.json();
    },

    submitWalkthrough: async (sessionId: string, walkthrough: string) => {
        const response = await fetch(`${API_BASE_URL}/session/${sessionId}/submit-walkthrough`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walkthrough })
        });
        return response.json();
    }
};
