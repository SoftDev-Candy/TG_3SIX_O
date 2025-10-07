#!/usr/bin/env node
// generate-pdfs.js - Convert markdown files to PDF
const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const files = [
  { input: 'docs/EXECUTIVE_BRIEF.md', output: 'journey-deploy/executive-brief.pdf' },
  { input: 'docs/HACKATHON_NARRATIVE_PRD.md', output: 'journey-deploy/narrative.pdf' }
];

async function generatePDFs() {
  console.log('📄 Generating PDFs from markdown files...\n');

  for (const file of files) {
    try {
      console.log(`Converting ${file.input}...`);
      
      // Try md-to-pdf first
      await execAsync(`npx -y md-to-pdf ${file.input} --output ${file.output}`);
      
      if (fs.existsSync(file.output)) {
        const stats = fs.statSync(file.output);
        console.log(`✅ Generated ${file.output} (${(stats.size / 1024).toFixed(1)}KB)\n`);
      }
    } catch (error) {
      console.log(`⚠️  md-to-pdf failed for ${file.input}`);
      console.log(`   Try manual conversion: https://www.markdowntopdf.com/\n`);
    }
  }

  console.log('✅ PDF generation complete!');
}

generatePDFs().catch(console.error);
