import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders the brand, the starting rank and the badge counter', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand')?.textContent).toContain('Quest');
    expect(compiled.querySelector('.xp-rank')?.textContent).toContain('Intern');
    expect(compiled.querySelector('.xp-value')?.textContent).toContain('0 XP');
    expect(compiled.textContent).toContain('🏅 0 /');
    expect(compiled.textContent).toContain('RAG Quest');
  });
});
