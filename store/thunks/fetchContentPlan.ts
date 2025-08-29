type ContentPlanItem = {
    title: string;
    description: string;
    keywords: string;
};

export default async function fetchContentPlan(promptContentPlan: string): Promise<ContentPlanItem[] | null> {
    try {
        const response = await fetch('/api/ai-assistant/content-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: promptContentPlan }),
        });

        const data = await response.json();
        console.log("1) data: ", data);

        if (!response.ok || !data.result) {
            console.error("Error fetching content plan:", data.error || "Unknown error");
            return null;
        }

        const text = data.result.text;
        const jsonString = text.substring(text.indexOf('['), text.lastIndexOf(']') + 1);

        try {
            const parsedResult: ContentPlanItem[] = JSON.parse(jsonString);

            if (!Array.isArray(parsedResult)) {
                console.error("❌ Expected a JSON array, but received:", parsedResult);
                return null;
            }

            const filteredResult = parsedResult.filter(item => {
                return !(
                    item.title === "Skipped" ||
                    item.description === "Skipped" ||
                    item.keywords === "Skipped"
                );
            });

            return filteredResult;
        } catch (parseError) {
            console.error("❌ Error parsing JSON:", parseError);
            return null;
        }

    } catch (error) {
        console.error("Error in fetchContentPlan:", error);
        return null;
    }
}
