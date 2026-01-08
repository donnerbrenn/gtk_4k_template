#include "def.h"
#include <SDL2/SDL_events.h>
#include <SDL2/SDL_video.h>
#define GL_GLEXT_PROTOTYPES
#include "../gen/shaders.h"
#include "sys.h"
#include <GL/gl.h>
#include <SDL2/SDL.h>

static SDL_Event event;

__attribute__((used, __section__(".text._start"))) static void _start();
void _start() {
  SDL_Window *window = SDL_CreateWindow(0, 0, 0, WIDTH, HEIGHT, 3);

  SDL_GL_CreateContext(window);

  const char *s = shader_frag;
  GLuint p = glCreateShaderProgramv(GL_FRAGMENT_SHADER, 1, &s);
  glUseProgram(p);

  do {
    SDL_PollEvent(&event);

    if (event.type == SDL_KEYDOWN)
      SYS_exit_group(0);

    glRecti(-1, -1, 1, 1);

    glUniform1f(0, SDL_GetTicks() * 0.001f);

    SDL_GL_SwapWindow(window);

  } while (1);
}
