// Cấu hình PDF.js worker
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
            // Nối text, thêm space để tránh dính chữ khi rớt dòng
            fullText += textContent.items.map(item => item.str).join(' ') + ' ';
        }
        return fullText;
    }
    throw new Error('Định dạng file không được hỗ trợ.');
}

export function parseQuestions(rawText) {
    // Tiền xử lý: Xóa khoảng trắng thừa, chuẩn hóa khoảng cách
    let text = rawText.replace(/\n+/g, ' ').replace(/\s+/g, ' ');
    
    // Regex tìm bắt đầu câu hỏi (Câu 1:, Question 2., ...)
    const qRegex = /(?:Câu|Question)\s*(\d+)\s*[:\.]/gi;
    let questions = [];
    let match;
    let indices = [];

    while ((match = qRegex.exec(text)) !== null) {
        indices.push({ index: match.index, number: match[1], matchStr: match[0] });
    }

    for (let i = 0; i < indices.length; i++) {
        let start = indices[i].index;
        let end = (i + 1 < indices.length) ? indices[i + 1].index : text.length;
        let block = text.substring(start, end);

        // Tìm vị trí các đáp án A., B., C., D.
        // Hỗ trợ trường hợp có khoảng trắng giữa chữ và dấu chấm (A ., B .)
        let optA = block.search(/A\s*\./);
        let optB = block.search(/B\s*\./);
        let optC = block.search(/C\s*\./);
        let optD = block.search(/D\s*\./);

        if (optA !== -1 && optB !== -1 && optC !== -1 && optD !== -1) {
            let qText = block.substring(indices[i].matchStr.length, optA).trim();
            let aText = block.substring(optA + 2, optB).trim();
            let bText = block.substring(optB + 2, optC).trim();
            let cText = block.substring(optC + 2, optD).trim();
            let dText = block.substring(optD + 2).trim();

            questions.push({
                id: indices[i].number,
                text: qText,
                options: { A: aText, B: bText, C: cText, D: dText }
            });
        }
    }
    return questions;
}

export function parseAnswerKey(keyText) {
    if (!keyText.trim()) return null;
    let keyObj = {};
    // Regex tìm dạng "1A", "2B", "3 C"
    const regex = /(\d+)\s*([A-D])/gi;
    let match;
    while ((match = regex.exec(keyText)) !== null) {
        keyObj[match[1]] = match[2].toUpperCase();
    }
    return Object.keys(keyObj).length > 0 ? keyObj : null;
}
