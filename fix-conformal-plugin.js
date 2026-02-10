// Vite plugin to fix the Conformal module exports issue
export default function fixConformalPlugin() {
  return {
    name: 'fix-conformal-exports',
    enforce: 'post',
    generateBundle(options, bundle) {
      for (const fileName in bundle) {
        const chunk = bundle[fileName];
        if (chunk.type === 'chunk' && chunk.code) {
          console.log(`Checking ${fileName} for Conformal exports...`);
          
          // Try to find and fix the pattern where an empty module object is created
          // after setting Tw.getConformal and Tw.getConformalJSON
          
          // First, find the position where we set Tw.getConformalJSON to a real value (not void 0)
          // We need the second occurrence
          const firstIdx = chunk.code.indexOf('Tw.getConformalJSON=');
          const idx = chunk.code.indexOf('Tw.getConformalJSON=', firstIdx + 1);
          if (idx > 0) {
            console.log('Found Tw.getConformalJSON= at position', idx);
            
            // Extract a snippet around this position
            const snippet = chunk.code.substring(idx, idx + 300);
            console.log('Snippet:', snippet.substring(0, 150));
            
            // Look for the pattern: Tw.getConformalJSON=XX;const YY=Object.freeze(Object.defineProperty({__proto__:null},Symbol.toStringTag,{value:"Module"}))
            const simplePattern = /Tw\.getConformalJSON=([A-Za-z_$][A-Za-z0-9_$]*);const\s+([A-Za-z_$][A-Za-z0-9_$]*)=Object\.freeze\(Object\.defineProperty\(\{__proto__:null\}/;
            const simpleMatch = chunk.code.substring(idx).match(simplePattern);
            
            if (simpleMatch) {
              console.log('Simple pattern matched!', simpleMatch[0]);
              const conformalJSONVar = simpleMatch[1];
              const emptyModuleVar = simpleMatch[2];
              
              // Now find getConformal variable by looking backwards
              const beforeIdx = chunk.code.lastIndexOf('Tw.getConformal=', idx);
              if (beforeIdx > 0) {
                const conformalSnippet = chunk.code.substring(beforeIdx, beforeIdx + 100);
                const conformalMatch = conformalSnippet.match(/Tw\.getConformal=([A-Za-z_$][A-Za-z0-9_$]*);/);
                if (conformalMatch) {
                  const conformalVar = conformalMatch[1];
                  console.log(`Variables: conformal=${conformalVar}, conformalJSON=${conformalJSONVar}, module=${emptyModuleVar}`);
                  
                  // Now replace the empty module definition with one that has the exports
                  const emptyModulePattern = new RegExp(
                    `const\\s+${emptyModuleVar}=Object\\.freeze\\(Object\\.defineProperty\\(\\{__proto__:null\\},Symbol\\.toStringTag,\\{value:"Module"\\}\\)\\)`,
                    'g'
                  );
                  
                  const newModuleDef = `const ${emptyModuleVar}=Object.freeze(Object.defineProperty({__proto__:null,getConformal:${conformalVar},getConformalJSON:${conformalJSONVar}},Symbol.toStringTag,{value:"Module"}))`;
                  
                  chunk.code = chunk.code.replace(emptyModulePattern, newModuleDef);
                  console.log('✓ Fixed Conformal module exports');
                }
              }
            } else {
              console.log('Simple pattern not matched');
            }
          } else {
            console.log('Tw.getConformalJSON= not found');
          }
        }
      }
    }
  };
}
