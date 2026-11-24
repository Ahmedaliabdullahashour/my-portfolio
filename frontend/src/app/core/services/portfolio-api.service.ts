import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, of, timeout } from 'rxjs';

import { API_CONFIG } from '../config/api.config';
import { resolveAssetUrl } from '../utils/asset-url.util';
import {
  MOCK_EDUCATION,
  MOCK_EXPERIENCE,
  MOCK_PROJECTS,
  MOCK_SETTINGS,
  MOCK_SKILLS,
} from '../data/portfolio.mock';
import type {
  Education,
  Experience,
  PortfolioSettings,
  Project,
  Skill,
} from '../models';

export interface AdminMessage {
  id: string;
  _id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface UploadResponse {
  url: string;
  filename: string;
  originalname: string;
  size: number;
  mimetype: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  id: string;
}

@Injectable({ providedIn: 'root' })
export class PortfolioApiService {
  private readonly http = inject(HttpClient);

  // Settings
  getSettings(): Observable<PortfolioSettings> {
    if (API_CONFIG.useMockData) {
      return of(clone(MOCK_SETTINGS)).pipe(delay(API_CONFIG.mockLatency));
    }
    return this.http
      .get<PortfolioSettings>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.settings}`)
      .pipe(timeout(API_CONFIG.requestTimeout));
  }

  updateSettings(settings: Partial<PortfolioSettings>): Observable<PortfolioSettings> {
    return this.http
      .put<PortfolioSettings>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.settings}`, settings)
      .pipe(timeout(API_CONFIG.requestTimeout));
  }

  // Skills
  getSkills(): Observable<Skill[]> {
    if (API_CONFIG.useMockData) {
      return of(clone(MOCK_SKILLS)).pipe(delay(API_CONFIG.mockLatency));
    }
    return this.http
      .get<Skill[]>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.skills}`)
      .pipe(timeout(API_CONFIG.requestTimeout));
  }

  createSkill(skill: Partial<Skill>): Observable<Skill> {
    return this.http
      .post<Skill>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.skills}`, skill)
      .pipe(timeout(API_CONFIG.requestTimeout));
  }

  updateSkill(id: string, skill: Partial<Skill>): Observable<Skill> {
    return this.http
      .put<Skill>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.skills}/${id}`, skill)
      .pipe(timeout(API_CONFIG.requestTimeout));
  }

  deleteSkill(id: string): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.skills}/${id}`)
      .pipe(timeout(API_CONFIG.requestTimeout));
  }

  // Projects
  getProjects(): Observable<Project[]> {
    if (API_CONFIG.useMockData) {
      return of(clone(MOCK_PROJECTS)).pipe(delay(API_CONFIG.mockLatency));
    }
    return this.http
      .get<Project[]>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.projects}`)
      .pipe(timeout(API_CONFIG.requestTimeout));
  }

  getProjectById(id: string): Observable<Project> {
    return this.http
      .get<Project>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.projects}/${id}`)
      .pipe(timeout(API_CONFIG.requestTimeout));
  }

  createProject(project: Partial<Project>): Observable<Project> {
    return this.http
      .post<Project>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.projects}`, project)
      .pipe(timeout(API_CONFIG.requestTimeout));
  }

  updateProject(id: string, project: Partial<Project>): Observable<Project> {
    return this.http
      .put<Project>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.projects}/${id}`, project)
      .pipe(timeout(API_CONFIG.requestTimeout));
  }

  deleteProject(id: string): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.projects}/${id}`)
      .pipe(timeout(API_CONFIG.requestTimeout));
  }

  // Experience
  getExperience(): Observable<Experience[]> {
    if (API_CONFIG.useMockData) {
      return of(clone(MOCK_EXPERIENCE)).pipe(delay(API_CONFIG.mockLatency));
    }
    return this.http
      .get<Experience[]>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.experience}`)
      .pipe(timeout(API_CONFIG.requestTimeout));
  }

  createExperience(exp: Partial<Experience>): Observable<Experience> {
    return this.http
      .post<Experience>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.experience}`, exp)
      .pipe(timeout(API_CONFIG.requestTimeout));
  }

  updateExperience(id: string, exp: Partial<Experience>): Observable<Experience> {
    return this.http
      .put<Experience>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.experience}/${id}`, exp)
      .pipe(timeout(API_CONFIG.requestTimeout));
  }

  deleteExperience(id: string): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.experience}/${id}`)
      .pipe(timeout(API_CONFIG.requestTimeout));
  }

  // Education
  getEducation(): Observable<Education[]> {
    if (API_CONFIG.useMockData) {
      return of(clone(MOCK_EDUCATION)).pipe(delay(API_CONFIG.mockLatency));
    }
    return this.http
      .get<Education[]>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.education}`)
      .pipe(timeout(API_CONFIG.requestTimeout));
  }

  createEducation(edu: Partial<Education>): Observable<Education> {
    return this.http
      .post<Education>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.education}`, edu)
      .pipe(timeout(API_CONFIG.requestTimeout));
  }

  updateEducation(id: string, edu: Partial<Education>): Observable<Education> {
    return this.http
      .put<Education>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.education}/${id}`, edu)
      .pipe(timeout(API_CONFIG.requestTimeout));
  }

  deleteEducation(id: string): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.education}/${id}`)
      .pipe(timeout(API_CONFIG.requestTimeout));
  }

  // Messages (Admin)
  getMessages(): Observable<AdminMessage[]> {
    return this.http
      .get<AdminMessage[]>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.contact}`)
      .pipe(timeout(API_CONFIG.requestTimeout));
  }

  markMessageRead(id: string): Observable<AdminMessage> {
    return this.http
      .patch<AdminMessage>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.contact}/${id}/read`, {})
      .pipe(timeout(API_CONFIG.requestTimeout));
  }

  deleteMessage(id: string): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.contact}/${id}`)
      .pipe(timeout(API_CONFIG.requestTimeout));
  }

  // File Upload
  uploadFile(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<UploadResponse>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.upload}`, formData)
      .pipe(timeout(API_CONFIG.requestTimeout));
  }

  // Authentication
  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth}/login`, credentials)
      .pipe(timeout(API_CONFIG.requestTimeout));
  }

  getMe(): Observable<{ id: string; email: string }> {
    return this.http
      .get<{ id: string; email: string }>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth}/me`)
      .pipe(timeout(API_CONFIG.requestTimeout));
  }

  getAssetUrl(url: string | null | undefined): string {
    return resolveAssetUrl(url);
  }
}

function clone<T>(value: T): T {
  return typeof structuredClone === 'function'
    ? structuredClone(value)
    : (JSON.parse(JSON.stringify(value)) as T);
}





