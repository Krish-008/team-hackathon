/**
 * File Parser — Extract text from PDF, DOCX, and TXT files.
 */
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Parse a PDF buffer and extract text.
 */
async function parsePDF(buffer) {
    const data = await pdfParse(buffer);
    return data.text || '';
}

/**
 * Parse a DOCX buffer and extract text.
 */
async function parseDOCX(buffer) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
}

/**
 * Parse a TXT buffer (UTF-8).
 */
function parseTXT(buffer) {
    return buffer.toString('utf-8');
}

/**
 * Route to the correct parser based on MIME type.
 * Returns extracted text string.
 */
async function parseFile(buffer, mimetype, filename) {
    const ext = (filename || '').toLowerCase().split('.').pop();

    if (mimetype === 'application/pdf' || ext === 'pdf') {
        return await parsePDF(buffer);
    } else if (
        mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        ext === 'docx'
    ) {
        return await parseDOCX(buffer);
    } else if (mimetype === 'text/plain' || ext === 'txt') {
        return parseTXT(buffer);
    } else {
        throw new Error(`Unsupported file type: ${mimetype || ext}`);
    }
}

/**
 * Supported MIME types for upload validation.
 */
const SUPPORTED_MIMETYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
];

module.exports = {
    parseFile,
    parsePDF,
    parseDOCX,
    parseTXT,
    SUPPORTED_MIMETYPES,
};
