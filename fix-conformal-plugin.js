// Vite plugin to fix the Conformal module exports issue
// This plugin addresses a bundling issue where Vite's CommonJS plugin doesn't properly
// copy exports from the nested @bte-germany/terraconvert/lib/projection/resources/Conformal module
// into the module object used by ConformalEstimate, resulting in undefined function errors.
export default function fixConformalPlugin() {
  return {
    name: 'fix-conformal-exports',
    enforce: 'post',
    generateBundle(options, bundle) {
      for (const fileName in bundle) {
        const chunk = bundle[fileName];
        if (chunk.type === 'chunk' && chunk.code) {
          // Find the position where we set Tw.getConformalJSON to a real value (not void 0)
          // We need the second occurrence (first is the initialization to void 0)
          const firstIdx = chunk.code.indexOf('Tw.getConformalJSON=');
          const idx = chunk.code.indexOf('Tw.getConformalJSON=', firstIdx + 1);
          
          if (idx > 0) {
            // Look for the pattern: Tw.getConformalJSON=XX;const YY=Object.freeze(Object.defineProperty({__proto__:null},...))
            // This pattern indicates an empty module object that should contain the exports
            const simplePattern = /Tw\.getConformalJSON=([A-Za-z_$][A-Za-z0-9_$]*);const\s+([A-Za-z_$][A-Za-z0-9_$]*)=Object\.freeze\(Object\.defineProperty\(\{__proto__:null\}/;
            const simpleMatch = chunk.code.substring(idx).match(simplePattern);
            
            if (simpleMatch) {
              const conformalJSONVar = simpleMatch[1];
              const emptyModuleVar = simpleMatch[2];
              
              // Find the getConformal variable by looking backwards
              const beforeIdx = chunk.code.lastIndexOf('Tw.getConformal=', idx);
              if (beforeIdx > 0) {
                const conformalSnippet = chunk.code.substring(beforeIdx, beforeIdx + 100);
                const conformalMatch = conformalSnippet.match(/Tw\.getConformal=([A-Za-z_$][A-Za-z0-9_$]*);/);
                
                if (conformalMatch) {
                  const conformalVar = conformalMatch[1];
                  
                  // Replace the empty module definition with one that includes the exports
                  // Expected pattern: const Mg=Object.freeze(Object.defineProperty({__proto__:null},Symbol.toStringTag,{value:"Module"}))
                  // Replace with:     const Mg=Object.freeze(Object.defineProperty({__proto__:null,getConformal:EI,getConformalJSON:$s},Symbol.toStringTag,{value:"Module"}))
                  const emptyModulePattern = new RegExp(
                    `const\\s+${emptyModuleVar}=Object\\.freeze\\(Object\\.defineProperty\\(\\{__proto__:null\\},Symbol\\.toStringTag,\\{value:"Module"\\}\\)\\)`,
                    'g'
                  );
                  
                  const newModuleDef = `const ${emptyModuleVar}=Object.freeze(Object.defineProperty({__proto__:null,getConformal:${conformalVar},getConformalJSON:${conformalJSONVar}},Symbol.toStringTag,{value:"Module"}))`;
                  
                  const originalCode = chunk.code;
                  chunk.code = chunk.code.replace(emptyModulePattern, newModuleDef);
                  
                  // Verify the replacement was successful
                  if (chunk.code !== originalCode && chunk.code.includes(`getConformalJSON:${conformalJSONVar}`)) {
                    // Only log success in development mode
                    if (process.env.NODE_ENV !== 'production') {
                      console.log(`✓ Fixed Conformal module exports in ${fileName}`);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  };
}
