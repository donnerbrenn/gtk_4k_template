#define GL_GLEXT_PROTOTYPES
#include "sys.h"
#include <stdio.h>
#include <stdint.h>

#include <gdk/gdkkeysyms.h>
#include <glib.h>
#include <gtk/gtk.h>

#include "../gen/shaders.h"
#include <GL/gl.h>

static GtkWidget *glarea;
static GLuint pipelineId;
static GLuint vao;
static GLuint framebuffer;


static GLuint textureColorbuffer;
static void on_render();
static void on_realize();

static void check_escape(GtkWidget *widget, GdkEventKey *event);

__attribute__((used, __section__(".text._start"))) static void _start();


void on_render() {
  static gboolean rendered = FALSE;
  if (rendered)
    return;

  // Zuerst auf den Offscreen-Framebuffer rendern
  glBindFramebuffer(GL_FRAMEBUFFER, framebuffer);
  glViewport(0, 0, WIDTH, HEIGHT);  // Viewport für die Texturgröße setzen
  glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
  glDrawArrays(GL_TRIANGLE_STRIP, 0, 4);

  // Dann auf den Bildschirm rendern
  glBindFramebuffer(GL_FRAMEBUFFER, 0);
  glViewport(0, 0, gtk_widget_get_allocated_width(glarea), gtk_widget_get_allocated_height(glarea));
  glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

  // Die Offscreen-Textur verwenden
  glBindTexture(GL_TEXTURE_2D, textureColorbuffer);

  // Fullscreen Quad zeichnen, das die Textur anzeigt
  glDrawArrays(GL_TRIANGLE_STRIP, 0, 4);
  glFinish();
  rendered = TRUE;
}

void on_realize() {
  gtk_gl_area_make_current((GtkGLArea *)glarea);

  // VAO für Geometrie
  glGenVertexArrays(1, &vao);
  glBindVertexArray(vao);

  // Framebuffer-Objekt (FBO) erstellen
  glGenFramebuffers(1, &framebuffer);
  glBindFramebuffer(GL_FRAMEBUFFER, framebuffer);

  // Textur erstellen, auf die gerendert wird
  glGenTextures(1, &textureColorbuffer);
  glBindTexture(GL_TEXTURE_2D, textureColorbuffer);
  glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, WIDTH, HEIGHT, 0, GL_RGB, GL_UNSIGNED_BYTE, NULL);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

  // Textur an den Framebuffer binden
  glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, textureColorbuffer, 0);
  // Zurück zum Default-Framebuffer wechseln

  // Shader-Programme laden
#ifndef DEBUG
  glUseProgramStages(pipelineId, GL_VERTEX_SHADER_BIT, glCreateShaderProgramv(GL_VERTEX_SHADER, 1, &vshader_vert));
  glUseProgramStages(pipelineId, GL_FRAGMENT_SHADER_BIT, glCreateShaderProgramv(GL_FRAGMENT_SHADER, 1, &shader_frag));
  glUseProgramStages(pipelineId, GL_FRAGMENT_SHADER_BIT, glCreateShaderProgramv(GL_FRAGMENT_SHADER, 1, &display_frag));
#endif

  glBindProgramPipeline(pipelineId);
  gtk_main();
}

void check_escape(GtkWidget *widget __attribute__((unused)), GdkEventKey *event) {
  event->keyval == GDK_KEY_Escape ? SYS_exit_group(DONT_CARE(int)) : NULL; 
}
#ifdef DEBUG
void APIENTRY OpenGLDebugCallback(GLenum source, GLenum type, GLuint id, GLenum severity, GLsizei length, const GLchar* message, const void* userParam) {
  printf("OpenGL Debug Message:\n");
  printf("Source: %u, Type: %u, ID: %u, Severity: %u\n", source, type, id, severity);
  printf("Message: %s\n", message);
}
#endif
void _start() {
#ifdef DEBUG
  glEnable(GL_DEBUG_OUTPUT);
  glDebugMessageCallback(OpenGLDebugCallback, NULL);
#endif
  gtk_init(0, NULL);
  GtkWidget *win = gtk_window_new(GTK_WINDOW_TOPLEVEL);
  glarea = gtk_gl_area_new();
  gtk_container_add((GtkContainer *)win, glarea);
  g_signal_connect_object(glarea, "render", (GCallback)on_render, NULL, 0);
  g_signal_connect_object(win, "key_press_event", (GCallback)check_escape, NULL, 0);
  gtk_widget_show_all(win);
  gtk_window_fullscreen((GtkWindow *)win);
  on_realize();
  __builtin_unreachable();
}
