const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfkit');
const stream = require('stream');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/resume_builder', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const ResumeSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    experience: String,
    education: String
});

const Resume = mongoose.model('Resume', ResumeSchema);

app.post('/api/resume', async (req, res) => {
    const { name, email, phone, experience, education } = req.body;
    const resume = new Resume({ name, email, phone, experience, education });
    await resume.save();
    res.json({ success: true, resume });
});

app.post('/api/download', async (req, res) => {
    const resume = await Resume.findOne().sort({ _id: -1 }); // Get the most recent resume
    if (!resume) return res.status(404).send('No resume found');

    const doc = new PDFDocument();
    const pdfStream = new stream.PassThrough();
doc.pipe(pdfStream);

// Set the font size and align the name at the center
doc.fontSize(25).text(resume.name, { align: 'center' });
doc.moveDown(1); // Move down a line for spacing

// Set the font size for the rest of the text
doc.fontSize(20);

// Display Email
doc.font('Helvetica-Bold').text('Email:', { align: 'left' }); // Set headline to bold
doc.font('Helvetica').text(resume.email); // Regular text
doc.moveDown(0.5); // Move down a little for spacing

// Display Phone
doc.font('Helvetica-Bold').text('Phone:', { align: 'left' }); // Set headline to bold
doc.font('Helvetica').text(resume.phone); // Regular text
doc.moveDown(0.5);

// Display Experience
doc.font('Helvetica-Bold').text('Experience:', { align: 'left' }); // Set headline to bold
doc.font('Helvetica').fontSize(15).text(resume.experience, { align: 'left' });
doc.moveDown(0.5);

// Display Education
doc.font('Helvetica-Bold').fontSize(20).text('Education:', { align: 'left' }); // Set headline to bold
doc.font('Helvetica').fontSize(15).text(resume.education, { align: 'left' });

// End the PDF generation process
doc.end();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=resume.pdf');

    pdfStream.pipe(res);
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
