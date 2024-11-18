OUTPUT_FORMAT("elf64-x86-64")
OUTPUT_ARCH(i386:x86-64)

ENTRY(run)
SEARCH_DIR("/usr/x86_64-pc-linux-gnu/lib64"); SEARCH_DIR("/usr/lib"); SEARCH_DIR("/usr/local/lib"); SEARCH_DIR("/usr/x86_64-pc-linux-gnu/lib");

SECTIONS
{
  . = SEGMENT_START("text-segment", 0x10000) + SIZEOF_HEADERS;
  .dynsym         : { *(.dynsym) }
  .dynstr         : { *(.dynstr) }
  .interp         : { *(.interp) }
  .prog           :
  {
    *(.rodata.*)
    *(.text.*)
    *(.data.*)
  }
  .crap :
  {
    *(.bss*)
    *(.got*)
    *(.gnu*)
  }
  /DISCARD/ :
  {
    *(.comment)
    *(.note*)
    *(.data)
    *(.text)
  }
}
