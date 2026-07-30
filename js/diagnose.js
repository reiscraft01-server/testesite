(function() {
  var D = Document.prototype;
  var desc = Object.getOwnPropertyDescriptor(D, 'adoptedStyleSheets');

  if (!desc || !desc.set) {
    console.log('[DIAG] adoptedStyleSheets not supported in this browser');
    return;
  }

  var origSet = desc.set;
  var origGet = desc.get;

  Object.defineProperty(document, 'adoptedStyleSheets', {
    set: function(val) {
      console.group('%c[DIAG] adoptedStyleSheets SET', 'background:#333;color:#ff0;font-weight:bold');
      console.log('Timestamp:', new Date().toISOString());
      console.log('Value:', val);
      if (val && val.length) {
        for (var i = 0; i < val.length; i++) {
          try {
            var rules = val[i].cssRules || val[i].rules;
            if (rules) {
              for (var j = 0; j < rules.length; j++) {
                console.log('  Rule #' + j + ':', rules[j].cssText);
              }
            }
          } catch(e) {
            console.log('  Sheet #' + i + ': (cannot read rules)', e.message);
          }
        }
      }
      console.log('Stack:', new Error().stack);
      console.groupEnd();
      return origSet.call(document, val);
    },
    get: function() {
      var sheets = origGet.call(document);
      if (sheets && sheets.length) {
        console.log('[DIAG] adoptedStyleSheets GET (length=' + sheets.length + ')');
      }
      return sheets;
    },
    configurable: true,
    enumerable: true
  });

  var existing = document.adoptedStyleSheets;
  if (existing && existing.length) {
    console.log('[DIAG] Found ' + existing.length + ' adopted sheets already present at script load');
    for (var i = 0; i < existing.length; i++) {
      try {
        var rules = existing[i].cssRules || existing[i].rules;
        if (rules) {
          for (var j = 0; j < rules.length; j++) {
            console.log('  Existing rule #' + j + ':', rules[j].cssText);
          }
        }
      } catch(e) {
        console.log('  Existing sheet #' + i + ': (cannot read rules)', e.message);
      }
    }
  }
})();
