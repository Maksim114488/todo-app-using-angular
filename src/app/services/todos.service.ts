import { Injectable } from '@angular/core';
import { Todo } from '../types/todo';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, ReplaySubject, Subject, shareReplay, switchMap, tap, withLatestFrom } from 'rxjs';

const USER_ID = '11862';
const API_URl = 'https://mate.academy/students-api';

@Injectable({
  providedIn: 'root'
})
export class TodosService {
  private todos$$ = new BehaviorSubject<Todo[]>([]);

  todos$ = this.todos$$.asObservable();

  constructor(
    private http: HttpClient,
  ) {}

  loadTodos() {
    return this.http.get<Todo[]>(`${API_URl}/todos?userId=${USER_ID}`)
    .pipe(
      tap(todos => {
        this.todos$$.next(todos)
      }),
    );
  }

  createTodo(title: string) {
    return this.http.post<Todo>(`${API_URl}/todos`, {
      title,
      userId: USER_ID,
      completed: false,
    })
    .pipe(
      withLatestFrom(this.todos$$),
      tap(([createdTodo, todos]) => {
        this.todos$$.next(
          [...todos, createdTodo]
        );
      }),
    )
  }

  updateTodo({ id, ...data }: Todo) {
    return this.http.patch<Todo>(`${API_URl}/todos/${id}`, data)
    .pipe(
      withLatestFrom(this.todos$$),
      tap(([updatedTodo, todos]) => {
        this.todos$$.next(
          todos.map(todo => todo.id === id ? updatedTodo : todo)
        );
      }),
    )
  }

  deleteTodo({ id }: Todo) {
    return this.http.delete<Todo>(`${API_URl}/todos/${id}`)
    .pipe(
      withLatestFrom(this.todos$$),
      tap(([_, todos]) => {
        this.todos$$.next(
          todos.filter(todo => todo.id !== id),
        );
      }),
    )
  }
}
