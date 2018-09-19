# APEX Code Editor Plugin
APEX (5.1+) Plugin built by using [Code Mirror](https://codemirror.net/) JavaScript Library (version 5.34.0).

# Features
  - Readonly Mode
  - Fullscreen mode (F11 or icon click to turn it on/Esc or icon click to turn it off)
  - Bracket matching
  - Line numbers
  - PL/SQL mode
  - Undo/Redo


# Changelog

1.0.0 Beta 20180919 - Initial Release

# Install

- Import plugin file item_type_plugin_com_apexbyg_blogspot_codemirror.sql

- (Optional) To optimize performance upload static files (CSS and JS) from server directory to Webserver and change File Prefix to point on server directory

- (Optional) Compile package pck_advanced_plugin (from source) in DB schema (available to APEX parsing schema) and change parameter Render Procedure/Function Name to pck_advanced_plugin.p_render_item

# Settings

Currently there's no custom parameters. 

# Notes

Plugin is still in Beta version supporting only PL/SQL 

# Demo