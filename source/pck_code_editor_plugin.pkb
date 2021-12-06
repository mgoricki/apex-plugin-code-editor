create or replace PACKAGE BODY PCK_CODE_EDITOR_PLUGIN 
as

  gc_scope_prefix constant varchar2(31) := lower($$plsql_unit) || '.';
  
  -----------------------------------------------------------------------------
  -- PROCEDURE p_render
  -- %usage: plugin render function
  procedure p_render (
    p_item   in            apex_plugin.t_item,
    p_plugin in            apex_plugin.t_plugin,
    p_param  in            apex_plugin.t_item_render_param,
    p_result in out nocopy apex_plugin.t_item_render_result
  ) 
  as
    v_js_code  varchar2(4000);
    v_readonly varchar2(100);
    v_autocomplete_hints  varchar2(32676);
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
       p_name                    => 'js/codemirror_custom'
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
       p_name           => 'css/codemirror_custom'
      ,p_directory      => p_plugin.file_prefix
      ,p_version        => null
      ,p_skip_extension => false);

    if p_item.attribute_03 is not null then    
      v_autocomplete_hints := apex_plugin_util.get_plsql_function_result(p_item.attribute_03);
      apex_javascript.add_inline_code('var vAutocompleteHints_'||p_item.name||' = '||v_autocomplete_hints);
    end if;

    v_js_code := 'apex.jQuery("textarea#'||p_item.name||'").codemirror_plugin({"config":';
    
    if p_item.init_javascript_code is not null then
      v_js_code := v_js_code||'('||p_item.init_javascript_code||')';
    end if;

    v_js_code := v_js_code||'({}),';
    
    v_js_code :=  v_js_code ||        
      apex_javascript.add_attribute('readonly', p_param.is_readonly, p_add_comma => true)||
      apex_javascript.add_attribute('ignoreChanged', p_item.ignore_change, p_add_comma => true)||
      apex_javascript.add_attribute('ajaxId', apex_plugin.get_ajax_identifier, p_add_comma => true)||
      apex_javascript.add_attribute('runInFullscreen', (case when p_item.attribute_01 = 'Y' then true else false end), p_add_comma => true)||      
      apex_javascript.add_attribute('autocomplete', (case when p_item.attribute_02 = 'Y' then true else false end), p_add_comma => true)||
      apex_javascript.add_attribute('validateCode', (case when p_item.attribute_04 = 'Y' then true else false end), p_add_comma => true)      
   ;  
   
   if v_autocomplete_hints is not null then
    v_js_code :=  v_js_code || '"autocompleteHints":vAutocompleteHints_'||p_item.name||','; 
   end if; 
    v_js_code :=  v_js_code || apex_javascript.add_attribute('itemName', p_item.name, p_add_comma => false)||
    '});';
    apex_javascript.add_onload_code (p_code => v_js_code);      
  end p_render;
  
  -----------------------------------------------------------------------------
  -- FUNCITON f_validate_code
  -- %usage: validates PL/SQL code
  function f_validate_code(
      p_code  varchar2
    , p_hints varchar2
  )
    return varchar2
  is
    v_scope  logger_logs.scope%type := gc_scope_prefix || 'f_validate_code';
    v_params logger.tab_param;  

    v_return  varchar2(32767);
    v_dummy   varchar2(32767);
    v_code    varchar2(32767);
  begin
    logger.append_param(v_params, 'p_code', p_code);
    logger.append_param(v_params, 'p_hints', p_hints);    
    logger.log('START', v_scope, null, v_params);  
    
    /*
with json as
( select '[{
"text":":P$TEST_PARAM"
,"displayText":"P$TEST_PARAM - with descripto"
}
,{
"text":":PR$PARAM_TEST"
,"displayText":"PR$PARAM_TEST - with descripton"
}]' doc
  from   dual
)
select x.*
  from json_table((select doc from json) , '$[*]'
                 columns (  
                    text          path '$.text'
                  , display_text  path '$.displayText'  
                        
                )
               ) x;    
    */    
    
    begin
      if instr(lower(p_code), 'return') = 0 then
        v_return := apex_lang.message('PLUGIN.CODEMIRROR.MISSING_RETURN');
        if v_return = 'PLUGIN.CODEMIRROR.MISSING_RETURN' then
          v_return := 'Missing RETURN statement!';
        end if;
        return v_return;
      end if;
      v_code := 'declare l_dummy varchar2(32767); function x1x2x return varchar2 is begin ' ||
                        p_code || unistr('\000a') ||
                        'return null; end; begin l_dummy := x1x2x; end;';    
      declare
        v_cursor_name integer;
      begin
          v_cursor_name := dbms_sql.open_cursor;
          dbms_sql.parse(v_cursor_name, v_code, dbms_sql.native);
          dbms_sql.close_cursor(v_cursor_name);
      exception
        when others then
          dbms_sql.close_cursor(v_cursor_name);
          raise;
      end;         
    exception
      when others then
        v_return := apex_escape.html(sqlerrm);        
    end;
    
    logger.log('END v_return = '||v_return, v_scope);
    return v_return;
  end f_validate_code;

  -----------------------------------------------------------------------------
  -- PROCEDURE p_ajax_call
  -- %usage: plugin ajax call for code completion    
  procedure p_ajax_call (
    p_item   in            apex_plugin.t_item,
    p_plugin in            apex_plugin.t_plugin,
    p_param  in            apex_plugin.t_item_ajax_param,
    p_result in out nocopy apex_plugin.t_item_ajax_result 
  )
  is
    v_scope  logger_logs.scope%type := gc_scope_prefix || 'p_ajax_call';
    v_params logger.tab_param;  
  
  
    v_response  varchar2(32767);
    v_binds     apex_plugin_util.t_bind_list := apex_plugin_util.c_empty_bind_list; 
    v_autocomplete_hints  varchar2(32676);
    
    -- internal response message
    procedure p_msg (
        p_msg       varchar2
      , p_msg_type  varchar2 default 'S'
    )
    is
    begin
       apex_json.flush;
       apex_json.initialize_clob_output;
       apex_json.open_object;
       apex_json.write('msgType', p_msg_type);
       apex_json.write('msg', p_msg);         
       apex_json.close_object;  
       sys.htp.init;
       sys.htp.prn(apex_json.get_clob_output);
       apex_json.free_output;
    end p_msg;
  begin
    logger.log('START', v_scope, null, v_params);  
  
    case
      when apex_application.g_x01 = 'VALIDATE' then
        v_binds(1).name := 'CODE';
        v_binds(1).value := apex_application.g_x02;
        
        -- add hints to validate
        if p_item.attribute_03 is not null then  
          if instr(lower(p_item.attribute_05), ':hints') > 0 then
            v_autocomplete_hints := apex_plugin_util.get_plsql_function_result(p_item.attribute_03);        
            v_binds(2).name := 'HINTS';
            v_binds(2).value := v_autocomplete_hints;
          end if;          
        end if;  
        
        --v_response := f_validate_code(apex_application.g_x02);        
        v_response := apex_plugin_util.get_plsql_function_result(
            p_plsql_function => p_item.attribute_05
          , p_bind_list => v_binds  
        );
        if v_response is null then
          v_response := apex_lang.message('PLUGIN.CODEMIRROR.VAL_SUCCESSFUL');
          if v_response = 'PLUGIN.CODEMIRROR.VAL_SUCCESSFUL' then
            v_response := 'Validation successful';
          end if;
          p_msg(v_response);          
        else
          p_msg(v_response, 'E');
        end if;
      else
        raise_application_error(-20001, 'Unknown request type: '||apex_application.g_x01);
    end case;
    logger.log('END v_response: '||v_response, v_scope);        
  exception
    when others then
      logger.log('END error: '||sqlerrm, v_scope);    
      p_msg(sqlerrm, 'E');      
 end p_ajax_call;

end pck_code_editor_plugin;
/
