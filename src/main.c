#define GL_GLEXT_PROTOTYPES

#include "sys.h"

#include<stdio.h>
#include<stdbool.h>
#include<stdlib.h>
#include<stdint.h>

#include <glib.h>
#include <gtk/gtk.h>
#include <gdk/gdkkeysyms.h>

#include <GL/gl.h>
// #include <GL/glx.h>
// #include <GL/glu.h>
// #include <GL/glext.h>
#include "shader.h"
#include "vshader.h"

GLuint vao;
GLuint p;
#ifdef VAR_ITIME
GTimer* gtimer;
#endif

#ifdef DEBUG
static void check_shader_status(GLuint shader_id)
{
	GLint isCompiled;
	glGetShaderiv(shader_id, GL_COMPILE_STATUS, &isCompiled);
	if(isCompiled == GL_FALSE) {
		GLint maxLength = 0;
		glGetShaderiv(shader_id, GL_INFO_LOG_LENGTH, &maxLength);

		char* error = malloc(maxLength);
		glGetShaderInfoLog(shader_id, maxLength, &maxLength, error);
		printf("%s\n", error);
		free(error);

		exit(-10);
	}
}
#endif

// static void compile_shader(GLenum type,const char* shader, GLuint p)
// {
// 	GLuint s=glCreateShader(type);
// 	glShaderSource(s, 1, &shader, NULL);
// 	glCompileShader(s);
// 	#ifdef DEBUG
// 	check_shader_status(s);
// 	#endif
// 	glAttachShader(p,s);
// }

static void on_render()
{
	glUseProgram(p);
	glBindVertexArray(vao);
	glVertexAttrib1f(0, 0);
	#ifdef VAR_IRESOLUTION
	glUniform2f( glGetUniformLocation( p, VAR_IRESOLUTION ),WIDTH,HEIGHT);
	#endif
	#ifdef VAR_ITIME 
	glUniform1f ( glGetUniformLocation( p, VAR_ITIME ),g_timer_elapsed(gtimer, NULL));
	#endif
	glDrawArrays(GL_TRIANGLE_STRIP, 0, 4);
}

static void on_realize(GtkGLArea *glarea)
{
	gtk_gl_area_make_current(glarea);
	p = glCreateProgram();
	GLuint s=glCreateShader(GL_VERTEX_SHADER);
	glShaderSource(s, 1, &vshader_vert, NULL);
	glCompileShader(s);
	#ifdef DEBUG
	check_shader_status(s);
	#endif
	glAttachShader(p,s);
	s=glCreateShader(GL_FRAGMENT_SHADER);
	glShaderSource(s, 1, &shader_frag, NULL);
	glCompileShader(s);
	#ifdef DEBUG
	check_shader_status(s);
	#endif
	glAttachShader(p,s);
	// compile_shader(GL_VERTEX_SHADER,vshader_vert,p);
	// compile_shader(GL_FRAGMENT_SHADER,shader_frag,p);
	glLinkProgram(p);

	glGenVertexArrays(1, &vao);

	#ifdef VAR_ITIME
	// if you want to continuously render the shader once per frame
	GdkGLContext *context = gtk_gl_area_get_context(glarea);
	GdkWindow *glwindow = gdk_gl_context_get_window(context);
	GdkFrameClock *frame_clock = gdk_window_get_frame_clock(glwindow);

	// // Connect update signal:
	g_signal_connect_swapped(frame_clock, "update", G_CALLBACK(gtk_gl_area_queue_render), glarea);

	// // Start updating:
	gdk_frame_clock_begin_updating(frame_clock);
	#endif	
}

static void check_escape(GtkWidget *widget, GdkEventKey *event)
{
	if (event->keyval == GDK_KEY_Escape) 
	{
		SYS_exit_group(0);
		// asm volatile("push $231;pop %rax;syscall");
	}
}

__attribute__((__externally_visible__, __section__(".text.startup._start")))
void _start()
{
	#ifdef DEBUG
	printf("DEBUG MODE ON!\n");
	#endif
	typedef void (*voidWithOneParam)(int*,char***);
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



	on_realize((GtkGLArea*)glarea);
	#ifdef VAR_ITIME
	gtimer = g_timer_new();
	#endif
	gtk_main();
	__builtin_unreachable();
}