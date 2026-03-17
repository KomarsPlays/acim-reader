const fs = require('fs');
const path = require('path');

const RAW_TEXT_PATH = path.resolve(__dirname, 'raw_text.txt');
const OUTPUT_PATH = path.resolve(__dirname, 'lessons.json');

function parseLessons(allText) {
    // Pattern to find lesson headers: "Урок 1", "Урок 365" etc.
    // The regex finds "Урок X", optionally captures the title on the next few lines
    // We use a simpler approach: split by "Урок X"

    const lessonRegex = /(?:^|\n)\s*Урок\s+(\d+)\s*\n/g;

    let match;
    let indices = [];

    while ((match = lessonRegex.exec(allText)) !== null) {
        indices.push({
            number: parseInt(match[1]),
            index: match.index,
            matchLength: match[0].length
        });
    }

    console.log(`Found ${indices.length} lesson markers`);

    let lessons = [];

    for (let i = 0; i < indices.length; i++) {
        const current = indices[i];
        const next = indices[i + 1];

        // Extract text block for this lesson
        const startIdx = current.index + current.matchLength;
        const endIdx = next ? next.index : allText.length;

        let content = allText.substring(startIdx, endIdx).trim();

        // Clean up page numbers and page breaks
        content = content.replace(/--- PAGE BREAK ---/g, '');
        content = content.replace(/^\d+\s*$/gm, ''); // Remove standalone numbers (page numbers)

        // Extract title (usually the first non-empty line)
        const lines = content.split('\n').map(l => l.trim()).filter(l => l);
        let title = lines.length > 0 ? lines[0] : `Урок ${current.number}`;

        // If title ends with a period, it's probably the title
        // But sometimes the title spans 2 lines. Let's just take the first sentence/line.
        let text = content.replace(title, '').trim();

        // Fix common formatting issues and preserve paragraphs/verses
        const linesBuf = text.split('\n');
        let parsedBlocks = [];
        let currentParagraph = "";
        let inPoeticBlock = false;

        for (let j = 0; j < linesBuf.length; j++) {
            const line = linesBuf[j];

            if (!line.trim()) {
                if (currentParagraph) {
                    parsedBlocks.push(currentParagraph);
                    currentParagraph = "";
                }
                inPoeticBlock = false;
                continue;
            }

            const isNumberedList = /^\s*\d+\.\s/.test(line);
            const leadingSpacesCount = line.match(/^\s*/)[0].length;
            const isIndented = leadingSpacesCount >= 8 && !isNumberedList;

            if (isNumberedList) {
                if (currentParagraph) parsedBlocks.push(currentParagraph);
                currentParagraph = line.trim();
                inPoeticBlock = false;
            } else if (isIndented) {
                if (currentParagraph && !inPoeticBlock) {
                    parsedBlocks.push(currentParagraph);
                    currentParagraph = "";
                }
                if (inPoeticBlock) {
                    currentParagraph += "\n" + line.trim();
                } else {
                    currentParagraph = line.trim();
                    inPoeticBlock = true;
                }
            } else {
                // Continuation
                if (currentParagraph) {
                    // Try to avoid double spaces
                    currentParagraph += (currentParagraph.endsWith('-') ? "" : " ") + line.trim();
                } else {
                    currentParagraph = line.trim();
                }
            }
        }
        if (currentParagraph) parsedBlocks.push(currentParagraph);
        text = parsedBlocks.join('\n\n');

        lessons.push({
            number: current.number,
            title: title,
            text: text
        });
    }

    // Sort by lesson number just in case
    lessons.sort((a, b) => a.number - b.number);

    // Remove duplicates (sometimes PDF has duplicated headers)
    const uniqueLessons = [];
    const seen = new Set();
    for (const l of lessons) {
        if (!seen.has(l.number)) {
            seen.add(l.number);
            uniqueLessons.push(l);
        }
    }

    return uniqueLessons;
}

function main() {
    console.log('Reading raw text...');
    const allText = fs.readFileSync(RAW_TEXT_PATH, 'utf-8');

    console.log('Parsing lessons...');
    const lessons = parseLessons(allText);

    console.log(`Extracted ${lessons.length} unique lessons`);
    if (lessons.length > 0) {
        console.log(`First lesson: ${lessons[0].number} - ${lessons[0].title}`);
        console.log(`Last lesson: ${lessons[lessons.length - 1].number} - ${lessons[lessons.length - 1].title}`);
    }

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(lessons, null, 2), 'utf-8');
    console.log(`Saved lessons to ${OUTPUT_PATH}`);
}

main();
