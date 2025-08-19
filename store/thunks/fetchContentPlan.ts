// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function fetchContentPlan(promptContentPlan: string): Promise<any[] | null> {
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

        // Извлекаем JSON-строку из текста (если она обернута в markdown-блоки)
        const jsonString = text.substring(text.indexOf('['), text.lastIndexOf(']') + 1);

        try {
            const parsedResult = JSON.parse(jsonString);

            // Проверяем, что результат - массив
            if (!Array.isArray(parsedResult)) {
                console.error("❌ Expected a JSON array, but received:", parsedResult);
                return null;
            }

            // Фильтруем Skipped элементы (если нужно)
            const filteredResult = parsedResult.filter(item => {
                return !(item.title === "Skipped" || item.keywords === "Skipped");
            });

            return filteredResult; // Возвращаем отфильтрованный массив
        } catch (parseError) {
            console.error("❌ Error parsing JSON:", parseError);
            return null;
        }

    } catch (error) {
        console.error("Error in fetchContentPlan:", error);
        return null;
    }
}