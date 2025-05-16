import { Component, computed, effect, signal } from '@angular/core';
import { FilterType, TodoModel } from '../../models/todo';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ConfirmModalComponent } from '../todo/confirm-modal.component'; // Ajusta la ruta si hace falta
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, ConfirmModalComponent, CommonModule],
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css']
})
export class TodoComponent {
  todolist = signal<TodoModel[]>([])
  filter = signal<FilterType>('all');

  todoListFiltered = computed(() => {
    const filter = this.filter()
    const todos = this.todolist()

    switch (filter) {
      case 'active':
        return todos.filter((todo) => !todo.completed)
      case 'completed':
        return todos.filter((todo) => todo.completed)
      default:
        return todos
    }
  })

  newTodoForm = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)]
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)]
    })
  });

  // Estado para el modal de confirmación
  showConfirmModal = signal(false);
  todoToDelete = signal<TodoModel | null>(null);

  constructor() {
    effect(() => {
      localStorage.setItem('todos', JSON.stringify(this.todolist()))
    })
  }

  ngOnInit(): void {
    const storage = localStorage.getItem('todos')
    if (storage) {
      this.todolist.set(JSON.parse(storage))
    }
  }

  changeFilter(filterString: FilterType) {
    this.filter.set(filterString)
  }

  addTodo() {
    const title = this.newTodoForm.controls.title.value?.trim();
    const description = this.newTodoForm.controls.description.value?.trim();

    if (this.newTodoForm.valid && title && description) {
      this.todolist.update((prev_todos) => [
        ...prev_todos,
        {
          id: Date.now(),
          title,
          description,
          completed: false
        }
      ]);
      this.newTodoForm.reset();
    }
  }

  toggleTodo(todoId: number) {
    this.todolist.update((prev_todos) => prev_todos.map((todo) => {
      return todo.id === todoId ? { ...todo, completed: !todo.completed }
        : todo;
    }))
  }

  // En vez de borrar directamente, abrimos el modal
  removeTodo(todoId: number) {
    const todo = this.todolist().find(t => t.id === todoId) ?? null;
    this.todoToDelete.set(todo);
    this.showConfirmModal.set(true);
  }

  // Confirmar borrado desde el modal
  confirmDelete() {
    const todo = this.todoToDelete();
    if (todo) {
      this.todolist.update((prev_todos) => prev_todos.filter((t) => t.id !== todo.id));
    }
    this.showConfirmModal.set(false);
    this.todoToDelete.set(null);
  }

  // Cancelar borrado desde el modal
  cancelDelete() {
    this.showConfirmModal.set(false);
    this.todoToDelete.set(null);
  }

  editTodo(todoId: number) {
    return this.todolist.update((prev_todos) => prev_todos.map((todo) => {
      return todo.id === todoId ?
        { ...todo, editing: true } :
        { ...todo, editing: false }
    }))
  }

  saveEdit(todoId: number) {
    this.todolist.update(todos =>
      todos.map(todo =>
        todo.id === todoId ? { ...todo, editing: false } : todo
      )
    );
  }

  getEmptyMessage(): string {
    switch (this.filter()) {
      case 'all':
        return 'There are no tasks registered.';
      case 'active':
        return 'There are no active tasks.';
      case 'completed':
        return 'There are no completed tasks.';
      default:
        return '';
    }
  }
}
