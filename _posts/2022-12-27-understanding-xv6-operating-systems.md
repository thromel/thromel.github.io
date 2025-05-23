---
layout: post
title: "Understanding xv6: A Practical Introduction to Operating Systems"
date: 2022-12-27
categories: [operating-systems, programming, education]
tags: [xv6, operating-systems, c, kernel, unix, mit, systems-programming, computer-science]
image: /assets/images/projects/xv6-os.png
---

# Understanding xv6: A Practical Introduction to Operating Systems

Operating systems form the foundation of modern computing, yet their inner workings often remain mysterious to many computer science students. If you're embarking on your journey into operating systems through xv6, you're about to explore one of the most elegant teaching tools in computer science education. This post will guide you through xv6's architecture, connecting fundamental OS concepts with concrete implementation details you can examine and modify yourself.

## What Makes xv6 Special

xv6 is a teaching operating system developed at MIT, inspired by Unix Version 6. Unlike production operating systems with millions of lines of code, xv6 contains roughly 15,000 lines of well-commented C code and assembly. This deliberate simplicity means you can understand the entire system, from boot sequence to system calls, in a single semester.

The genius of xv6 lies in its completeness despite its simplicity. It implements all the fundamental concepts you need to understand: process management, virtual memory, file systems, and device drivers. Each component is stripped to its essential elements, making the underlying principles clear without getting lost in optimization details or edge cases.

## The Boot Process: Where Everything Begins

When you power on a computer running xv6, a carefully choreographed sequence unfolds. Understanding this boot process reveals how an operating system transforms raw hardware into a managed computing environment.

The journey begins in the file `bootasm.S`, where the BIOS loads the boot sector into memory at address 0x7c00. At this point, the processor runs in 16-bit real mode, a legacy from the original 8086 processor. The bootloader's first task is switching to 32-bit protected mode, which provides access to more memory and better protection mechanisms.

```c
// In bootmain.c - simplified version
void bootmain(void)
{
    struct elfhdr *elf;
    struct proghdr *ph, *eph;
    void (*entry)(void);
    
    // Read first page of kernel from disk
    readseg((uchar*)elf, 4096, 0);
    
    // Check if this is an ELF file
    if(elf->magic != ELF_MAGIC)
        return;  // Not a valid kernel
    
    // Load each program segment
    ph = (struct proghdr*)((uchar*)elf + elf->phoff);
    eph = ph + elf->phnum;
    for(; ph < eph; ph++){
        readseg(ph->paddr, ph->memsz, ph->offset);
    }
    
    // Transfer control to kernel
    entry = (void(*)(void))(elf->entry);
    entry();
}
```

This boot process teaches several crucial concepts. First, it demonstrates how software and hardware interact at the lowest level. Second, it shows how an operating system bootstraps itself from nothing to a fully functional system. The transition from real mode to protected mode illustrates how modern processors maintain backward compatibility while providing advanced features.

## Process Management: The Illusion of Simultaneity

At the heart of any operating system lies process management. xv6 implements processes with elegant simplicity, yet the implementation contains all the essential elements found in production systems.

In xv6, each process is represented by a `struct proc` defined in `proc.h`. This structure contains everything the kernel needs to know about a process: its state, memory mappings, open files, and saved register values. The process table, a fixed-size array of these structures, limits xv6 to 64 concurrent processes—a reasonable constraint for a teaching system.

```c
// Simplified proc structure from proc.h
struct proc {
    uint sz;                     // Size of process memory (bytes)
    pde_t* pgdir;               // Page table
    char *kstack;               // Bottom of kernel stack
    enum procstate state;       // Process state
    int pid;                    // Process ID
    struct proc *parent;        // Parent process
    struct trapframe *tf;       // Trap frame for current syscall
    struct context *context;    // Switch here to run process
    void *chan;                 // If non-zero, sleeping on chan
    int killed;                 // If non-zero, have been killed
    struct file *ofile[NOFILE]; // Open files
    struct inode *cwd;          // Current directory
    char name[16];              // Process name (debugging)
};
```

