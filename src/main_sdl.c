#define GL_GLEXT_PROTOTYPES
#include <GL/gl.h>
#include <SDL2/SDL.h>
#include "sys.h"
#ifdef DEBUG
#include <stdio.h>
#endif
#include <stdint.h>
#include "shaders.h"

void _start() {
#ifdef DEBUG
  printf("DEBUG MODE ON!\n");
#endif
#ifdef BENCHMARK
//   timer = g_timer_new();
#endif

  GLint shader, program;
  SDL_Window *window;
  static SDL_Event event;
  window = SDL_CreateWindow(NULL, 0, 0, 2560, 1440, SDL_WINDOW_OPENGL);
  SDL_GL_CreateContext(window);
  shader = glCreateShader(GL_FRAGMENT_SHADER);
  glShaderSource(shader, 1, &shader, NULL);
  glCompileShader(shader);

  __builtin_unreachable();
}