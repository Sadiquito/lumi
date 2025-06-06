const fs = require('fs');
const path = require('path');

// Find all TypeScript/TSX files
function findTSFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && item !== 'node_modules') {
      files.push(...findTSFiles(fullPath));
    } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Extract imports from a file
function extractImports(fileContent) {
  const importRegex = /import\s+(?:.*\s+from\s+)?['"`]([^'"`]+)['"`]/g;
  const imports = [];
  let match;
  
  while ((match = importRegex.exec(fileContent)) !== null) {
    imports.push(match[1]);
  }
  
  return imports;
}

// Check if import path exists
function checkImportExists(importPath, fromFile) {
  if (importPath.startsWith('.')) {
    // Relative import
    const basePath = path.dirname(fromFile);
    const fullPath = path.resolve(basePath, importPath);
    
    // Try with different extensions
    const extensions = ['', '.ts', '.tsx', '.js', '.jsx'];
    for (const ext of extensions) {
      const testPath = fullPath + ext;
      if (fs.existsSync(testPath)) {
        return true;
      }
    }
    
    // Try as directory with index file
    for (const ext of ['/index.ts', '/index.tsx', '/index.js']) {
      if (fs.existsSync(fullPath + ext)) {
        return true;
      }
    }
    
    return false;
  }
  
  // Node modules or absolute imports - assume they exist
  return true;
}

// Main validation
console.log('🔍 Validating imports...\n');

const tsFiles = findTSFiles('src');
let totalFiles = 0;
let totalImports = 0;
let brokenImports = [];

for (const file of tsFiles) {
  totalFiles++;
  const content = fs.readFileSync(file, 'utf8');
  const imports = extractImports(content);
  totalImports += imports.length;
  
  for (const importPath of imports) {
    if (!checkImportExists(importPath, file)) {
      brokenImports.push({
        file: file.replace(process.cwd() + '/', ''),
        import: importPath
      });
    }
  }
}

console.log(`📊 Scanned ${totalFiles} files with ${totalImports} total imports`);

if (brokenImports.length === 0) {
  console.log('✅ All imports are valid!');
} else {
  console.log(`❌ Found ${brokenImports.length} broken imports:`);
  for (const broken of brokenImports) {
    console.log(`  ${broken.file}: import '${broken.import}'`);
  }
} 