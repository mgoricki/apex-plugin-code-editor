--------------------------------------------------------
--  File created - Wednesday-September-19-2018   
--------------------------------------------------------
--------------------------------------------------------
--  DDL for Package PCK_CODE_EDITOR_PLUGIN
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE PACKAGE PCK_CODE_EDITOR_PLUGIN as 

  -----------------------------------------------------------------------------
  -- PROCEDURE p_render
  -- %usage: plugin render function
  procedure p_render (
    p_item   in            apex_plugin.t_item,
    p_plugin in            apex_plugin.t_plugin,
    p_param  in            apex_plugin.t_item_render_param,
    p_result in out nocopy apex_plugin.t_item_render_result
  );

  -----------------------------------------------------------------------------
  -- PROCEDURE p_ajax_call
  -- %usage: plugin ajax call for code completion    
  procedure p_ajax_call (
    p_item   in            apex_plugin.t_item,
    p_plugin in            apex_plugin.t_plugin,
    p_param  in            apex_plugin.t_item_ajax_param,
    p_result in out nocopy apex_plugin.t_item_ajax_result 
  );    

end pck_code_editor_plugin;
/
