; vim: set ft=nasm:
bits 64
%define USE_CRC32C_HASH 1
%define HASH_END_TYP byte
%include "header64.asm"
dynamic.needed:
    dq 1;DT_NEEDED
    dq (_symbols.libgdk_3 - _strtab)
    dq 1;DT_NEEDED
    dq (_symbols.libgobject_2 - _strtab)
    dq 1;DT_NEEDED
    dq (_symbols.libgtk_3 - _strtab)
    dq 1;DT_NEEDED
    dq (_symbols.libgl - _strtab)
dynamic.symtab:
    dq DT_SYMTAB        ; d_tag
    dq 0                ; d_un.d_ptr
dynamic.end:
%ifndef UNSAFE_DYNAMIC
    dq DT_NULL
%endif
[section .rodata.neededlibs]
global _strtab
_strtab:
	_symbols.libgdk_3: db "libgdk-3.so.0",0
	_symbols.libgobject_2: db "libgobject-2.0.so.0",0
	_symbols.libgtk_3: db "libgtk-3.so.0",0
	_symbols.libgl: db "libGL.so.1",0
[section .data.smolgot]
global _symbols
_symbols:
global gdk_display_get_default
gdk_display_get_default:
		_symbols.libgdk_3.gdk_display_get_default: dq 0x1cfc8f21
global gdk_cursor_new_for_display
gdk_cursor_new_for_display:
		_symbols.libgdk_3.gdk_cursor_new_for_display: dq 0x5496b970
global gdk_window_set_cursor
gdk_window_set_cursor:
		_symbols.libgdk_3.gdk_window_set_cursor: dq 0xbe675fb6
global g_signal_connect_object
g_signal_connect_object:
		_symbols.libgobject_2.g_signal_connect_object: dq 0xa7b9b58
global gtk_gl_area_new
gtk_gl_area_new:
		_symbols.libgtk_3.gtk_gl_area_new: dq 0xc43101e
global gtk_widget_show_all
gtk_widget_show_all:
		_symbols.libgtk_3.gtk_widget_show_all: dq 0x2c1a7ce2
global gtk_widget_get_window
gtk_widget_get_window:
		_symbols.libgtk_3.gtk_widget_get_window: dq 0x57f0ee12
global gtk_gl_area_queue_render
gtk_gl_area_queue_render:
		_symbols.libgtk_3.gtk_gl_area_queue_render: dq 0x59f752ae
global gtk_gl_area_make_current
gtk_gl_area_make_current:
		_symbols.libgtk_3.gtk_gl_area_make_current: dq 0x7ffcb3eb
global gtk_window_fullscreen
gtk_window_fullscreen:
		_symbols.libgtk_3.gtk_window_fullscreen: dq 0x92b7b5c8
global gtk_window_new
gtk_window_new:
		_symbols.libgtk_3.gtk_window_new: dq 0xb3919ef0
global gtk_init
gtk_init:
		_symbols.libgtk_3.gtk_init: dq 0xb94d0ce2
global gtk_container_add
gtk_container_add:
		_symbols.libgtk_3.gtk_container_add: dq 0xe9d7ed4a
global gtk_main
gtk_main:
		_symbols.libgtk_3.gtk_main: dq 0xf57288ea
global glScissor
glScissor:
		_symbols.libgl.glScissor: dq 0x497f394
global glCreateShaderProgramv
glCreateShaderProgramv:
		_symbols.libgl.glCreateShaderProgramv: dq 0x185d57d2
global glDrawArrays
glDrawArrays:
		_symbols.libgl.glDrawArrays: dq 0x1f4691f9
global glBindProgramPipeline
glBindProgramPipeline:
		_symbols.libgl.glBindProgramPipeline: dq 0x41630d16
global glFinish
glFinish:
		_symbols.libgl.glFinish: dq 0x62983a4c
global glGenProgramPipelines
glGenProgramPipelines:
		_symbols.libgl.glGenProgramPipelines: dq 0xa1c6d9f6
global glEnable
glEnable:
		_symbols.libgl.glEnable: dq 0xa4fd6de7
global glBindVertexArray
glBindVertexArray:
		_symbols.libgl.glBindVertexArray: dq 0xba6b34d7
global glUseProgramStages
glUseProgramStages:
		_symbols.libgl.glUseProgramStages: dq 0xc5689d48
global glGenVertexArrays
glGenVertexArrays:
		_symbols.libgl.glGenVertexArrays: dq 0xf9f00bd1
db 0
_symbols.end:
global _smolplt
_smolplt:
_smolplt.end:
%include "loader64.asm"
