// Drag & Drop Interfaces

//namespaces are a TypeScript-specific way to organize code and avoid naming conflicts. They are not part of the JavaScript language and are not supported in ES2015 modules. However, since the project is using AMD module system, namespaces can be used to group related interfaces together.
namespace App {
  export interface Draggable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
  }

  export interface DragTarget {
    dragOverHandler(event: DragEvent): void;
    dropHandler(event: DragEvent): void;
    dragLeaveHandler(event: DragEvent): void;
  }
}
