
#include <stdint.h>
#include <stddef.h>
#include <unistd.h>

static ssize_t SYS_write(int fd, const void* buf, size_t sz) {
	register ssize_t retval asm("rax");

	asm volatile("movq $1, %%rax\nsyscall\n"
		:"=a" (retval)
		: "D" (fd), "S"  (buf), "d" (sz)
		:"rcx","r11"
	);

    return retval;
}
static void SYS_exit(int c) {
	asm volatile("movq $60, %%rax\nsyscall\n"
		:
		: "D" (c)
		:"rcx","r11"
	);
}


int _start(void) {
	SYS_write(1, "hello world!\n", 13);
	SYS_exit(0);
}