Process creation in xv6 follows the Unix model through the `fork()` system call. When a process calls fork, xv6 creates an exact copy of the calling process, including its memory, open files, and register state. The implementation in `proc.c` reveals the complexity hidden behind this simple interface:

```c
// Simplified fork implementation
int fork(void)
{
    int i, pid;
    struct proc *np;
    
    // Allocate new process structure
    if((np = allocproc()) == 0)
        return -1;
    
    // Copy process state from parent
    if((np->pgdir = copyuvm(proc->pgdir, proc->sz)) == 0){
        kfree(np->kstack);
        np->kstack = 0;
        np->state = UNUSED;
        return -1;
    }
    np->sz = proc->sz;
    np->parent = proc;
    *np->tf = *proc->tf;
    
    // Clear %eax so that fork returns 0 in child
    np->tf->eax = 0;
    
    // Copy file descriptors
    for(i = 0; i < NOFILE; i++)
        if(proc->ofile[i])
            np->ofile[i] = filedup(proc->ofile[i]);
    np->cwd = idup(proc->cwd);
    
    safestrcpy(np->name, proc->name, sizeof(proc->name));
    pid = np->pid;
    
    // Set child runnable
    acquire(&ptable.lock);
    np->state = RUNNABLE;
    release(&ptable.lock);
    
    return pid;  // Return child's PID to parent
}
```

This implementation teaches several fundamental concepts. The distinction between parent and child processes after fork, identified only by the return value, demonstrates how operating systems create new execution contexts. The careful copying of process state shows what makes each process independent, while the sharing of certain resources (like the current directory) illustrates how processes can communicate.

## Memory Management: Creating Virtual Worlds

Memory management in xv6 demonstrates how operating systems create the illusion that each process has its own private memory space. This virtual memory system, though simpler than those in production systems, contains all the essential elements.

xv6 uses a two-level page table structure on x86. Each process has its own page directory, which points to page tables, which in turn map virtual addresses to physical addresses. This hierarchical structure allows efficient memory usage—unmapped regions don't require page table entries.

The virtual memory layout in xv6 is straightforward. Each process sees a virtual address space from 0 to 2GB. The kernel maps itself at high virtual addresses (above 2GB), allowing it to access process memory directly while remaining protected from user code.

```c
// Virtual address to physical address translation
static pte_t* walkpgdir(pde_t *pgdir, const void *va, int alloc)
{
    pde_t *pde;
    pte_t *pgtab;
    
    // Extract page directory index from virtual address
    pde = &pgdir[PDX(va)];
    
    if(*pde & PTE_P){
        // Page table exists
        pgtab = (pte_t*)P2V(PTE_ADDR(*pde));
    } else {
        // Need to allocate page table
        if(!alloc || (pgtab = (pte_t*)kalloc()) == 0)
            return 0;
        memset(pgtab, 0, PGSIZE);
        *pde = V2P(pgtab) | PTE_P | PTE_W | PTE_U;
    }
    
    // Return pointer to page table entry
    return &pgtab[PTX(va)];
}
```

The memory allocator in xv6 (`kalloc.c`) manages physical memory with a simple free list. Each free page contains a pointer to the next free page, creating a linked list of available memory. This design, while not optimal for performance, clearly illustrates memory allocation concepts:

```c
// Allocate one 4096-byte page of physical memory
char* kalloc(void)
{
    struct run *r;
    
    acquire(&kmem.lock);
    r = kmem.freelist;
    if(r)
        kmem.freelist = r->next;
    release(&kmem.lock);
    
    if(r)
        memset((char*)r, 5, PGSIZE); // Fill with junk
    return (char*)r;
}
```

This implementation teaches how operating systems manage the finite resource of physical memory. The use of a free list demonstrates a fundamental data structure in systems programming, while the lock protection introduces the concept of synchronization in kernel code.

## The File System: Persistence and Organization

