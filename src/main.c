#define GL_GLEXT_PROTOTYPES
#include "../gen/shaders.h"
#include "sys.h"
#include <GL/gl.h>
#include <gdk/gdkkeysyms.h>
#include <glib.h>
#include <gtk/gtk.h>
#include <stdint.h>

#if defined(VAR_ITIME) || defined(DEBUG)
static GLuint sprogram_id;
#endif
static int frame = 0;

void _start();

#ifdef BENCHMARK
GTimer *bench_timer = NULL;
#endif

static gboolean on_render(GtkGLArea *area) {

#ifdef BENCHMARK
  g_timer_start(bench_timer);
#endif /* ifdef BENCHMARK */
  if (!frame) {
    frame++;
    return TRUE;
  }

#ifdef VAR_ITIME
  static GTimer *timer = NULL;
  if (!timer)
    timer = g_timer_new();

  glProgramUniform1f(sprogram_id, 0, (float)g_timer_elapsed(timer, NULL));
#endif

  glDrawArrays(GL_TRIANGLE_STRIP, 0, 4);

#ifdef BENCHMARK
  glFinish();
  printf("%.2fs\n", g_timer_elapsed(bench_timer, NULL));
#endif
#ifdef VAR_ITIME
  gtk_gl_area_queue_render(area);
#endif

  return TRUE;
}

static void check_escape(GtkWidget *w, GdkEventKey *e) {
  if (e->keyval == GDK_KEY_Escape)
    SYS_exit_group(0);
}

__attribute__((noreturn, used, __section__(".text._start"))) void _start() {
  gtk_init(0, NULL);
#ifdef BENCHMARK
  bench_timer = g_timer_new();
#endif /* ifdef BENCHMARK */
  GtkWidget *win = gtk_window_new(GTK_WINDOW_TOPLEVEL);
  GtkWidget *glarea = gtk_gl_area_new();
  gtk_container_add((GtkContainer *)win, glarea);
  g_signal_connect_object(glarea, "render", (GCallback)on_render, NULL, 0);
  g_signal_connect_object(win, "key_press_event", (GCallback)check_escape, NULL,
                          0);

  gtk_widget_show_all(win);
  gtk_window_fullscreen((GtkWindow *)win);

#ifdef HIDECURSOR
  gdk_window_set_cursor(
      gtk_widget_get_window(win),
      gdk_cursor_new_for_display(gdk_display_get_default(), GDK_BLANK_CURSOR));
#endif

  gtk_gl_area_make_current((GtkGLArea *)glarea);

  GLuint vao, pipe;
  glGenVertexArrays(1, &vao);
  glBindVertexArray(vao);
  glGenProgramPipelines(1, &pipe);

#ifndef DEBUG
#ifdef VAR_ITIME
  glUseProgramStages(
      pipe, GL_VERTEX_SHADER_BIT,
      glCreateShaderProgramv(GL_VERTEX_SHADER, 1, &vshader_vert));
  sprogram_id = glCreateShaderProgramv(GL_FRAGMENT_SHADER, 1, &shader_frag);
  glUseProgramStages(pipe, GL_FRAGMENT_SHADER_BIT, sprogram_id);
#else
  glUseProgramStages(
      pipe, GL_VERTEX_SHADER_BIT,
      glCreateShaderProgramv(GL_VERTEX_SHADER, 1, &vshader_vert));
  glUseProgramStages(
      pipe, GL_FRAGMENT_SHADER_BIT,
      glCreateShaderProgramv(GL_FRAGMENT_SHADER, 1, &shader_frag));
#endif
#else
#endif
  glBindProgramPipeline(pipe);
  gtk_main();
  __builtin_unreachable();
}
