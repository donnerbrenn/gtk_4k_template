#setup
SHADER			=		chamber.frag
WIDTH			=		2560
HEIGHT			=		1440
HIDECURSOR		=		true
BENCHMARK		=		true
DEBUG			=		false
SCISSORS		=		true

SHADERDIR		=		pathtracer
GLVERSION		=		'\#version 400'
I_X				=		'float i_X=$(WIDTH).;'
I_Y				=		'float i_Y=$(HEIGHT).;'

VNDH_FLAGS	:= -DNO_CHEATING #-DNO_UBUNTU_COMPAT -DNO_FILE_MANAGER_COMPAT
AVNDH_FLAGS :=-l -v --vndh vondehi 

OBJDIR 			:=		obj
BINDIR			:=		bin
RTDIR 			:=		rt
SRCDIR			:=		src
GENDIR			:=		gen
TEMPLATES		:=		template

NASM 			?=		nasm
OBJCOPY 		?=		objcopy
PYTHON 			?= 		python3
CC				=		gcc
MINIFY			= 		mono ./tools/shader_minifier.exe -v #--preserve-externals
USELTO			=		true
ALIGNSTACK		=		true
SECTIONORDER	=		td

VSHADER			=		vshader.vert

ITIMECNT=0


#dlfixup, dnload or default
SMOLLOADER		=		dnload

COPTFLAGS		= 		-Oz -march=nocona -I gen/
COPTFLAGS		+=		-fno-plt -fno-stack-protector -fno-stack-check -fno-unwind-tables \
						-fno-asynchronous-unwind-tables -fomit-frame-pointer -ffast-math -no-pie \
						-fno-pic -fno-PIE -ffunction-sections -fdata-sections -fmerge-all-constants \
						-funsafe-math-optimizations -malign-data=cacheline -fsingle-precision-constant \
						-fwhole-program -fno-exceptions -fvisibility=hidden -nostartfiles -nostdlib\
						-mno-fancy-math-387 -mno-ieee-fp -fno-builtin
COPTFLAGS 		+=		`pkg-config --cflags-only-I gtk+-3.0` #-mincoming-stack-boundary=3
COPTFLAGS		+=		-DWIDTH=$(WIDTH) -DHEIGHT=$(HEIGHT)
LIBS			=		-lGL `pkg-config --libs-only-l gtk+-3.0`

SMOLFLAGS 		=		--smolrt "$(PWD)/smol/rt" --smolld "$(PWD)/smol/ld" \
	 					--det -fno-start-arg -fno-ifunc-support --section-order=$(SECTIONORDER)\
						-funsafe-dynamic

ifeq ($(HIDECURSOR),true)
	COPTFLAGS+=-DHIDECURSOR
endif

ifeq ($(BENCHMARK),true)
	COPTFLAGS+=-DBENCHMARK
endif

ifeq ($(SCISSORS),true)
	COPTFLAGS+=-DSCISSORS
endif


ifeq ($(USELTO),true)
	COPTFLAGS+=-flto
endif

ifeq ($(DEBUG),true)
	COPTFLAGS+=-DDEBUG
	LIBS+=-lc
endif

ifeq ($(BENCHMARK),true)
	LIBS+=-lc
endif

CFLAGS 			=		-std=gnu99 -nodefaultlibs $(COPTFLAGS)
CFLAGS 			+=		#-Wall -Wextra #-Wpedantic

ifeq ($(ALIGNSTACK),true)
	SMOLFLAGS+=-falign-stack
else
	SMOLFLAGS+=-fno-align-stack
endif
ifeq ($(SMOLLOADER),dlfixup)
	SMOLFLAGS+= -fuse-$(SMOLLOADER)-loader
endif
ifeq ($(SMOLLOADER),dnload)
	SMOLFLAGS+= -fuse-$(SMOLLOADER)-loader -c
endif

