TARGET=smol.okp
BACKUP=backup


%.okp: % clean
	./onekpaq.py 1 1 4 6 uncompressed $@

all: $(TARGET)

clean:
	-rm $(TARGET)

clearcache: 
	-rm onekpaq_context.cache

backupcache: 
	cp onekpaq_context.cache $(BACKUP)

restorecache: 
	cp $(BACKUP) onekpaq_context.cache

rebuild: clearcache clean all