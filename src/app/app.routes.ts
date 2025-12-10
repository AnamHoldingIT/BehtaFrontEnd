import { Routes } from '@angular/router';
import { HomePage } from './Home/home-page/home-page';
import { AuthPage } from './Accounts/auth-page/auth-page';
import { UsersLogin } from './Accounts/users-login/users-login';
import { SignUp } from './Accounts/sign-up/sign-up';
import { AdminLogin } from './Accounts/admin-login/admin-login';
import { Panel } from './AdminPanel/panel/panel';
import { Log } from './AdminPanel/log/log';
import { UserProfileComponent } from './Accounts/user-profile/user-profile';
import { UserList } from './AdminPanel/user-list/user-list';
import { UserDetails } from './AdminPanel/user-details/user-details';
import { SupportHubComponent } from './Support/support-hub/support-hub';
import { SupportMyTickets } from './Support/support-my-tickets/support-my-tickets';
import { SupportTicketDetail } from './Support/support-ticket-detail/support-ticket-detail';
import { SupportNewTicket } from './Support/support-new-ticket/support-new-ticket';
import { adminGuard } from './Guards/admin.guard';
import { AdminTicketsList } from './AdminPanel/admin-tickets-list/admin-tickets-list';
import { AdminTicketsDetail } from './AdminPanel/admin-tickets-detail/admin-tickets-detail';
import { AdminPatchnoteList } from './AdminPanel/admin-patchnote-list/admin-patchnote-list';
import { AdminPatchnoteDetails } from './AdminPanel/admin-patchnote-details/admin-patchnote-details';

export const routes: Routes = [
    { path: '', component: HomePage },
    {
        path: 'accounts', component: AuthPage, children: [
            { path: 'login', component: UsersLogin },
            { path: 'signup', component: SignUp }
        ]
    },
    { path: 'accounts/profile', component: UserProfileComponent },
    { path: 'admin-login', component: AdminLogin },
    {
        path: 'admin-panel', component: Panel, children: [
            { path: 'log', component: Log },
            { path: 'users', component: UserList },
            { path: 'users/:id', component: UserDetails },
            { path: 'tickets', component: AdminTicketsList },
            { path: 'tickets/:id', component: AdminTicketsDetail },
            {path:'patchnotes' , component:AdminPatchnoteList},
            {path:'patchnotes/:id' , component:AdminPatchnoteDetails}
        ]
    },
    { path: 'support/hub', component: SupportHubComponent },
    { path: 'support/tickets', component: SupportMyTickets },
    { path: 'support/tickets/:id', component: SupportTicketDetail },
    { path: 'support/tickets/new', component: SupportNewTicket }

];
