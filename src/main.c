#define GL_GLEXT_PROTOTYPES
#include "sys.h"
#ifdef DEBUG
#include <stdio.h>
#endif
#include <stdint.h>

#include <glib.h>
#include <gtk/gtk.h>
#include <gdk/gdkkeysyms.h>

#include <GL/gl.h>
#include "shaders.h"

static GtkWidget *glarea;

#if defined VAR_ITIME || defined DEBUG
static GLuint sprogram_id;
static GLuint vprogram_id;
#endif

#if defined BENCHMARK || defined VAR_ITIME || defined DEBUG
static GTimer *timer;
#endif

static void on_render();
static void on_realize();
static void check_escape(GtkWidget *widget, GdkEventKey *event);
__attribute__((used, __externally_visible__, __section__(".text._start"))) static void _start();

void on_render()
{
#ifndef VAR_ITIME
	static gboolean rendered = FALSE;
	if (rendered)
		return TRUE;
#endif
#ifdef VAR_ITIME
	// glUniform1f(, itime);
	glProgramUniform1f(sprogram_id, 0, g_timer_elapsed(timer, NULL));
	gtk_gl_area_queue_render(glarea);
#endif

#ifdef SCISSORS
#define lines 160
	glEnable(GL_SCISSOR_TEST);
	for (int i = 0; i < HEIGHT; i += lines)
	{
		glScissor(0, i, WIDTH, lines);
#endif
		glDrawArrays(GL_TRIANGLE_STRIP, 0, 4);
		glFinish();
#ifdef SCISSORS
	}
#endif
#ifdef BENCHMARK
	printf("RT: %.2f seconds\n", g_timer_elapsed(timer, NULL));
#endif
#ifndef VAR_ITIME
	rendered = TRUE;
#endif
}

void on_realize()
{
	static GLuint pipelineId;
	static GLuint vao;
#ifdef VAR_ITIME
	timer = g_timer_new();
#endif
	gtk_gl_area_make_current(glarea);
	glGenVertexArrays(1, &vao);
	glGenProgramPipelines(1, &pipelineId);
#ifndef DEBUG
#ifdef VAR_ITIME
	glUseProgramStages(pipelineId, GL_VERTEX_SHADER_BIT, glCreateShaderProgramv(GL_VERTEX_SHADER, 1, &vshader_vert));
	sprogram_id = glCreateShaderProgramv(GL_FRAGMENT_SHADER, 1, &shader_frag);
	glUseProgramStages(pipelineId, GL_FRAGMENT_SHADER_BIT, sprogram_id);
#else
	glUseProgramStages(pipelineId, GL_VERTEX_SHADER_BIT, glCreateShaderProgramv(GL_VERTEX_SHADER, 1, &vshader_vert));
	glUseProgramStages(pipelineId, GL_FRAGMENT_SHADER_BIT, glCreateShaderProgramv(GL_FRAGMENT_SHADER, 1, &shader_frag));
#endif
#else
	
	GLboolean isLinked;
	GLint maxLength = 0;
	printf("Compiling vertex shader\n");

	float current = g_timer_elapsed(timer, NULL);
	vprogram_id = glCreateShaderProgramv(GL_VERTEX_SHADER, 1, &vshader_vert);
	glGetProgramiv(vprogram_id, GL_LINK_STATUS, &isLinked);
	glGetProgramiv(vprogram_id, GL_INFO_LOG_LENGTH, &maxLength);
	char *error = malloc(maxLength);
	glGetProgramInfoLog(vprogram_id, maxLength, &maxLength, error);
	if (maxLength > 2)
		printf("%s\n", error);
	if (isLinked == GL_FALSE)
		SYS_exit_group(-1);

	glUseProgramStages(pipelineId, GL_VERTEX_SHADER_BIT, vprogram_id);
	// printf("Compiled vertex shader in %.2f seconds\n\n\n", g_timer_elapsed(timer, NULL) - current);

	printf("Compiling fragment shader\n");
	current = g_timer_elapsed(timer, NULL);
	sprogram_id = glCreateShaderProgramv(GL_FRAGMENT_SHADER, 1, &shader_frag);
	glGetProgramiv(sprogram_id, GL_LINK_STATUS, &isLinked);
	glGetProgramiv(sprogram_id, GL_INFO_LOG_LENGTH, &maxLength);

	char *error2 = malloc(maxLength);
	glGetProgramInfoLog(sprogram_id, maxLength, &maxLength, error2);
	if (maxLength > 2)
		printf("%s\n", error2);
	if (isLinked == GL_FALSE)
	{
		printf("%s",shader_frag);
		SYS_exit_group(-1);
	}

	glUseProgramStages(pipelineId, GL_FRAGMENT_SHADER_BIT, sprogram_id);
	// printf("Compiled fragment shader in %.2f seconds\n", g_timer_elapsed(timer, NULL) - current);
#endif
	glBindProgramPipeline(pipelineId);
	glBindVertexArray(vao);
	gtk_main();
}

void check_escape(GtkWidget *widget __attribute__((unused)), GdkEventKey *event)
{
	event->keyval == GDK_KEY_Escape ? SYS_exit_group(DONT_CARE(int)) : NULL;
}

void _start()
{
#ifdef DEBUG
	printf("DEBUG MODE ON!\n");
#endif
#ifdef BENCHMARK
	timer = g_timer_new();
#endif
	gtk_init(0, NULL);
	GtkWidget *win = gtk_window_new(GTK_WINDOW_TOPLEVEL);
	glarea = gtk_gl_area_new();
	gtk_container_add((GtkContainer *)win, glarea);
	g_signal_connect_object(glarea, "render", (GCallback)on_render, NULL, 0);
	g_signal_connect_object(win, "key_press_event", (GCallback)check_escape, NULL, 0);
	gtk_widget_show_all(win);
	gtk_window_fullscreen((GtkWindow *)win);
#ifdef HIDECURSOR
	GdkWindow *window = gtk_widget_get_window(win);
	GdkCursor *Cursor = gdk_cursor_new_for_display(gdk_display_get_default(), GDK_BLANK_CURSOR);
	gdk_window_set_cursor(window, Cursor);
#endif
	on_realize();
	__builtin_unreachable();
}