#include <SDL2/SDL_events.h>
#include <SDL2/SDL_video.h>
#define GL_GLEXT_PROTOTYPES
#include "def.h"
#include "../gen/shaders.h"
#include "sys.h"
#include <GL/gl.h>
#include <SDL2/SDL.h>

__attribute__((used, __section__(".text._start"))) static void _start();
void _start() {
  SDL_Init(SDL_INIT_TIMER);
#ifdef DEBUG
  printf("SHADER DEBUGGING IS ACTIVE\n");
#endif
  GLint shader;
  GLint program;
  SDL_Window *window;
  SDL_Event event;

  // create window
  window = SDL_CreateWindow(NULL, 0, 0, WIDTH, HEIGHT,
                            SDL_WINDOW_OPENGL | SDL_WINDOW_FULLSCREEN);
  SDL_GL_CreateContext(window);

  // create shader
  shader = glCreateShader(GL_FRAGMENT_SHADER);
  glShaderSource(shader, 1, &shader_frag, NULL);
  glCompileShader(shader);

#ifdef VAR_FRAME
  int frame = 0;
#endif

#ifdef DEBUG
  GLint isCompiled = 0;
  glGetShaderiv(shader, GL_COMPILE_STATUS, &isCompiled);
  if (isCompiled == GL_FALSE) {
    GLint maxLength = 0;
    glGetShaderiv(shader, GL_INFO_LOG_LENGTH, &maxLength);

    char *error = malloc(maxLength);
    glGetShaderInfoLog(shader, maxLength, &maxLength, error);
    printf("%s\n", error);

    exit(-10);
  }
#endif

  // link shader
  program = glCreateProgram();
  glAttachShader(program, shader);
  glLinkProgram(program);
  glUseProgram(program);
#ifdef VAR_ITIME
  // mainloop
  for (;;) {
    glRecti(-1, -1, 1, 1);
    do {
      if (event.type == SDL_KEYDOWN) {
        SYS_exit_group(DONT_CARE(int));
      }
    } while (SDL_PollEvent(&event));
    glUniform1f(0, SDL_GetTicks() * .001);
    SDL_GL_SwapWindow(window);
  }
#else
#ifdef SCISSORS
#define LOOP 500
  float size = 2. / LOOP;
  for (int i = 1; i < LOOP; i++) {
    glRectf(-1., -1. + (i - 1) * size, 1., -1. + i * size);
  }
#else
  glRecti(-1, -1, 1, 1);
#endif
  for (;;) {
    do {
      if (event.type == SDL_KEYDOWN) {
        SYS_exit_group(DONT_CARE(int));
      }
    } while (SDL_PollEvent(&event));
    SDL_GL_SwapWindow(window);
  }
#endif
}
