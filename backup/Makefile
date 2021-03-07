OBJDIR := obj
BINDIR := bin
RTDIR := rt
SRCDIR:= src

NASM ?= nasm
OBJCOPY ?= objcopy

CC=gcc

SHADERPATH=shaders
SHADER=white.frag

BITS ?= $(shell getconf LONG_BIT)

COPTFLAGS= -Os -march=nocona -DWIDTH=2560 -DHEIGHT=1440
COPTFLAGS+= -fno-plt -fno-stack-protector -fno-stack-check -fno-unwind-tables \
	-fno-asynchronous-unwind-tables -fomit-frame-pointer -ffast-math -no-pie \
	-fno-pic -fno-PIE -ffunction-sections -fdata-sections -fmerge-all-constants \
	-funsafe-math-optimizations -malign-data=cacheline -fsingle-precision-constant \
	-nostdlib -fwhole-program -fno-exceptions -fvisibility=hidden \
      -mno-fancy-math-387 -mno-ieee-fp -flto

CFLAGS = -std=gnu11 -nostartfiles -fno-PIC $(COPTFLAGS) -m$(BITS)
CFLAGS += -Wall -Wextra #-Wpedantic
CFLAGS += `pkg-config --cflags gtk+-3.0`

LIBS = -lGL -lgtk-3 -lgdk-3 -lgobject-2.0 -lc

PWD ?= .

SMOLFLAGS = --smolrt "$(PWD)/smol/rt" --smolld "$(PWD)/smol/ld" \
	-g -c -fuse-dlfixup-loader -fno-start-arg 
	# --verbose 

PYTHON3 ?= python3

all: vndh #heatmap
	

$(BINDIR)/main: $(BINDIR)/main.smol
	./autovndh.py $(VNDH_FLAGS) $< > $@
	chmod +x $@

clean:
	@$(RM) -vrf $(OBJDIR) $(BINDIR) $(SRCDIR)/shader.h vshader.h

%/:
	@mkdir -vp "$@"

.SECONDARY:

$(SRCDIR)/vshader.h: $(SHADERPATH)/vshader.vert
	cp $< ./
	mono ./tools/shader_minifier.exe vshader.vert -o $@
	rm vshader.vert

$(SRCDIR)/shader.h: $(SHADERPATH)/$(SHADER)
	cp $< shader.frag
	mono ./tools/shader_minifier.exe shader.frag --no-renaming-list ss,main -o $@
	rm shader.frag

$(OBJDIR)/%.o: $(SRCDIR)/shader.h $(SRCDIR)/vshader.h $(SRCDIR)/%.c $(OBJDIR)/
	$(CC) $(CFLAGS) -c $(SRCDIR)/main.c -o "$@"
	# objcopy $@ --set-section-alignment *=1 -g -x -X -S --strip-unneeded
	size $@

VNDH_FLAGS :=-l -v --vndh vondehi #--vndh_unibin
$(BINDIR)/%.dbg $(BINDIR)/%.smol: $(OBJDIR)/%.o $(BINDIR)/
	$(PYTHON3) ./smol/smold.py --debugout "$@.dbg" $(SMOLFLAGS) --ldflags=-Wl,-Map=$(BINDIR)/$*.map $(LIBS) "$<" "$@"
	$(PYTHON3) ./smol/smoltrunc.py "$@" "$(OBJDIR)/$(notdir $@)" && mv "$(OBJDIR)/$(notdir $@)" "$@" && chmod +x "$@"
	wc -c $@

$(BINDIR)/%.lzma: $(BINDIR)/main.smol
	./autovndh.py $(VNDH_FLAGS) --nostub  "$<" > "$@"
	rm $<

heatmap: $(BINDIR)/%.lzma
	../LZMA-Vizualizer/LzmaSpec $<
	@stat --printf="$@: %s bytes\n" $<
	rm $<

$(BINDIR)/main.sh: shelldropper.sh $(BINDIR)/main.lzma
	cat $^ > $@
	chmod +x $@



xlink: $(BINDIR)/main.smol
	cat $< | ~/coding/xlink/bin/xlink
	# chmod +x $@

cmix: $(BINDIR)/main.cmix
	wc -c $<

vndh: $(BINDIR)/main
	wc -c $<
	

sh: $(BINDIR)/main.sh
	wc -c $<

$(BINDIR)/main.cmix: $(BINDIR)/main.smol
	cmix -c $< $@.cm
	cat cmix/cmixdropper.sh $@.cm > $@
	rm $@.cm
	chmod +x $@
	@stat --printf="$@: %s bytes\n" $@


.PHONY: all clean

