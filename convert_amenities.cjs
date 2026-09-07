const fs = require('fs');
const content = fs.readFileSync('src/data/initialData.ts', 'utf8');

// Replace all amenities arrays with AmenityArticle format
const converted = content.replace(/amenities: \[([^\]]*)\]/g, (match, arr) => {
  const items = arr.split(',').map(s => s.trim()).filter(s => s);
  const articles = items.map((name, i) => {
    const cleaned = name.replace(/['"]/g, '').trim();
    return `{ id: 'amenity-${i}', name: '${cleaned}' }`;
  });
  return 'amenities: [' + articles.join(', ') + ']';
});

fs.writeFileSync('src/data/initialData.ts', converted, 'utf8');
console.log('Done. Converted amenities arrays.');
