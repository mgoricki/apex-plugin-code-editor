-- create tables
create table code_editor_demo (
    id                             number generated by default on null as identity 
                                   constraint code_editor_demo_id_pk primary key,
    code_clob                      clob,
    code_varchar                   varchar2(4000 char)
)
;
