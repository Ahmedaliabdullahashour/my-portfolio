import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { IconComponent } from '../../../../shared/components/icon/icon';

@Component({
  selector: 'app-admin-module',
  imports: [RouterLink, IconComponent],
  template: `
    <div class="module-page">
      <a class="module-page__back" routerLink="/admin">
        <app-icon name="arrow-right" />
        Back to overview
      </a>

      <header class="module-page__head">
        <span class="module-page__icon"><app-icon [name]="icon" /></span>
        <div>
          <span class="eyebrow">Admin module</span>
          <h1 class="module-page__title">{{ name }}</h1>
          <p class="module-page__desc">{{ description }}</p>
        </div>
      </header>

      <div class="module-page__grid">
        <section class="module-page__card">
          <h2 class="module-page__card-title">Planned operations</h2>
          <ul class="module-page__list">
            @for (operation of operations; track operation) {
              <li>
                <span class="module-page__check"><app-icon name="check" /></span>
                {{ operation }}
              </li>
            }
          </ul>
        </section>

        <section class="module-page__card">
          <h2 class="module-page__card-title">Backend contract</h2>
          <pre class="module-page__code"><code>{{ endpoint }}</code></pre>
          <p class="module-page__note">
            The Angular data layer already reads this collection from
            <code>API_CONFIG.baseUrl</code>. Flip <code>useMockData</code> to <code>false</code> once the route is
            deployed.
          </p>
        </section>
      </div>

      <div class="module-page__status">
        <span class="status-dot"></span>
        <p>
          This screen is intentionally a structural placeholder. It proves the protected routing, lazy loading and
          layout so the CRUD forms can be dropped in without restructuring the app.
        </p>
      </div>
    </div>
  `,
  styleUrl: './admin-module.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminModulePage {
  private readonly route = inject(ActivatedRoute);

  protected readonly name = (this.route.snapshot.data['module'] as string | undefined) ?? 'Module';
  protected readonly icon = (this.route.snapshot.data['icon'] as string | undefined) ?? 'folder';
  protected readonly description =
    (this.route.snapshot.data['description'] as string | undefined) ?? '';

  protected readonly endpoint = `GET    /api/${this.name.toLowerCase()}\nPOST   /api/${this.name.toLowerCase()}\nPATCH  /api/${this.name.toLowerCase()}/:id\nDELETE /api/${this.name.toLowerCase()}/:id`;

  protected readonly operations = [
    'List and search existing records',
    'Create a new record with validated reactive forms',
    'Edit and preview changes before saving',
    'Delete with an explicit confirmation step',
  ];
}