The xv6 file system provides a complete implementation of hierarchical file storage. Built in layers, each level adds functionality while hiding complexity from the layers above. This design exemplifies good systems architecture.

At the lowest level, the buffer cache (`bio.c`) manages disk blocks in memory. This cache serves two purposes: improving performance by avoiding disk reads and providing synchronization for disk blocks. The buffer cache ensures that only one kernel thread modifies a disk block at a time.

```c
// Buffer cache structure
struct buf {
    int flags;
    uint dev;
    uint blockno;
    struct sleeplock lock;
    uint refcnt;
    struct buf *prev;
    struct buf *next;
    struct buf *qnext;
    uchar data[BSIZE];
};
```

Above the buffer cache, the logging layer (`log.c`) provides crash recovery. xv6 uses a write-ahead log to ensure file system consistency. All file system modifications first go to the log, then to their final locations. If the system crashes, the log can replay or discard incomplete operations.

The block allocator manages free disk blocks using a bitmap. Each bit represents one disk block—1 for free, 0 for allocated. This simple scheme allows quick allocation and deallocation:

```c
// Allocate a disk block
static uint balloc(uint dev)
{
    int b, bi, m;
    struct buf *bp;
    
    bp = 0;
    for(b = 0; b < sb.size; b += BPB){
        bp = bread(dev, BBLOCK(b, sb));
        for(bi = 0; bi < BPB && b + bi < sb.size; bi++){
            m = 1 << (bi % 8);
            if((bp->data[bi/8] & m) == 0){  // Is block free?
                bp->data[bi/8] |= m;  // Mark block in use
                log_write(bp);
                brelse(bp);
                bzero(dev, b + bi);
                return b + bi;
            }
        }
        brelse(bp);
    }
    panic("balloc: out of blocks");
}
```

The inode layer implements files and directories. Each inode contains metadata about a file (size, type, link count) and pointers to data blocks. xv6 uses a Unix-like structure with direct blocks and one indirect block:

```c
// On-disk inode structure
struct dinode {
    short type;           // File type
    short major;          // Major device number
    short minor;          // Minor device number
    short nlink;          // Number of links to inode
    uint size;            // Size of file (bytes)
    uint addrs[NDIRECT+1];   // Data block addresses
};
```

This design allows small files to be accessed efficiently (through direct blocks) while still supporting larger files (through the indirect block). The implementation demonstrates the trade-offs in file system design between simplicity, performance, and maximum file size.

## System Calls: The Kernel Interface

System calls form the boundary between user programs and the kernel. In xv6, this interface consists of about 20 calls that provide all necessary functionality. Understanding how system calls work reveals the fundamental separation between user and kernel mode.

When a user program invokes a system call, several steps occur. First, the program executes an `int` instruction, which triggers a processor interrupt. The processor switches to kernel mode, saves the user state, and jumps to the interrupt handler. The kernel examines the system call number, executes the appropriate function, and returns the result.

```c
// User-side system call stub (usys.S)
.globl fork
fork:
    movl $SYS_fork, %eax
    int $T_SYSCALL
    ret

// Kernel-side system call handler (syscall.c)
void syscall(void)
{
    int num;
    
    num = proc->tf->eax;
    if(num > 0 && num < NELEM(syscalls) && syscalls[num]) {
        proc->tf->eax = syscalls[num]();
    } else {
        cprintf("%d %s: unknown sys call %d\n",
                proc->pid, proc->name, num);
        proc->tf->eax = -1;
    }
}
```

This mechanism teaches several crucial concepts. The transition from user to kernel mode demonstrates hardware protection mechanisms. The careful saving and restoring of state shows how the kernel maintains process isolation. The system call table illustrates how operating systems provide a stable interface while allowing internal implementation changes.

## Synchronization: Coordinating Concurrent Activities

Synchronization in xv6 centers on two primitives: spinlocks and sleep locks. These mechanisms prevent race conditions when multiple processors or processes access shared data.

