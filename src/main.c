#define GL_GLEXT_PROTOTYPES

#include "sys.h"

#ifdef DEBUG
#include<stdio.h>
#endif
#include<stdint.h>

#include <glib.h>
#include <gtk/gtk.h>
#include <gdk/gdkkeysyms.h>

#include <GL/gl.h>
#include "shader.h"
#include "vshader.h"

#ifdef VAR_ITIME
GLuint sprogram_id;
GLuint vprogram_id;
#endif

typedef void (*voidWithOneParam)(int*,char***);

#ifdef VAR_ITIME
GTimer* gtimer;
#endif

static void on_render();
static void on_realize(GtkWidget *glarea);
static void check_escape(GtkWidget *widget, GdkEventKey *event);
__attribute__((__externally_visible__, __section__(".text.startup._start"))) void _start();

void on_render()
{
 #ifdef VAR_ITIME
	glProgramUniform1f(sprogram_id,0,g_timer_elapsed(gtimer, NULL));
#endif
	glDrawArrays(GL_TRIANGLE_STRIP, 0, 4);
}

void on_realize(GtkWidget *glarea)
{
	static GLuint pipelineId;
	static GLuint vao;
	gtk_gl_area_make_current((GtkGLArea *)glarea);
	glGenVertexArrays(1, &vao);
	glGenProgramPipelines(1, &pipelineId);
	#ifdef VAR_ITIME
	vprogram_id = glCreateShaderProgramv(GL_VERTEX_SHADER,1,&vshader_vert);
	sprogram_id = glCreateShaderProgramv(GL_FRAGMENT_SHADER,1,&shader_frag);
	glUseProgramStages(pipelineId, GL_VERTEX_SHADER_BIT, vprogram_id);
	glUseProgramStages(pipelineId, GL_FRAGMENT_SHADER_BIT, sprogram_id);
	#else
		glUseProgramStages(pipelineId, GL_VERTEX_SHADER_BIT, glCreateShaderProgramv(GL_VERTEX_SHADER,1,&vshader_vert));
		glUseProgramStages(pipelineId, GL_FRAGMENT_SHADER_BIT, glCreateShaderProgramv(GL_FRAGMENT_SHADER,1,&shader_frag));
	#endif
	glBindProgramPipeline(pipelineId);
	glBindVertexArray(vao);
	
#ifdef VAR_ITIME
	gtimer = g_timer_new();
	// if you want to continuously render the shader once per frame
	GdkGLContext *context = gtk_gl_area_get_context((GtkGLArea *)glarea);
	GdkWindow *glwindow = gdk_gl_context_get_window(context);
	GdkFrameClock *frame_clock = gdk_window_get_frame_clock(glwindow);
	// // Connect update signal:
	g_signal_connect_swapped(frame_clock, "update", G_CALLBACK(gtk_gl_area_queue_render), glarea);
	// // Start updating:
	gdk_frame_clock_begin_updating(frame_clock);
#endif	
}

void check_escape(GtkWidget *widget __attribute__((unused)), GdkEventKey *event)
{
	event->keyval == GDK_KEY_Escape?SYS_exit_group(DONT_CARE(int)):NULL;
}

void _start()
{
#ifdef DEBUG
	printf("DEBUG MODE ON!\n");
#endif
	voidWithOneParam gtk_init_two_param = (voidWithOneParam)gtk_init;
	(*gtk_init_two_param)(NULL,NULL);
	GtkWidget *win = gtk_window_new (GTK_WINDOW_TOPLEVEL);
	GtkWidget *glarea = gtk_gl_area_new();
	gtk_container_add(GTK_CONTAINER(win), glarea);
	g_signal_connect(glarea, "render", G_CALLBACK(on_render), NULL);
	g_signal_connect(win, "key_press_event", G_CALLBACK(check_escape), NULL);
	gtk_widget_show_all (win);
	gtk_window_fullscreen((GtkWindow*)win);
#ifdef HIDECURSOR
	GdkWindow* window = gtk_widget_get_window(win);
	GdkCursor* Cursor = gdk_cursor_new_for_display(gdk_display_get_default(),GDK_BLANK_CURSOR);
	gdk_window_set_cursor(window, Cursor);
#endif
	on_realize(glarea);
#ifdef VAR_ITIME
#endif
	gtk_main();
	__builtin_unreachable();
}