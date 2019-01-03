--------------------------------------------------------
--  File created - Wednesday-September-19-2018   
--------------------------------------------------------
--------------------------------------------------------
--  DDL for Package Body PCK_CODE_EDITOR_PLUGIN
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE PACKAGE BODY "PLUGINS"."PCK_CODE_EDITOR_PLUGIN" as

  -----------------------------------------------------------------------------
  -- PROCEDURE p_render
  -- %usage: plugin render function
  procedure p_render (
    p_item   in            apex_plugin.t_item,
    p_plugin in            apex_plugin.t_plugin,
    p_param  in            apex_plugin.t_item_render_param,
    p_result in out nocopy apex_plugin.t_item_render_result) 
  as
    v_js_code  varchar2(4000);
    v_readonly varchar2(100);
  begin
    --apex_Debug.enable;

    -- debug
    if apex_application.g_debug then
      apex_plugin_util.debug_page_item(p_plugin              => p_plugin
                                     , p_page_item           => p_item);
    end if;

    if p_param.is_readonly then
      v_readonly := 'nocursor';
    else
      v_readonly := 'false';    
    end if;

    -- output item
    sys.htp.prn('<textarea id="'||p_item.name||'" name="'||p_item.name||'">'||sys.htf.escape_sc(p_param.value)||'</textarea>');

    -- add files
    apex_javascript.add_library (
       p_name                    => 'lib/codemirror/codemirror'
      ,p_directory               => p_plugin.file_prefix
      ,p_version                 => null
      ,p_check_to_add_minified   => false
      ,p_skip_extension          => false
      );

    apex_javascript.add_library (
       p_name                    => 'lib/codemirror/mode/sql/sql'
      ,p_directory               => p_plugin.file_prefix
      ,p_version                 => null
      ,p_check_to_add_minified   => false
      ,p_skip_extension          => false
      );      

    apex_javascript.add_library (
       p_name                    => 'js/plugins/codemirror/addon/display/fullscreen'
      ,p_directory               => p_plugin.file_prefix
      ,p_version                 => null
      ,p_check_to_add_minified   => true
      ,p_skip_extension          => false
      );     

    apex_javascript.add_library (
       p_name                    => 'lib/codemirror/addon/edit/closebrackets'
      ,p_directory               => p_plugin.file_prefix
      ,p_version                 => null
      ,p_check_to_add_minified   => false
      ,p_skip_extension          => false
      );           

    apex_javascript.add_library (
       p_name                    => 'lib/codemirror/addon/hint/show-hint'
      ,p_directory               => p_plugin.file_prefix
      ,p_version                 => null
      ,p_check_to_add_minified   => false
      ,p_skip_extension          => false
      );           

    apex_javascript.add_library (
       p_name                    => 'js/plugins/codemirror/codemirror_custom'
      ,p_directory               => p_plugin.file_prefix
      ,p_version                 => null
      ,p_check_to_add_minified   => true
      ,p_skip_extension          => false
      ); 


    -- CSS  
    apex_css.add_file (
       p_name           => 'lib/codemirror/codemirror'
      ,p_directory      => p_plugin.file_prefix
      ,p_version        => null
      ,p_skip_extension => false); 

    apex_css.add_file (
       p_name           => 'lib/codemirror/addon/hint/show-hint'
      ,p_directory      => p_plugin.file_prefix
      ,p_version        => null
      ,p_skip_extension => false);      

    apex_css.add_file (
       p_name           => 'css/plugins/codemirror/codemirror_custom'
      ,p_directory      => p_plugin.file_prefix
      ,p_version        => null
      ,p_skip_extension => false);


    v_js_code := 'apex.jQuery("textarea#'||p_item.name||'").codemirror_plugin({'||
      apex_javascript.add_attribute('readonly', p_param.is_readonly, p_add_comma => true)||
      apex_javascript.add_attribute('ignoreChanged', p_item.ignore_change, p_add_comma => true)||
      apex_javascript.add_attribute('ajaxId', apex_plugin.get_ajax_identifier, p_add_comma => true)||
      apex_javascript.add_attribute('runInFullscreen', (case when p_item.attribute_01 = 'Y' then true else false end), p_add_comma => true)||      
      apex_javascript.add_attribute('itemName', p_item.name, p_add_comma => false)||
    '});';
    apex_javascript.add_onload_code (p_code => v_js_code);      
  end p_render;

  -----------------------------------------------------------------------------
  -- PROCEDURE p_ajax_call
  -- %usage: plugin ajax call for code completion    
  procedure p_ajax_call (
    p_item   in            apex_plugin.t_item,
    p_plugin in            apex_plugin.t_plugin,
    p_param  in            apex_plugin.t_item_ajax_param,
    p_result in out nocopy apex_plugin.t_item_ajax_result )
 is
   v_owner  varchar2(100) := upper(apex_application.g_x04);
   v_object varchar2(100) := upper(apex_application.g_x03);   
 begin
   null;
   /*
   sys.htp.prn(
   '[{"type":"constant","title":"Constant","completions":[
"c_must_not_be_public_user"
,"c_install_script"
,"c_upgrade_script"
,"c_deinstall_script"
,"c_output_as_dbms_output"
,"c_output_as_file"
, "'||apex_application.g_x01||'"
, "search='||apex_application.g_x02||'"
, "parent='||apex_application.g_x03||'"
, "grantParent'||apex_application.g_x04||'"
]}]'
   );*/
   sys.htp.prn('[{"type":"constant","title":"Constant","completions":[');
   sys.htp.prn('"owner = '||v_owner||'", "object = '||v_object || '"');
   for i in (select * 
               from all_objects
              where (v_owner is null or owner = 'GDE')
                and (v_object is null or object_name like v_object||'%')
                and rownum<10)
    loop
      sys.htp.prn(',"'||i.object_name||'"');
    end loop;
    sys.htp.prn(']}]');
 end p_ajax_call;

end pck_code_editor_plugin;
