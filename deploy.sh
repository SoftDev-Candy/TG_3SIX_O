#!/bin/bash
# deploy.sh - Update and redeploy TG-3SIX-O journey page to Surge

echo "📄 Converting markdown files to PDF..."
if command -v pandoc &> /dev/null; then
    pandoc docs/EXECUTIVE_BRIEF.md -o journey-deploy/executive-brief.pdf
    pandoc docs/HACKATHON_NARRATIVE_PRD.md -o journey-deploy/narrative.pdf
    echo "✅ PDFs generated with pandoc"
else
    echo "⚠️  Pandoc not installed. PDFs will not be available."
    echo "   Install: sudo apt install pandoc wkhtmltopdf"
    echo "   Or convert manually at: https://www.markdowntopdf.com/"
    echo "   Continuing deployment with markdown files only..."
fi

echo "📦 Copying latest files to journey-deploy/..."
cp journey/journey.html journey-deploy/index.html
cp docs/EXECUTIVE_BRIEF.md journey-deploy/executive-brief.md
cp docs/HACKATHON_NARRATIVE_PRD.md journey-deploy/narrative.md

echo "🚀 Deploying to tg3sixo.surge.sh..."
npx surge journey-deploy tg3sixo.surge.sh

echo ""
echo "✅ Deployment complete!"
echo "🌐 Live at: https://tg3sixo.surge.sh"
echo ""
echo "📄 Files deployed:"
echo "   • index.html (journey showcase)"
echo "   • executive-brief.md $([ -f journey-deploy/executive-brief.pdf ] && echo '+ .pdf' || echo '(PDF pending)')"
echo "   • narrative.md $([ -f journey-deploy/narrative.pdf ] && echo '+ .pdf' || echo '(PDF pending)')"
