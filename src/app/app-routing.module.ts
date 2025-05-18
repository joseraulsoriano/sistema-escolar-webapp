import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginScreenComponent } from './screens/login-screen/login-screen.component';
import { RegistroUsuariosScreenComponent } from './screens/registro-usuarios-screen/registro-usuarios-screen.component';
import { HomeScreenComponent } from './screens/home-screen/home-screen.component';
import { AdminScreenComponent } from './screens/admin-screen/admin-screen.component';
import { AlumnosScreenComponent } from './screens/alumnos-screen/alumnos-screen.component';
import { MaestrosScreenComponent } from './screens/maestros-screen/maestros-screen.component';
import { GraficasScreenComponent } from './screens/graficas-screen/graficas-screen.component';
import { RegistroEventoComponent } from './partials/registro-evento/registro-evento/registro-evento.component';
import { EventosAcademicosScreenComponent } from './screens/eventos-academicos-screen/eventos-academicos-screen.component';

const routes: Routes = [
  { path:'', component: LoginScreenComponent, pathMatch: 'full'},
  { path:'registro-usuarios', component: RegistroUsuariosScreenComponent, pathMatch: 'full'},
  { path: 'registro-usuarios/:rol/:id', component: RegistroUsuariosScreenComponent, pathMatch: 'full' },
  { path:'home', component: HomeScreenComponent, pathMatch: 'full'},
  { path: 'alumnos', component: AlumnosScreenComponent, pathMatch: 'full' },
  { path: 'maestros', component: MaestrosScreenComponent, pathMatch: 'full' },
  { path: 'administrador', component: AdminScreenComponent, pathMatch: 'full' },
  { path: 'graficas', component: GraficasScreenComponent, pathMatch: 'full' },
  { path: 'registro-evento', component: RegistroEventoComponent },
  { path: 'registro-evento/:id', component: RegistroEventoComponent },
  { path: 'eventos-academicos', component: EventosAcademicosScreenComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