Spinlocks provide mutual exclusion for short critical sections. A processor acquiring a spinlock disables interrupts and spins in a loop until the lock becomes available:

```c
// Acquire a spinlock
void acquire(struct spinlock *lk)
{
    pushcli(); // disable interrupts
    
    // The xchg is atomic
    while(xchg(&lk->locked, 1) != 0)
        ;
    
    // Record info about lock acquisition for debugging
    lk->cpu = cpu;
    getcallerpcs(&lk, lk->pcs);
}

// Release a spinlock
void release(struct spinlock *lk)
{
    lk->pcs[0] = 0;
    lk->cpu = 0;
    
    // The xchg instruction is atomic
    xchg(&lk->locked, 0);
    
    popcli(); // enable interrupts
}
```

The implementation uses the x86 `xchg` instruction, which atomically swaps a register with a memory location. This hardware support ensures that only one processor can acquire the lock at a time, even in multiprocessor systems.

Sleep locks allow processes to sleep while waiting for a lock, making them suitable for longer critical sections:

```c
// Sleep waiting for a condition
void sleep(void *chan, struct spinlock *lk)
{
    if(proc == 0)
        panic("sleep");
    
    if(lk == 0)
        panic("sleep without lk");
    
    // Must acquire ptable.lock to change proc->state
    // and then release lk
    if(lk != &ptable.lock){
        acquire(&ptable.lock);
        release(lk);
    }
    
    // Go to sleep
    proc->chan = chan;
    proc->state = SLEEPING;
    sched();
    
    // Tidy up
    proc->chan = 0;
    
    // Reacquire original lock
    if(lk != &ptable.lock){
        release(&ptable.lock);
        acquire(lk);
    }
}
```

This implementation demonstrates a subtle but crucial aspect of operating systems: avoiding lost wakeups. The careful dance of acquiring one lock before releasing another ensures that wakeup signals aren't missed.

## Scheduling: Sharing the CPU

The xv6 scheduler implements a simple round-robin policy. Each processor continuously loops through the process table, running each RUNNABLE process for one timer interrupt (about 10ms). While basic, this scheduler illustrates fundamental scheduling concepts.

```c
// Per-CPU scheduler loop
void scheduler(void)
{
    struct proc *p;
    
    for(;;){
        // Enable interrupts on this processor
        sti();
        
        // Loop over process table looking for process to run
        acquire(&ptable.lock);
        for(p = ptable.proc; p < &ptable.proc[NPROC]; p++){
            if(p->state != RUNNABLE)
                continue;
            
            // Switch to chosen process
            proc = p;
            switchuvm(p);
            p->state = RUNNING;
            swtch(&cpu->scheduler, p->context);
            switchkvm();
            
            // Process is done running for now
            proc = 0;
        }
        release(&ptable.lock);
    }
}
```

The context switch, implemented in `swtch.S`, saves the current register state and loads the saved state of the next process. This assembly code must carefully preserve the stack and registers to maintain the illusion that each process runs continuously:

```assembly
# Context switch
#   void swtch(struct context **old, struct context *new);
# Save current register context in old
# and then load register context from new.

.globl swtch
swtch:
    movl 4(%esp), %eax
    movl 8(%esp), %edx
    
    # Save old callee-save registers
    pushl %ebp
    pushl %ebx
    pushl %esi
    pushl %edi
    
    # Switch stacks
    movl %esp, (%eax)
    movl %edx, %esp
    
    # Load new callee-save registers
    popl %edi
    popl %esi
    popl %ebx
    popl %ebp
    ret
```

This implementation teaches how operating systems create the illusion of concurrent execution on limited hardware. The round-robin policy, while not optimal for all workloads, provides fairness and prevents starvation.

## Device Drivers: Bridging Software and Hardware

Device drivers in xv6 demonstrate how operating systems interact with hardware. The console driver provides a good example, handling both keyboard input and screen output.

