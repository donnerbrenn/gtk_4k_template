SHADER=pin.frag

#setup
WIDTH=1920
HEIGHT=1080
HIDECURSOR=true

#gcc
CC=gcc
USELTO=true

#smol
#dlfixup, dnload or default:
SMOLLOADER=dlfixup
ALIGNSTACK=true
DEBUG=false

OBJDIR := obj
BINDIR := bin
RTDIR := smol/rt
LDDIR := smol/ld
SRCDIR:= src
SCRIPTS:= scripts
SECTIONORDER=td

NASM ?= nasm
OBJCOPY ?= objcopy

SHADERPATH=shaders
IRESOLUTION='vec2 iResolution=vec2($(WIDTH),$(HEIGHT));'

BITS ?= 64#$(shell getconf LONG_BIT)

COPTFLAGS= -Os -march=nocona -DWIDTH=$(WIDTH) -DHEIGHT=$(HEIGHT)
COPTFLAGS+= -fno-plt -fno-stack-protector -fno-stack-check -fno-unwind-tables \
	-fno-asynchronous-unwind-tables -fomit-frame-pointer -ffast-math -no-pie \
	-fno-pic -fno-PIE -ffunction-sections -fdata-sections -fmerge-all-constants \
	-funsafe-math-optimizations -malign-data=cacheline -fsingle-precision-constant \
	-fwhole-program -fno-exceptions -fvisibility=hidden \
      -mpreferred-stack-boundary=4 -mno-fancy-math-387 -mno-ieee-fp

CFLAGS = -std=gnu11 -nodefaultlibs -fno-PIC $(COPTFLAGS) -m$(BITS)
CFLAGS += -Wall -Wextra #-Wpedantic
CFLAGS += `pkg-config --cflags gtk+-3.0`
ifeq ($(HIDECURSOR),true)
	CFLAGS+=-DHIDECURSOR
endif
ifeq ($(USELTO),true)
	CFLAGS+=-flto
endif

LIBS =  -lGL `pkg-config --libs gtk+-3.0`

ifeq ($(DEBUG),true)
	CFLAGS+=-DDEBUG
	LIBS += -lc
endif

SMOLFLAGS = --smolrt $(RTDIR) --smolld $(LDDIR)  \
	-fno-start-arg -fno-ifunc-support -fuse-dt-debug -funsafe-dynamic --section-order=$(SECTIONORDER)
ifeq ($(ALIGNSTACK),true)
	SMOLFLAGS+=-falign-stack
else
	SMOLFLAGS+=-fno-align-stack
endif
ifeq ($(SMOLLOADER),dlfixup)
	SMOLFLAGS+= -fuse-$(SMOLLOADER)-loader
endif
ifeq ($(SMOLLOADER),dnload)
	SMOLFLAGS+= -fuse-$(SMOLLOADER)-loader
endif


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
	echo  $(IRESOLUTION) > /tmp/res.frag
	cat shaders/header.frag /tmp/res.frag > /tmp/header.frag
	cat /tmp/header.frag $< > shader.frag
	# cp $< shader.frag
	mono ./tools/shader_minifier.exe shader.frag --no-renaming-list ss,main -o $@
	rm shader.frag

$(OBJDIR)/%.o: $(SRCDIR)/shader.h $(SRCDIR)/vshader.h $(SRCDIR)/%.c $(OBJDIR)/
	$(CC) $(CFLAGS) -c $(SRCDIR)/main.c -o "$@"
	$(OBJCOPY) $@ --set-section-alignment *=1 -g -x -X -S --strip-unneeded
	size $@

VNDH_FLAGS :=-l -v --vndh vondehi #--vndh_unibin
$(BINDIR)/%.dbg $(BINDIR)/%.smol: $(OBJDIR)/%.o $(BINDIR)/
	$(PYTHON3) ./smol/smold.py --debugout "$@.dbg" $(SMOLFLAGS) --ldflags=-Wl,-Map=$(BINDIR)/$*.map $(LIBS) "$<" "$@"
	$(PYTHON3) ./smol/smoltrunc.py "$@" "$(OBJDIR)/$(notdir $@)" && mv "$(OBJDIR)/$(notdir $@)" "$@" && chmod +x "$@"
	wc -c $@

$(BINDIR)/%.lzma: $(BINDIR)/main.smol
	./autovndh.py $(VNDH_FLAGS) --nostub  "$<" > "$@"
	rm $<

heatmap: $(BINDIR)/main.lzma
	../LZMA-Vizualizer/LzmaSpec $< 
	# ../LZMA-Vizualizer/contrib/parsemap.py bin/main.lzma $(BINDIR)/main.map
	@stat --printf="$@: %s bytes\n" $<
	rm $<

$(BINDIR)/main.sh: $(SCRIPTS)/shelldropper.sh $(BINDIR)/main.lzma
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
	cat $(SCRIPTS)/cmixdropper.sh $@.cm > $@
	rm $@.cm
	chmod +x $@
	@stat --printf="$@: %s bytes\n" $@

.PHONY: all clean

