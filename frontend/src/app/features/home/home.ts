import { ChangeDetectionStrategy, Component } from '@angular/core';

import { AboutComponent } from '../about/about';
import { ContactComponent } from '../contact/contact';
import { EducationComponent } from '../education/education';
import { ExperienceComponent } from '../experience/experience';
import { HeroComponent } from '../hero/hero';
import { ProjectsComponent } from '../projects/projects';
import { SkillsComponent } from '../skills/skills';

@Component({
  selector: 'app-home',
  imports: [
    HeroComponent,
    AboutComponent,
    SkillsComponent,
    ProjectsComponent,
    ExperienceComponent,
    EducationComponent,
    ContactComponent,
  ],
  template: `
    <app-hero />
    <app-about />
    <app-skills />
    <app-projects />
    <app-experience />
    <app-education />
    <app-contact />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {}
