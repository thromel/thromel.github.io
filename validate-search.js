const fs = require('fs');

// Simple validation script for search functionality
console.log('🔍 Validating search implementation...\n');

// Check if search files exist
const files = [
    'search.json',
    'assets/js/search.js',
    'assets/css/search.css'
];

let allFilesExist = true;

files.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} exists`);
    } else {
        console.log(`❌ ${file} missing`);
        allFilesExist = false;
    }
});

// Check if search.json is valid JSON template
try {
    const searchJsonContent = fs.readFileSync('search.json', 'utf8');
    
    // Check for Jekyll liquid syntax
    const hasLiquidSyntax = searchJsonContent.includes('{% for') && 
                          searchJsonContent.includes('{{') &&
                          searchJsonContent.includes('| jsonify');
    
    if (hasLiquidSyntax) {
        console.log('✅ search.json contains proper Jekyll liquid syntax');
    } else {
        console.log('❌ search.json missing Jekyll liquid syntax');
    }
} catch (error) {
    console.log('❌ Error reading search.json:', error.message);
}

// Check if navbar includes search button
try {
    const navbarContent = fs.readFileSync('_includes/navbar.html', 'utf8');
    
    if (navbarContent.includes('search-button') && navbarContent.includes('openSearchModal')) {
        console.log('✅ Navbar includes search button');
    } else {
        console.log('❌ Navbar missing search button');
    }
} catch (error) {
    console.log('❌ Error reading navbar.html:', error.message);
}

// Check if layout includes search files
try {
    const layoutContent = fs.readFileSync('_layouts/default.html', 'utf8');
    
    const hasSearchCSS = layoutContent.includes('search.css');
    const hasSearchJS = layoutContent.includes('search.js');
    
    if (hasSearchCSS && hasSearchJS) {
        console.log('✅ Layout includes search CSS and JS');
    } else {
        console.log('❌ Layout missing search files');
    }
} catch (error) {
    console.log('❌ Error reading default.html:', error.message);
}

console.log('\n🎉 Search implementation validation complete!');

if (allFilesExist) {
    console.log('\n📋 Next steps:');
    console.log('1. Run `bundle exec jekyll serve` to test locally');
    console.log('2. Open the site and try:');
    console.log('   - Click the search button in navbar');
    console.log('   - Press Ctrl+K (or Cmd+K on Mac)');
    console.log('   - Type to search posts, projects, publications, and news');
    console.log('3. Use arrow keys to navigate results, Enter to select');
}