#define GL_GLEXT_PROTOTYPES

#include "sys.h"

#ifdef DEBUG
#include<stdio.h>
#include<time.h>
#endif
#include<stdint.h>

#include <glib.h>
#include <gtk/gtk.h>
#include <gdk/gdkkeysyms.h>

#include <GL/gl.h>
#include "shaders.h"

static GtkWidget* glarea;

#ifdef VAR_ITIME
static GLuint sprogram_id;
static GLuint vprogram_id;
#endif

#ifdef VAR_ITIME
static GTimer* gtimer;
#endif

static void on_render();
static void on_realize();
static void check_escape(GtkWidget* widget, GdkEventKey* event);
__attribute__((used,__externally_visible__, __section__(".text._start"))) static void _start();

void on_render()
{
	#ifdef DEBUG
	clock_t start=clock();
	#endif
 #ifdef VAR_ITIME
	glProgramUniform1f(sprogram_id,0,g_timer_elapsed(gtimer, NULL));
	gtk_gl_area_queue_render(glarea);
#endif
#ifdef SCISSORS
	glEnable(GL_SCISSOR_TEST);
	for (int i = 0; i < 1440; i += 180) 
	{
		glScissor(0,i,2560,180);
#endif
		glDrawArrays(GL_TRIANGLE_STRIP, 0, 4);
		glFinish();	
#ifdef SCISSORS
	}
#endif
	#ifdef DEBUG
	clock_t end=clock();
	printf("%i\n",((double)end-start)/CLOCKS_PER_SEC);
	#endif
}

void on_realize()
{
	static GLuint pipelineId;
	static GLuint vao;
	gtk_gl_area_make_current(glarea);
	glGenVertexArrays(1, &vao);
	glGenProgramPipelines(1, &pipelineId);
	#ifdef VAR_ITIME
	glUseProgramStages(pipelineId, GL_VERTEX_SHADER_BIT, glCreateShaderProgramv(GL_VERTEX_SHADER,1,&vshader_vert));
	sprogram_id = glCreateShaderProgramv(GL_FRAGMENT_SHADER,1,&shader_frag);
	glUseProgramStages(pipelineId, GL_FRAGMENT_SHADER_BIT, sprogram_id);
	#else
		glUseProgramStages(pipelineId, GL_VERTEX_SHADER_BIT, glCreateShaderProgramv(GL_VERTEX_SHADER,1,&vshader_vert));
		glUseProgramStages(pipelineId, GL_FRAGMENT_SHADER_BIT, glCreateShaderProgramv(GL_FRAGMENT_SHADER,1,&shader_frag));
	#endif
	glBindProgramPipeline(pipelineId);
	glBindVertexArray(vao);
	
#ifdef VAR_ITIME
	gtimer = g_timer_new();
#endif	
}

void check_escape(GtkWidget* widget __attribute__((unused)), GdkEventKey* event)
{
	event->keyval == GDK_KEY_Escape?SYS_exit_group(DONT_CARE(int)):NULL;
}

void _start()
{
#ifdef DEBUG
	printf("DEBUG MODE ON!\n");
#endif
	gtk_init(0,NULL);
	GtkWidget* win = gtk_window_new (GTK_WINDOW_TOPLEVEL);
	glarea = gtk_gl_area_new();
	gtk_container_add((GtkContainer*)win, glarea);
	g_signal_connect_object(glarea, "render", (GCallback)on_render,NULL,0);
	g_signal_connect_object(win, "key_press_event", (GCallback)check_escape, NULL,0);
	gtk_widget_show_all (win);
	gtk_window_fullscreen((GtkWindow*)win);
	
#ifdef HIDECURSOR
	GdkWindow* window = gtk_widget_get_window(win);
	GdkCursor* Cursor = gdk_cursor_new_for_display(gdk_display_get_default(),GDK_BLANK_CURSOR);
	gdk_window_set_cursor(window, Cursor);
#endif
	on_realize();
	gtk_main();
	__builtin_unreachable();
}