The keyboard driver responds to hardware interrupts. When a key is pressed, the keyboard controller triggers interrupt 33, causing the processor to execute the keyboard interrupt handler:

```c
// Keyboard interrupt handler
void kbdintr(void)
{
    consoleintr(kbdgetc);
}

// Get data from keyboard controller
static int kbdgetc(void)
{
    static uint shift;
    static uchar *charcode[4] = {
        normalmap, shiftmap, ctlmap, ctlmap
    };
    uint st, data, c;
    
    st = inb(KBSTATP);
    if((st & KBS_DIB) == 0)
        return -1;
    data = inb(KBDATAP);
    
    if(data == 0xE0){
        shift |= E0ESC;
        return 0;
    } else if(data & 0x80){
        // Key released
        data = (shift & E0ESC ? data : data & 0x7F);
        shift &= ~(shiftcode[data] | E0ESC);
        return 0;
    } else if(shift & E0ESC){
        // Last character was an E0 escape; or with 0x80
        data |= 0x80;
        shift &= ~E0ESC;
    }
    
    shift |= shiftcode[data];
    shift ^= togglecode[data];
    c = charcode[shift & (CTL | SHIFT)][data];
    if(shift & CAPSLOCK){
        if('a' <= c && c <= 'z')
            c += 'A' - 'a';
        else if('A' <= c && c <= 'Z')
            c += 'a' - 'A';
    }
    return c;
}
```

This code demonstrates several important concepts. The use of I/O ports (`inb` and `outb`) shows how software communicates with hardware. The handling of special keys (shift, control) illustrates state management in device drivers. The interrupt-driven design demonstrates how operating systems respond to external events efficiently.

## The Shell: Bringing It All Together

The xv6 shell (`sh.c`) serves as both a user interface and a demonstration of how system calls work together. Though simple, it implements core shell features: command execution, I/O redirection, and pipes.

The shell's main loop reads commands, parses them, and executes them:

```c
// Simplified shell main loop
int main(void)
{
    static char buf[100];
    int fd;
    
    // Ensure three file descriptors are open
    while((fd = open("console", O_RDWR)) >= 0){
        if(fd >= 3){
            close(fd);
            break;
        }
    }
    
    // Read and run input commands
    while(getcmd(buf, sizeof(buf)) >= 0){
        if(buf[0] == 'c' && buf[1] == 'd' && buf[2] == ' '){
            // Chdir must be called by the parent, not the child
            buf[strlen(buf)-1] = 0;  // chop \n
            if(chdir(buf+3) < 0)
                printf(2, "cannot cd %s\n", buf+3);
            continue;
        }
        if(fork1() == 0)
            runcmd(parsecmd(buf));
        wait();
    }
    exit();
}
```

The implementation of pipes demonstrates the power of Unix abstractions:

```c
// Execute pipe command
case PIPE:
    pcmd = (struct pipecmd*)cmd;
    if(pipe(p) < 0)
        panic("pipe");
    if(fork1() == 0){
        close(1);
        dup(p[1]);
        close(p[0]);
        close(p[1]);
        runcmd(pcmd->left);
    }
    if(fork1() == 0){
        close(0);
        dup(p[0]);
        close(p[0]);
        close(p[1]);
        runcmd(pcmd->right);
    }
    close(p[0]);
    close(p[1]);
    wait();
    wait();
    break;
```

This code teaches how simple primitives (fork, pipe, dup) combine to create powerful abstractions. The careful manipulation of file descriptors shows how Unix achieves I/O redirection without special kernel support.

## Practical Exercises: Learning by Doing

To truly understand xv6, you must experiment with it. Here are exercises that reinforce key concepts:

**Exercise 1: Adding a System Call**
Implement a `getproccount()` system call that returns the number of active processes. This exercise teaches the entire system call path:

1. Add the system call number to `syscall.h`
2. Add the function prototype to `user.h`
3. Add the implementation to `sysproc.c`
4. Add the entry to the system call table in `syscall.c`
5. Add the user-space stub to `usys.S`

