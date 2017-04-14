const PDFDocument = require('pdfkit');

module.exports = function convertToPDF(firstName, lastName, imgBuffer) {
  return new Promise((filfull, reject) => {
    let doc = new PDFDocument();

    doc.fontSize(30).image(imgBuffer).text(`${firstName} ${lastName}`);
    doc.end();

    filfull(doc);   
  });
};