$(GENDIR)/shaders.h: $(GENDIR)/ $(TEMPLATES)/$(VSHADER) $(SHADERDIR)/$(SHADER)
	cp $(TEMPLATES)/$(VSHADER) $(GENDIR)/vshader.vert
	echo  $(GLVERSION) >  /tmp/shader.frag
	echo $(UVLINE)>> /tmp/shader.frag
	echo  $(I_X) >>  /tmp/shader.frag
	echo  $(I_Y) >> /tmp/shader.frag
	cat  /tmp/shader.frag $(SHADERDIR)/$(SHADER) > $(GENDIR)/shader.frag
ifeq ($(DEBUG),true)
	$(MINIFY) $(GENDIR)/shader.frag --no-renaming --format indented --no-sequence --no-inlining -o $(GENDIR)/min_shader.frag
	$(MINIFY) $(GENDIR)/vshader.vert $(GENDIR)/shader.frag -v --no-renaming --no-sequence --no-inlining -o $@	
else
	$(MINIFY) $(GENDIR)/shader.frag --format indented --move-declarations -o $(GENDIR)/min_shader.frag
	$(MINIFY) $(GENDIR)/vshader.vert $(GENDIR)/shader.frag -v --move-declarations -o $@
	
endif
	
	./tools/replace.py $@

$(BINDIR)/%.vndh: $(GENDIR)/main.lzma
	nasm -fbin $(VNDH_FLAGS) -o $(GENDIR)/vondehi vondehi/vondehi.asm
	cat $(GENDIR)/vondehi $(GENDIR)/main.lzma > $@
	chmod +x $@

clean:
	@$(RM) -vrf $(OBJDIR) $(BINDIR) $(GENDIR)

%/:
	@mkdir -vp "$@"

.SECONDARY:

$(OBJDIR)/%.o: $(SRCDIR)/%.c $(OBJDIR)/ $(GENDIR)/shaders.h
	$(CC) $(CFLAGS) -c "$<" -o "$@"
	$(OBJCOPY) $@ --set-section-alignment *=1 -g -x -X -S --strip-unneeded
	size $@

$(BINDIR)/%.elf: $(SRCDIR)/%.c $(BINDIR)/ $(GENDIR)/shaders.h
	$(CC) $(CFLAGS) $(LIBS) "$<" -o "$@"
	strip --strip-unneeded $@
	sstrip -z $@
	size $@



$(BINDIR)/main.smol: $(OBJDIR)/main.o $(BINDIR)/
	$(PYTHON) ./smol/smold.py $(SMOLFLAGS) $(LIBS) $< $@

$(GENDIR)/%.lzma: $(BINDIR)/main.smol
	./tools/autovndh.py $(AVNDH_FLAGS) --nostub  $< > $@

heatmap: $(GENDIR)/%.lzma
	../LZMA-Vizualizer/LzmaSpec $<
	@stat --printf="$@: %s bytes\n" $<
	rm $<

$(BINDIR)/main.sh: tools/shelldropper.sh $(GENDIR)/main.lzma
	cat $^ > $@
	chmod +x $@

$(BINDIR)/main.okp: $(BINDIR)/main.smol
	cp $< cleanOKP/uncompressed
	make -C cleanOKP all
	mv cleanOKP/smol.okp $@
	wc -c $@

vndh: $(BINDIR)/main.vndh
	wc -c $<

okp: $(BINDIR)/main.okp
	wc -c $<

sh: $(BINDIR)/main.sh
	wc -c $<

smol: bin/main.smol
	wc -c $<

elf: $(BINDIR)/main.elf
	wc -c $<

delokp:
	-rm cleanOKP/onekpaq_context.cache

run: smol
	bin/main.smol

runsmol: clean $(BINDIR)/main.smol
	./tools/analyze.py bin/main.smol
	./$(BINDIR)/main.smol

runokp: clean $(BINDIR)/main.okp
	./tools/analyze.py bin/main.okp bin/main.smol
	./$(BINDIR)/main.okp

runvndh: clean $(BINDIR)/main.vndh
	./tools/analyze.py bin/main.vndh bin/main.smol
	./$(BINDIR)/main.vndh

all: sh vndh okp #elf
	./tools/analyze.py bin/*

purge: clean delokp

.PHONY: all clean