**Exercise 2: Implementing Priority Scheduling**
Replace the round-robin scheduler with a priority-based scheduler. This requires:

1. Adding a priority field to `struct proc`
2. Modifying `fork()` to initialize priority
3. Adding a `setpriority()` system call
4. Modifying the scheduler to select the highest-priority process

**Exercise 3: Extending the File System**
Add support for symbolic links. This involves:

1. Adding a new file type `T_SYMLINK`
2. Implementing `symlink()` and updating `open()` to follow links
3. Handling link loops and permissions

These exercises demonstrate that xv6, despite its simplicity, is a real operating system that you can extend and modify.

## Debugging xv6: Tools and Techniques

Debugging operating system code presents unique challenges. When your code runs in kernel mode, traditional debugging tools often don't work. xv6 provides several techniques for debugging:

The `cprintf()` function works like `printf()` but outputs to the console even from interrupt handlers:

```c
cprintf("proc %d (%s) allocating page at %x\n", 
        proc->pid, proc->name, a);
```

QEMU's monitor (accessed with Ctrl-a c) provides powerful debugging features. You can examine registers, memory, and control execution:

```
(qemu) info registers
(qemu) x/10x 0x80100000  
(qemu) stop
(qemu) cont
```

GDB can debug xv6 when QEMU runs with the `-s` flag. This allows source-level debugging of kernel code:

```bash
$ gdb kernel
(gdb) target remote localhost:26000
(gdb) break fork
(gdb) continue
```

The `panic()` function helps debug kernel errors by printing a message and halting:

```c
if(np == 0)
    panic("fork: no free processes");
```

## Common Pitfalls and How to Avoid Them

Working with xv6, students often encounter similar challenges. Understanding these pitfalls helps avoid frustration:

**Race Conditions**: Forgetting to acquire locks before accessing shared data leads to mysterious bugs that appear randomly. Always identify shared data and protect it with appropriate locks.

**Stack Overflow**: The kernel stack is small (4KB). Avoid large local variables or deep recursion in kernel code.

**Memory Leaks**: Forgetting to free allocated memory eventually exhausts the system. Match every `kalloc()` with `kfree()`.

**Deadlocks**: Acquiring locks in different orders in different code paths causes deadlock. Establish a consistent locking order throughout the kernel.

**User/Kernel Confusion**: Remember that kernel code cannot directly access user memory. Use `copyin()` and `copyout()` to transfer data safely.

## Beyond xv6: Connections to Modern Systems

While xv6 simplifies many aspects of operating systems, its concepts directly relate to modern systems. Linux uses similar process structures, though with hundreds of fields instead of dozens. Windows implements threads within processes, but the basic scheduling concepts remain the same.

Modern file systems like ext4 or NTFS add features like journaling, extents, and B-trees, but build on the same inode concept. Virtual memory systems now support huge pages, NUMA awareness, and complex sharing schemes, but still use page tables for address translation.

Understanding xv6 provides the foundation to explore these advanced topics. The simplicity that makes xv6 approachable also makes it an ideal starting point for understanding complex production systems.

## Moving Forward with xv6

Your journey with xv6 has just begun. As you work with the code, you'll discover layers of subtlety in its seemingly simple implementation. Each reading reveals new insights about the careful design decisions that make operating systems work.

Start by reading the xv6 book alongside the source code. Run xv6 in QEMU, try the exercises, and don't hesitate to add debug prints when confused. Join the community of students and educators using xv6—their insights and questions will deepen your understanding.

Remember that xv6 is a teaching tool. Its goal isn't to be fast or feature-complete, but to be understandable. Every line of code exists for a reason, usually to illustrate an important concept. When something seems unnecessarily complex, ask yourself what it teaches about operating system design.

Operating systems remain one of the most challenging and rewarding areas of computer science. Through xv6, you're joining a tradition stretching back to the original Unix pioneers. The concepts you learn here—processes, virtual memory, file systems, and synchronization—form the foundation of all modern computing.

