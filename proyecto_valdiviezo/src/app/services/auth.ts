import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/login';

  constructor(private http: HttpClient) { }

  login(dni: string, clave: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { dni, clave });
  }

  logout() {
    localStorage.clear();
  }
}