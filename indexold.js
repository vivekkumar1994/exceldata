const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const xlsx = require("xlsx");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json())

// MySQL Connection
// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: "",
//   database: 'exceldata', // Database name
// });
const db = mysql.createConnection({
  host: 'b2p0mztomibx61efhi61-mysql.services.clever-cloud.com',
  user: 'umijropjnyizeqc4',
  password: "IRPMNV9i2IKg5TNI5xkV",
  database: 'b2p0mztomibx61efhi61', // Database name
});

db.connect((err) => {
  if (err) throw err;
  console.log("Database connected successfully");
});

// Ensure Table
const createTable = `
CREATE TABLE IF NOT EXISTS exceldata (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  age INT,
  email VARCHAR(255)
)`;

db.query(createTable, (err) => {
  if (err) throw err;
  console.log("Table ensured");
});

// Multer Configuration
const upload = multer({ dest: 'uploads/' });

// Serve Static Files
app.use(express.static(path.join(__dirname, 'public')));

// File Upload Endpoint
app.post('/upload', upload.single('excelFile'), (req, res) => {
  try {
    const fileName = req.file.path;

    // Read Excel File
    const workbook = xlsx.readFile(fileName);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Map Data for Bulk Insert
    const values = data.map((row) => [row.name, row.age, row.email]);

    // Insert Query
    const insertQuery = `INSERT INTO exceldata (name, age, email) VALUES ?`;
    db.query(insertQuery, [values], (err) => {
      if (err) throw err;
      res.status(200).json({ message: "Data inserted successfully" });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


app.get("/alldata", (req, res) => {
  const fetchQuery = `SELECT * FROM exceldata`;
  db.query(fetchQuery, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
    res.status(200).json({
      message: "Data fetched successfully",
      data: results,
    });
  });

})

// Start Server
app.listen(5001, () => {
  console.log(`Server running on port 5001`);
});
