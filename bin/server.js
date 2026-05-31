#!/usr/bin/env node
'use strict';

const express = require('express');
const path = require('path');
const { computeFullChart } = require('../src');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/chart', (req, res) => {
  try {
    const input = {
      year: Number(req.query.year),
      month: Number(req.query.month),
      day: Number(req.query.day),
      hour: Number(req.query.hour),
      minute: Number(req.query.minute || 0),
      city: req.query.city || '北京市区',
      sex: req.query.sex || '男',
      name: req.query.name || '',
    };

    if (!input.year || !input.month || !input.day || isNaN(input.hour)) {
      return res.status(400).json({ error: '请提供完整的出生日期和时间' });
    }

    const chart = computeFullChart(input);
    res.json(chart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`已泰八字 Web UI → http://localhost:${PORT}`);
});
