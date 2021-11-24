# APEX Code Editor Plugin
APEX (21.2+) Plugin built by using [Code Mirror](https://codemirror.net/) JavaScript Library (version 5.64.0).

# Features
  - Readonly Mode
  - Fullscreen mode (F11 or icon click to turn it on/Esc or icon click to turn it off)
  - Bracket matching
  - Line numbers
  - PL/SQL mode
  - Undo/Redo
  - Autocomplete


# Changelog

- 1.0.0 20180919 - Initial Release
- 1.0.1 20180920 - Added support for disable/enable DA
- 1.0.2 20190103 - Run in fullscreen mode attribute
- 1.0.3 20191009 - setHeight
- 1.0.4 20211124 - New CodeMirror Version (5.64.0), autocomplete, minor CSS fixes for APEX 21.2

# Install

- Import plugin file item_type_plugin_com_apexbyg_blogspot_codemirror.sql

- (Optional) To optimize performance upload static files (CSS and JS) from server/nitro/dist directory to Webserver and change File Prefix to point on server directory

- (Optional) Compile package pck_code_editor_plugin (from source directory) in DB schema (available to APEX parsing schema) and change parameter Render Procedure/Function Name to pck_code_editor_plugin.p_render

# Settings

## Set Height

You can set height dynamicall by running:
```javascript
apex.item('P2_EDITOR').callbacks.setHeight('500');
```
where P2_EDITOR is static ID of the plugin item.

The value can be number (in pixels), 'auto' or number with percentage.
```javascript
apex.item('P2_EDITOR').callbacks.setHeight('500');
apex.item('P2_EDITOR').callbacks.setHeight('100%');
apex.item('P2_EDITOR').callbacks.setHeight('auto');
```

You can also set height with CSS:
```css
#P2_EDITOR_CONTAINER .CodeMirror{
  height:800px
}
```
where P2_EDITOR is static ID of the plugin item.

# Notes

Plugin is still in Beta version supporting only PL/SQL syntax highlighting.

You can also find older APEX versions of the plugin in source directory but it's not upgraded from version 1.0.0.

# Demo

Demo is available [here](https://apex.oracle.com/pls/apex/f?p=100309:55).