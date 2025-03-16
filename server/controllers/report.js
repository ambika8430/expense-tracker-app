const express = require('express');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const { Expense } = require('../models/association');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION
});

exports.getReport = async (req, res) => {
  try {
    // 1. Fetch user expenses from DB
    const expenses = await Expense.findAll({ where: { userId: req.user.id } });

    // 2. Convert data to CSV format
    const csvData = expenses.map(exp => `${exp.id},${exp.item},${exp.category},${exp.amount},${exp.date}`).join("\n");
    const fileName = `expense-report-${req.user.id}-${Date.now()}.csv`;
    const filePath = path.join(__dirname, fileName);

    // 3. Save CSV file temporarily
    fs.writeFileSync(filePath, "ID,Amount,Description,Date\n" + csvData);

    // 4. Upload to S3
    const fileStream = fs.createReadStream(filePath);
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `reports/${fileName}`,
      Body: fileStream,
      ContentType: 'text/csv'
    };

    const uploadResult = await s3.upload(uploadParams).promise();

    // 5. Cleanup local file
    fs.unlinkSync(filePath);

    // 6. Send the S3 URL to frontend
    res.status(200).json({ url: uploadResult.Location });

  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ message: 'Failed to generate report' });
  }
}