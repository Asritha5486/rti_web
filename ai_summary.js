// ==========================================
// GLOBAL CONFIGURATION
// Shared across scripts loaded in this tab context
// ==========================================
window.GEMINI_CONFIG = {
    API_KEY: "", // Paste your actual API Key here
    MODEL: "gemini-2.5-flash"                  // Matches the performance scaling of your target pattern
};

/**
 * Generates an official, condensed statement of facts using live prompt streams.
 * @param {string} issueText - The raw user input from the textbox or audio transcription.
 * @param {string} language - The plain language name framework (e.g., 'English', 'Hindi', 'Telugu').
 * @returns {Promise<{summary: string, description: string}>}
 */
async function generateIssueSummary(issueText, language) {
    if (!issueText) {
        return { summary: '', description: '' };
    }

    // Dynamic extraction instruction mirroring your target pipeline blueprint
    const prompt = `
        You are a highly efficient administrative engine summarizing citizen input context. 
        Analyze the raw complaint below and rewrite it into exactly 2 to 3 lines of highly formal, objective narrative prose. 
        This text block will serve as the "Statement of Facts/Context" section in an official letter to a Public Information Officer (PIO).
        
        Constraints:
        - The finalized text must be exactly 2 to 3 lines long.
        - Write the output completely in the "${language}" language using its native script layout.
        - Return ONLY the raw textual summary. Do not include prefixes like "Summary:" or markdown wrappers.
        
        Citizen Complaint Input text:
        "${issueText}"
    `;
    
    try {
        const config = window.GEMINI_CONFIG;
        if (!config.API_KEY || config.API_KEY.includes("YOUR_")) {
            throw new Error("Missing Gemini API Key configuration.");
        }

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${config.MODEL}:generateContent?key=${config.API_KEY}`;
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });
        
        if (!response.ok) {
            throw new Error(`Gemini service dropped request: ${response.status}`);
        }
        
        const data = await response.json();
        const generatedText = data.candidates[0].content.parts[0].text.trim();
        
        return {
            summary: generatedText,
            description: issueText
        };
    } catch (error) {
        console.error("ai_summary.js execution failed:", error);
        // Clean baseline safe recovery context return
        return { 
            summary: issueText, 
            description: issueText 
        };
    }
}