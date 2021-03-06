/*
* Plugin:  Codemirror Plugin
* Version: 1.0.0 (20.08.2018.)
*
* Author:  Marko Goricki, BiLog
* Mail:    mgoricki@gmail.com
* Twitter: @mgoricki
* Blog:    apexbyg.blogspot.com 
*
* Depends:
*    apex/debug.js 
*
* Changes:
*
* v.1.0.3 - 20191009 - setHeight and setWidth
* v.1.0.0 - 20180820 - Initial version
*
* Public Methods:
*
*   Get Options
*   $('#P2_EDITOR').codemirror_plugin('option');
*
*   Set Height
*   apex.item('P2_EDITOR').callbacks.setHeight('auto');
*   apex.item('P2_EDITOR').callbacks.setHeight('600'); -- in px
*   apex.item('P2_EDITOR').callbacks.setHeight('100%'); -- in %
*
* Notes:
*   - 
*
*/

// Custom Hint Function
/*
function customHint ( pEditor, pCallback, pOptions ) {
  var cur    = pEditor.getCursor(),
      token  = pEditor.getTokenAt(cur),
      search = token.string.trim();

  // pData has to be in the format:
  //   [
  //     type:      "string" (template, application_item, page_item, package, procedure, function, constant, variable, type, table, view),
  //     title:     "string",
  //     className: "string",
  //     completions: [
  //       { d: "string", r: "string" } or "string"
  //     ]
  //   ]
  function _success( pData ) {

    var type,
        completion,
        completions = [];
    for ( var i = 0; i < pData.length; i++ ) {
        type = pData[ i ];

        for ( var j = 0; j < type.completions.length; j++ ) {
            completion = type.completions[ j ];
            completions.push({
                text:        completion.r || completion,
                displayText: ( completion.d || completion ) + " (" + type.title + ")",
                className:   type.className,
                type:        type.type,
                hint:        _replaceCompletion
            });
        }
    }

    // sort our hint list by display value, but always use lower case, because PL/SQL is not case sensitive
    completions.sort( function( a, b ) {
        return a.displayText.toLowerCase().localeCompare( b.displayText.toLowerCase());
    });

    pCallback({
        list: completions,
        from: CodeMirror.Pos( cur.line, token.start ),
        to:   CodeMirror.Pos( cur.line, token.end )
    });

  } // _success


  function _replaceCompletion( pEditor, pSelf, pCompletion ) {

      var text = pCompletion.text,
          cursor,
          placeholders,
          placeholder,
          placeholderValues = {},
          cursorPlaceholderPos,
          newLinePos;

      // For package we automatically want to add "." at the end to immediately allow to enter a function/variable/...
      if ( pCompletion.type === "package" ) {

          text  += ".";

      } else if ( pCompletion.type === "procedure" || pCompletion.type === "function" ) {

          // For procedures and functions we automatically want to add () at the end and position the cursor
          // between the brackets

          text  += "()";
          cursor = {
              line: pSelf.from.line,
              ch:   pSelf.from.ch + text.length - 1
          };

      } else if ( pCompletion.type === "template" ) {

          // For templates, ask the user for a value for each placeholders in the format $xxx$ and replace
          // it in the text
          placeholders = text.match( /\$[a-z]{1,}\$/g );
          if ( placeholders ) {
              for ( var i = 0; i < placeholders.length; i++ ) {
                  placeholder = placeholders[ i ].substr( 1, placeholders[ i ].length - 2 );
                  if ( !placeholderValues.hasOwnProperty( placeholder ) && placeholder !== "cursor" ) {
                      placeholderValues[ placeholder ] = window.prompt( placeholder );
                  }
              }
              for ( placeholder in placeholderValues ) {
                  if ( placeholderValues.hasOwnProperty( placeholder )) {
                      text = text.replace( new RegExp( "\\$" + placeholder + "\\$", "gi" ), placeholderValues[ placeholder ]);
                  }
              }
          }
          // Indent each line of the template with spaces
          if ( pSelf.from.ch > 0 ) {
              text = text.replace( /\n/g, "\n" + new Array( pSelf.from.ch + 1 ).join( " " ));
          }
          // If the $cursor$ placeholder has been used, put the cursor at this position
          cursorPlaceholderPos = text.indexOf( "$cursor$" );
          if ( cursorPlaceholderPos !== -1 ) {
              newLinePos = text.lastIndexOf( "\n", cursorPlaceholderPos );
              if ( newLinePos !== - 1 ) {
                  cursor = {
                      line: pSelf.from.line + ( text.substr( 0, cursorPlaceholderPos ).match( /\n/g ) || [] ).length,
                      ch:   cursorPlaceholderPos - newLinePos - 1
                  };
              } else {
                  cursor = {
                      line: pSelf.from.line,
                      ch:   pSelf.from.ch + cursorPlaceholderPos
                  };
              }
              text = text.replace( /\$cursor\$/, "" );
          }
      }

      pEditor.replaceRange( text, pSelf.from, pSelf.to );

      if ( cursor ) {
          pEditor.doc.setCursor( cursor );
      }
  } // _replaceCompletion


  function _getPrevToken( pToken ) {    
    var prevToken = pEditor.getTokenAt({ line: cur.line, ch: pToken.start });
    if (pToken.string === "." ) {
      return prevToken;
    } else if ( prevToken.string === "." ) {
      return _getPrevToken( prevToken );
    } else {
      return null;
        
    }
    
  } // _getPrevToken


  // Check if we are dealing with a multi level object (ie. [schema.]package.procedure/function/... or schema.table/view/procedure/function)
  prevToken = _getPrevToken(token);
  if ( prevToken && prevToken.string !== "" ) {
      parentName      = prevToken.string;
      grandParentName = "";

      // In the case of a package, check if a schema has been specified
      prevToken = _getPrevToken( prevToken );
      if ( prevToken ) {
          grandParentName = prevToken.string;
      }

      // If a user has just entered a dot so far, don't use it to restrict the search
      if ( search === "." ) {
          search = "";
          token.start++;
      }

  } else if ( search.indexOf( ":" ) === 0 || search.indexOf( "&" ) === 0 ) {
      // If the token starts with ":" or "&" we expect it's a bind variable/substitution syntax and we want to code complete application and page items

      type = "item";

      // Remove the colon/and to not replace it later on
      search = search.substr( 1 );
      token.start++;

  } else {
      // Could be a database object or a template
      type = "";
  }

  // Only call the server if the user has entered at least one character
  if ( parentName || search ) {
      pOptions.dataCallback({
          type:        type,
          search:      search,
          parent:      parentName,
          grantParent: grandParentName
      }, _success );
  }
}; // end _customHint
*/
(function ($, util) {
  "use strict";

  var C_PLUGIN_NAME = "Code Mirror Editor";
  var C_TOOLBAR_CLASS = "codemirror-toolbar";
  var C_TOOLBAR_CLASS_READONLY = "codemirror-readonly";

  $.widget("apex.codemirror_plugin", {
    options : {
      itemName : null,
      readonly: false,
      ignoreChanged: false, // Warn On Unsaved Changes
      ajaxId: null,
      autocomplete: false,
      runInFullscreen: false
    },
    changed: false,
    baseId:  "aCodeMirrorPlugin",

    // init function
    _init : function () {
      var uiw = this;
      var vMasterOk = false;

      uiw.baseId = uiw.options.itemName;

      uiw._editor = 
        CodeMirror.fromTextArea(document.getElementById(uiw.options.itemName),
          {
            mode:"text/x-plsql",
            indentWithTabs: true,
            martIndent: true,
            lineNumbers: true,
            matchBrackets : true,
            textWrapping : false,
            autofocus: false,
            indentUnit: 2,
            smartIndent: true,
            tabSize: 2,
            viewportMargin: 5,
            readOnly: uiw.options.readonly,//"nocursor"
            extraKeys: {              
              "Ctrl-Space": "autocomplete",
              "F11": function(cm) {
                cm.setOption("fullScreen", !cm.getOption("fullScreen"));
              },            
              "Esc": function(cm) {
                if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
              }
            },
            autoCloseBrackets: true
          });


      // event handlers
      // if Warn on unsaved changes is set to Yes
      if (!uiw.options.ignoreChanged){
        uiw._editor.on('change', function(){
          uiw.changed = true;
          
          var vHistory$ = uiw._editor.historySize();
          $("#" + uiw.baseId + "_undo")[0].disabled = vHistory$.undo === 0;
          $("#" + uiw.baseId + "_redo")[0].disabled = vHistory$.redo === 0;
        });  
      }

      // code complete
            
      
      
      uiw._initToolbar();

      if (uiw.options.runInFullscreen){
        uiw._editor.setOption('fullScreen', true);
      }    

      // if Editor is readonly add class to the wrapper 
      if (uiw._editor.isReadOnly()){
        uiw.element.closest('.codemirror-wrapper').addClass(C_TOOLBAR_CLASS_READONLY);
      }    

      // autocomplete
      if (uiw.options.autocomplete){
        CodeMirror.commands.autocomplete = function(pEditor) {

          var modeOption = pEditor.doc.modeOption,
              hint,
              options = {};
                        
          switch (modeOption) {
              case "text/javascript": 
                hint = CodeMirror.hint.javascript; 
                break;
              case "text/css":        
                hint = CodeMirror.hint.css; 
                break;
              case "text/html":       
                hint = CodeMirror.hint.html; 
                break;
              case "text/x-plsql":
                hint = customHint;//uiw._customHint;
                options = {
                    async:        true,
                    dataCallback: function( pSearchOptions, pCallback ) {
                                    apex.server.plugin (uiw.options.ajaxId, {
                                      x01: "hint",
                                      x02: pSearchOptions.search,
                                      x03: pSearchOptions.parent,
                                      x04: pSearchOptions.grantParent
                                    }, {
                                      success: pCallback
                                    });  
                                  }                 
                };
                break;
          }

          if (hint)  {         
            CodeMirror.showHint( pEditor, hint, options );
          }
        };
      }    
      
    
      // Init APEX item
      apex.item.create(uiw.options.itemName, {
        // get validity
        getValidity: function() {
          var lValidity = { valid: true };
          /*
          if (  item is not valid  ) {
              lValidity.valid = false;
          }
          */
          return lValidity;
        },

        // get value
        getValue: function(){
          apex.debug.log('CodeMirror Plugin', 'getValue');
          return uiw._editor.doc.getValue();
        },

        // set value
        setValue: function(pValue){
          apex.debug.log('CodeMirror Plugin', 'setValue');
          uiw._editor.doc.setValue(pValue);
        },
        
        // disable
        disable: function(){
          uiw._disable();
        },
        
        // enable
        enable: function(){
          uiw._enable();
        },    
        
        // show
        show: function(){
          apex.debug.log('CodeMirror Plugin', 'Not implemented');
        },  
        
        // hide
        hide: function(){
          apex.debug.log('CodeMirror Plugin', 'Not implemented');
        },  
        
        // is changed        
        isChanged: function() {
          return uiw.changed;
        },

        // setHeight - can be 'auto', or number in px or number in %
        setHeight: function(pHeight){
          uiw._editor.setSize(null,pHeight);
        },

        // setWidth - can be 'auto', or number in px or number in %
        setWidth: function(pWidth){
          uiw._editor.setSize(pWidth,null);
        }        
                
      });    
    },
  
    // Log/Debug Function
    _log: function (pFunctionName, pLogMessage){
      apex.debug.log('Code Mirror', pFunctionName, pLogMessage);
      //console.log('Code Mirror', pFunctionName, pLogMessage);
    },
  
    _destroy: function(){
      var uiw = this;
      uiw._editor.off('change');
    },

    _renderButton: function(toolbar, id, label, icon, extraClasses, disabled ) {
      var uiw = this;
      toolbar.markup( "<button" )
            .attr( "id", uiw.baseId + "_" +id )
            .optionalAttr( "title", label)
            .optionalAttr( "aria-label", label)
            .optionalBoolAttr( "disabled", disabled )
            .attr( "class", "a-Button a-Button--noLabel a-Button--withIcon" + ( extraClasses ? " " + extraClasses : "" ) )
            .markup(" type='button'>" )
            .markup( "<span class='a-Icon " )
            .attr(icon)
            .markup( "' aria-hidden='true'></span></button>" );  
    },

    _initToolbar: function(){
      var uiw = this,
      toolbar = util.htmlBuilder();

      // internal toolbar function for adding button action
      function addAction(pCommand ) {
        $(document).on('click', "#" + uiw.baseId + "_" + pCommand, function() {
            if (uiw._editor) {
              uiw._editor.focus();
              switch (pCommand){
                case 'fullScreenOn':
                  uiw._editor.setOption("fullScreen", !uiw._editor.getOption("fullScreen"));
                  break;
                case 'fullScreenOff':
                  if (uiw._editor.getOption("fullScreen")) uiw._editor.setOption("fullScreen", false);
                  break;
                default:
                  setTimeout(function() {
                    uiw._editor.execCommand( pCommand );
                  }, 10);
                  break;
              }

            }
        } );
      }

      
      // generate toolbar markdown
      toolbar.markup('<div class="'+C_TOOLBAR_CLASS+'">');
      if(!uiw.options.readonly){
        uiw._renderButton(toolbar, 'undo', 'Undo' , 'icon-undo', 'a-Button--small a-Button--pillStart', true);
        uiw._renderButton(toolbar, 'redo', 'Redo' , 'icon-redo', 'a-Button--small a-Button--pill', true);
        addAction('undo');
        addAction('redo');                
      }  
      uiw._renderButton(toolbar, 'fullScreenOn' , 'Full Screen On' , 'icon-maximize', 'a-Button--small a-Button--pillEnd aCodeMirrorPluginFullScreenOn u-pullRight');
      uiw._renderButton(toolbar, 'fullScreenOff', 'Full Screen Off', 'icon-restore', 'a-Button--small a-Button--pillEnd aCodeMirrorPluginFullScreenOff u-pullRight');
      toolbar.markup('</div>');

      // generate actions
      addAction('fullScreenOn');
      addAction('fullScreenOff');

      uiw.element.after(toolbar.toString());
      uiw.element.closest('div').addClass('codemirror-wrapper');
      uiw.element.closest('div.t-Form-fieldContainer').addClass('codemirror-container-wrapper');
      
/*
      uiw.settingsMenu$ = $(toolbar);
      uiw.settingsMenu$.menu({
        items: [
          {
            type: "toggle", 
            labelKey: "Full Screen", 
            get: function(){
              alert('aaa');
            }
          }
        ]}
      );
      */
    },
    _enable: function(){
      var uiw = this;
      apex.debug.log(C_PLUGIN_NAME, '_enable');
      uiw._editor.setOption('readOnly', false);
      var wrapper$ = uiw.element.closest('.codemirror-wrapper');
      wrapper$.removeClass(C_TOOLBAR_CLASS_READONLY);
      wrapper$.find('.codemirror-toolbar > button[id$=undo]').prop('disabled', false);
      wrapper$.find('.codemirror-toolbar > button[id$=redo]').prop('disabled', false);
    },
    _disable: function(){
      var uiw = this;
      apex.debug.log(C_PLUGIN_NAME, '_disable');
      uiw._editor.setOption('readOnly', true);
      var wrapper$ = uiw.element.closest('.codemirror-wrapper');
      wrapper$.addClass(C_TOOLBAR_CLASS_READONLY);
      wrapper$.find('.codemirror-toolbar > button[id$=undo]').prop('disabled', true);
      wrapper$.find('.codemirror-toolbar > button[id$=redo]').prop('disabled', true);
    }


  });  

})(apex.jQuery, apex.util);


// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE
 
(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  CodeMirror.defineOption("fullScreen", false, function(cm, val, old) {
    if (old == CodeMirror.Init) old = false;
    if (!old == !val) return;
    if (val) setFullscreen(cm);
    else setNormal(cm);
  });

  function setFullscreen(cm) {
    var wrap = cm.getWrapperElement();
    $(wrap).closest('div.codemirror-wrapper').addClass('codemirror-wrapp-fullscreen');
    cm.state.fullScreenRestore = {scrollTop: window.pageYOffset, scrollLeft: window.pageXOffset,
                                  width: wrap.style.width, height: wrap.style.height};
    wrap.style.width = "";
    wrap.style.height = "auto";
    wrap.className += " CodeMirror-fullscreen";
    document.documentElement.style.overflow = "hidden";
    cm.refresh();
  }

  function setNormal(cm) {
    var wrap = cm.getWrapperElement();
    $(wrap).closest('div.codemirror-wrapper').removeClass('codemirror-wrapp-fullscreen');
    wrap.className = wrap.className.replace(/\s*CodeMirror-fullscreen\b/, "");
    document.documentElement.style.overflow = "";
    var info = cm.state.fullScreenRestore;
    wrap.style.width = info.width; wrap.style.height = info.height;
    window.scrollTo(info.scrollLeft, info.scrollTop);
    cm.refresh();
  }
});

//# sourceMappingURL=fullscreen.js.map

//# sourceMappingURL=codemirror_custom.js.map
