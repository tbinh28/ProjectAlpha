pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

export async function extractTextFromFile(file) {
    if (file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
    } else if (file.name.endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map(item => item.str).join(' ') + ' ';
        }
        return fullText;
    }
    throw new Error('Định dạng file không được hỗ trợ.');
}

export function parseQuestions(rawText) {
    let text = rawText.replace(/\n+/g, ' ').replace(/\s+/g, ' ');
    const qRegex = /(?:Câu|Question)\s*(\d+)\s*[:\.]/gi;
    let questions = [];
    let indices = [];
    let match;

    while ((match = qRegex.exec(text)) !== null) {
        indices.push({ index: match.index, number: match[1], matchStr: match[0] });
    }

    let currentPassage = "";

    for (let i = 0; i < indices.length; i++) {
        let start = indices[i].index;
        let end = (i + 1 < indices.length) ? indices[i + 1].index : text.length;
        let block = text.substring(start, end);

        let optA = block.search(/A\s*\./);
        let optB = block.search(/B\s*\./);
        let optC = block.search(/C\s*\./);
        let optD = block.search(/D\s*\./);

        if (optA !== -1 && optB !== -1 && optC !== -1 && optD !== -1) {
            let qText = block.substring(indices[i].matchStr.length, optA).trim();
            let aText = block.substring(optA + 2, optB).trim();
            let bText = block.substring(optB + 2, optC).trim();
            let cText = block.substring(optC + 2, optD).trim();
            let dTextRaw = block.substring(optD + 2).trim();

            let dText = dTextRaw;
            let nextPassage = "";

            // Regex cắt câu hướng dẫn và bài đọc khỏi đáp án D
            const instructionRegex = /(Cloze text:|Read the passage|Read the following|Dialogue completion:|Antonyms:|Synonyms:|Mark the letter|Choose A,\s*B,\s*C|Choose the correct)/i;
            const insMatch = dTextRaw.match(instructionRegex);

            if (insMatch) {
                dText = dTextRaw.substring(0, insMatch.index).trim();
                nextPassage = dTextRaw.substring(insMatch.index).trim();
            }

            questions.push({
                id: indices[i].number,
                text: qText,
                options: { A: aText, B: bText, C: cText, D: dText },
                passage: currentPassage
            });

            if (nextPassage && nextPassage.length > 80) {
                currentPassage = nextPassage; // Lưu lại đoạn văn dài
            } else if (nextPassage && nextPassage.length <= 80) {
                currentPassage = ""; // Reset nếu chỉ là câu lệnh ngắn
            }
        }
    }
    return questions;
}

export function parseAnswerKey(keyText) {
    if (!keyText.trim()) return null;
    let keyObj = {};
    const regex = /(\d+)\s*([A-D])/gi;
    let match;
    while ((match = regex.exec(keyText)) !== null) {
        keyObj[match[1]] = match[2].toUpperCase();
    }
    return Object.keys(keyObj).length > 0 ? keyObj : null;
}
