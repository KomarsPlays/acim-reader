// Parse PDF and extract lessons (pages 475-879)
// Output: lessons.json

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const PDF_PATH = path.resolve(__dirname, '../../z_Input/Книги/Курс Чудес.pdf');
const OUTPUT_PATH = path.resolve(__dirname, 'lessons.json');

// Pages 475-879 in PDF (0-indexed: 474-878)
const START_PAGE = 474; // 0-indexed
const END_PAGE = 878;   // 0-indexed

async function extractText() {
    console.log('Reading PDF...');
    const dataBuffer = fs.readFileSync(PDF_PATH);

    // Extract only needed pages
    const options = {
        pagerender: function (pageData) {
            return pageData.getTextContent().then(function (textContent) {
                let text = '';
                let lastY = null;
                for (let item of textContent.items) {
                    if (lastY !== null && Math.abs(lastY - item.transform[5]) > 5) {
                        text += '\n';
                    }
                    text += item.str;
                    lastY = item.transform[5];
                }
                return text;
            });
        },
        max: END_PAGE + 1 // pdf-parse reads up to this page count
    };

    const data = await pdfParse(dataBuffer, options);

    // data.text contains all pages, but we need to work with per-page approach
    // Let's use a different strategy - extract page by page
    console.log('Total pages in PDF:', data.numpages);
    console.log('Extracting pages', START_PAGE + 1, 'to', END_PAGE + 1);

    return data.text;
}

async function extractPageByPage() {
    console.log('Reading PDF...');
    const dataBuffer = fs.readFileSync(PDF_PATH);

    let allText = '';
    let pageTexts = [];

    const options = {
        pagerender: function (pageData) {
            return pageData.getTextContent().then(function (textContent) {
                let text = '';
                let lastY = null;
                for (let item of textContent.items) {
                    if (lastY !== null && Math.abs(lastY - item.transform[5]) > 5) {
                        text += '\n';
                    }
                    text += item.str;
                    lastY = item.transform[5];
                }
                pageTexts.push(text);
                return text;
            });
        }
    };

    const data = await pdfParse(dataBuffer, options);
    console.log('Total pages parsed:', pageTexts.length);

    // Get only pages 475-879 (0-indexed: 474-878)
    const lessonPages = pageTexts.slice(START_PAGE, END_PAGE + 1);
    console.log('Lesson pages extracted:', lessonPages.length);

    allText = lessonPages.join('\n\n--- PAGE BREAK ---\n\n');

    return { allText, lessonPages };
}

function parseLessons(allText) {
    // Pattern to find lesson headers
    // Common patterns: "УРОК 1", "Урок 1", "LESSON 1"
    // The text likely has "УРОК" or lesson number patterns

    // First, let's see what patterns exist
    const patterns = [
        /(?:^|\n)\s*(?:УРОК|Урок)\s+(\d+)\s*[.\n]/gm,
        /(?:^|\n)\s*(?:LESSON|Lesson)\s+(\d+)\s*[.\n]/gm,
        /(?:^|\n)\s*(\d+)\.\s+/gm
    ];

    // Try to find lesson boundaries
    const lessonRegex = /(?:^|\n)\s*(?:УРОК|Урок|LESSON|Lesson)\s+(\d+)\s*\.?\s*\n(.*?)(?=(?:\n\s*(?:УРОК|Урок|LESSON|Lesson)\s+\d+)|$)/gs;

    let lessons = [];
    let match;

    while ((match = lessonRegex.exec(allText)) !== null) {
        const number = parseInt(match[1]);
        const content = match[2].trim();

        // Extract title - first meaningful line
        const lines = content.split('\n').filter(l => l.trim());
        const title = lines[0] ? lines[0].trim() : '';
        const text = content;

        lessons.push({ number, title, text });
    }

    return lessons;
}

async function main() {
    try {
        const { allText, lessonPages } = await extractPageByPage();

        // Save raw text for inspection
        const rawPath = path.resolve(__dirname, 'raw_text.txt');
        fs.writeFileSync(rawPath, allText, 'utf-8');
        console.log('Raw text saved to:', rawPath);

        // Show first 3000 chars to understand structure
        console.log('\n=== FIRST 3000 CHARS OF EXTRACTED TEXT ===');
        console.log(allText.substring(0, 3000));
        console.log('\n=== SEARCHING FOR LESSON PATTERNS ===');

        // Find all "УРОК" or "Урок" occurrences
        const urokMatches = allText.match(/(?:УРОК|Урок|урок)\s+\d+/g);
        if (urokMatches) {
            console.log('Found', urokMatches.length, 'lesson markers');
            console.log('First 10:', urokMatches.slice(0, 10));
            console.log('Last 10:', urokMatches.slice(-10));
        } else {
            console.log('No "УРОК" pattern found. Checking other patterns...');

            // Check for "Lesson" in English
            const lessonMatches = allText.match(/(?:LESSON|Lesson|lesson)\s+\d+/g);
            if (lessonMatches) {
                console.log('Found', lessonMatches.length, '"Lesson" markers');
                console.log('First 10:', lessonMatches.slice(0, 10));
            }

            // Show some sample text from different positions
            const positions = [0, Math.floor(allText.length / 4), Math.floor(allText.length / 2), Math.floor(allText.length * 3 / 4)];
            for (const pos of positions) {
                console.log(`\n--- Text at position ${pos} ---`);
                console.log(allText.substring(pos, pos + 500));
            }
        }

    } catch (err) {
        console.error('Error:', err.message);
    }
}

main();
