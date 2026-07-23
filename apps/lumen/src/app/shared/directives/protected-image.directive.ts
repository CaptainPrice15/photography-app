import { Directive, ElementRef, HostListener, Input, OnInit, inject } from '@angular/core';

@Directive({
  selector: '[appProtectedImage]',
  standalone: true
})
export class ProtectedImageDirective implements OnInit {
  @Input() unprotected = false;
  @Input() linkWrapped = false;
  
  private el = inject(ElementRef<HTMLImageElement>);

  ngOnInit() {
    if (!this.unprotected) {
      this.el.nativeElement.draggable = false;
      this.el.nativeElement.style.userSelect = 'none';
      this.el.nativeElement.style.webkitUserDrag = 'none';
      this.el.nativeElement.style.pointerEvents = 'auto';
    }
  }

  @HostListener('contextmenu', ['$event'])
  onContextMenu(event: MouseEvent) {
    if (!this.unprotected) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  @HostListener('dragstart', ['$event'])
  onDragStart(event: DragEvent) {
    if (!this.unprotected) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (!this.unprotected && event.button === 2) {
      event.preventDefault();
      return false;
    }
    return true;
  }
}