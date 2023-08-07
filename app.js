const express = require('express');
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs').promises;

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.post('/upload', upload.single('pdfFile'), async (req, res) => {
    try {
        const pdfBytes = req.file.buffer;
        const pdfDoc = await PDFDocument.load(pdfBytes);

        const pageCount = pdfDoc.getPageCount();
        for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
            const newDoc = await PDFDocument.create();
            const [newPage] = await newDoc.copyPages(pdfDoc, [pageIndex]);
            newDoc.addPage(newPage);

            const newPdfBytes = await newDoc.save();
            await fs.writeFile(`public/output/page_${pageIndex + 1}.pdf`, newPdfBytes);
        }

        res.send(`PDF split into ${pageCount} pages.`);
    } catch (error) {
        res.status(500).send('An error occurred while processing the PDF.');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
