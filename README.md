# APEX Code Editor Plugin
APEX (18.1+) Plugin built by using [Code Mirror](https://codemirror.net/) JavaScript Library (version 5.34.0).

# Features
  - Readonly Mode
  - Fullscreen mode (F11 or icon click to turn it on/Esc or icon click to turn it off)
  - Bracket matching
  - Line numbers
  - PL/SQL mode
  - Undo/Redo


# Changelog

- 1.0.0 20180919 - Initial Release
- 1.0.1 20180920 - Added support for disable/enable DA

# Install

- Import plugin file item_type_plugin_com_apexbyg_blogspot_codemirror.sql

- (Optional) To optimize performance upload static files (CSS and JS) from server/nitro/dist directory to Webserver and change File Prefix to point on server directory

- (Optional) Compile package pck_code_editor_plugin (from source directory) in DB schema (available to APEX parsing schema) and change parameter Render Procedure/Function Name to pck_code_editor_plugin.p_render

# Settings

Currently there's no custom parameters. 

# Notes

Plugin is still in Beta version supporting only PL/SQL and only some features.

You can also find 5.1 version in source directory but it's not upgraded from version 1.0.0.

# Demo

Demo is available [here](https://apex.oracle.com/pls/apex/f?p=100309:55).