Take time to appreciate the elegance of xv6's design. Notice how simple abstractions like files and processes combine to create a complete system. Observe how careful coding prevents race conditions and maintains invariants. These lessons extend far beyond operating systems to all systems programming.

Your understanding will deepen with each pass through the code. What seems complex today will become clear with practice. The investment you make in understanding xv6 will pay dividends throughout your career in computer science.

## What's Next: Continuing Your Operating Systems Journey

Now that you've grasped the fundamentals of xv6, you're ready to explore deeper waters. The resources below will help you expand your understanding, whether you want to master xv6, explore other teaching operating systems, or dive into production OS code.

### Essential xv6 Resources

**xv6 Book and Source Code**
- Official xv6 book: https://pdos.csail.mit.edu/6.828/2018/xv6/book-rev11.pdf
- xv6 source with line numbers: https://pdos.csail.mit.edu/6.828/2018/xv6/xv6-rev11.pdf
- MIT's xv6 repository: https://github.com/mit-pdos/xv6-public
- RISC-V version: https://github.com/mit-pdos/xv6-riscv

**Video Lectures and Courses**
- MIT 6.828 Operating System Engineering: https://pdos.csail.mit.edu/6.828/2018/schedule.html
- Frans Kaashoek's lectures: https://www.youtube.com/playlist?list=PLfciLKR3SgqNJKKIKUliWoNBBH1VHL3AP
- CS 537 (Wisconsin) videos: https://pages.cs.wisc.edu/~remzi/Classes/537/Spring2018/

### Classic Operating Systems Texts

**Foundational Books**
- "Operating Systems: Three Easy Pieces" by Remzi and Andrea Arpaci-Dusseau  
  Free online: https://pages.cs.wisc.edu/~remzi/OSTEP/  
  The modern standard for OS education, with clear explanations and practical examples

- "The Design and Implementation of the FreeBSD Operating System" by McKusick et al.  
  Bridges the gap between teaching systems and production code

- "Linux Kernel Development" by Robert Love  
  A readable introduction to how Linux actually works

- "Modern Operating Systems" by Andrew Tanenbaum  
  Comprehensive coverage of OS concepts with real-world examples

### Other Teaching Operating Systems

**Pintos** (Stanford)  
https://web.stanford.edu/class/cs140/projects/pintos/pintos.html  
More feature-complete than xv6, with threading, virtual memory, and file system projects

**OS/161** (Harvard)  
http://os161.eecs.harvard.edu/  
Designed for synchronization and virtual memory assignments

**Minix 3** (Vrije Universiteit)  
https://www.minix3.org/  
Microkernel architecture, self-healing capabilities

**GeekOS** (Maryland)  
https://geekos.sourceforge.io/  
Focus on x86 architecture details

### Research Papers That Shaped Operating Systems

**Unix and Plan 9**
- "The UNIX Time-Sharing System" by Ritchie & Thompson (1974)  
  https://people.eecs.berkeley.edu/~brewer/cs262/unix.pdf
- "Plan 9 from Bell Labs" by Pike et al.  
  https://9p.io/sys/doc/9.pdf

**Virtual Memory**
- "The Multics Virtual Memory: Concepts and Design" (1972)  
  https://multicians.org/multics-vm.pdf
- "The Working Set Model for Program Behavior" by Denning (1968)  
  https://denninginstitute.com/pjd/PUBS/WSModel_1968.pdf

**File Systems**
- "A Fast File System for UNIX" by McKusick et al. (1984)  
  https://people.eecs.berkeley.edu/~brewer/cs262/FFS.pdf
- "The Google File System" by Ghemawat et al. (2003)  
  https://static.googleusercontent.com/media/research.google.com/en//archive/gfs-sosp2003.pdf

**Scheduling and Synchronization**
- "Lottery Scheduling" by Waldspurger & Weihl (1994)  
  https://www.usenix.org/legacy/publications/library/proceedings/osdi/full_papers/waldspurger.pdf
-