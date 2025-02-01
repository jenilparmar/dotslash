

    export function ExtractDataFromPara(paragraph) {
        
        const arrayMatch = paragraph.match(/\[.*?\]/); // Use regex to match the array part
        
        if (arrayMatch) {
        try {
            const extractedArray = JSON.parse(arrayMatch[0]);
            return extractedArray // Output: [{}, {}]
        } catch (error) {
            console.error("Failed to parse JSON:", error);
            return [];
        }
        } else {
        return null;
        }
        
    }

