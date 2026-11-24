import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

type VisitState = 'PENDING' | 'APPROVED' | 'DENIED' | 'CHECKED_IN' | 'CHECKED_OUT';
type Purpose = 'Meeting' | 'Interview' | 'Delivery' | 'Maintenance';

interface Host {
  id: string;
  name: string;
}

interface Visit {
  id: string;
  visitor: { name: string; contact: string };
  purpose: Purpose;
  hostEmployee: string;
  state: VisitState;
  createdAt: Date;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  readonly hosts: Host[] = [
    { id: 'EMP-77', name: 'Manish R' },
    { id: 'EMP-31', name: 'Sricharan' },
    { id: 'EMP-52', name: 'Dheeraj S' }
  ];

  readonly purposes: Purpose[] = ['Meeting', 'Interview', 'Delivery', 'Maintenance'];
  readonly visitorForm: FormGroup;
  readonly visitForm: FormGroup;

  currentStep = 1;
  hostSearch = '';
  hostDropdownOpen = false;
  selectedHost: Host | null = null;
  activeFilter: 'ALL' | 'PENDING' | 'ON_PREMISES' = 'ALL';
  submittedMessage = '';
  private nextVisitNumber = 3301;

  visits: Visit[] = [];

  constructor(private fb: FormBuilder) {
    this.visitorForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      contact: ['', [Validators.required, Validators.pattern(/^(?:\+91)?[6-9]\d{9}$/)]]
    });

    this.visitForm = this.fb.group({
      purpose: ['', Validators.required],
      hostEmployee: ['', Validators.required]
    });
  }

  get nameControl() { return this.visitorForm.get('name'); }
  get contactControl() { return this.visitorForm.get('contact'); }
  get purposeControl() { return this.visitForm.get('purpose'); }

  get filteredHosts(): Host[] {
    const query = this.hostSearch.trim().toLowerCase();
    return this.hosts.filter(host =>
      host.name.toLowerCase().includes(query) || host.id.toLowerCase().includes(query)
    );
  }

  get visibleVisits(): Visit[] {
    if (this.activeFilter === 'PENDING') {
      return this.visits.filter(visit => visit.state === 'PENDING');
    }
    if (this.activeFilter === 'ON_PREMISES') {
      return this.visits.filter(visit => visit.state === 'CHECKED_IN');
    }
    return this.visits;
  }

  get pendingCount(): number {
    return this.visits.filter(visit => visit.state === 'PENDING').length;
  }

  get onPremisesCount(): number {
    return this.visits.filter(visit => visit.state === 'CHECKED_IN').length;
  }

  goToStep(step: number): void {
    if (step === 2 && this.visitorForm.invalid) {
      this.visitorForm.markAllAsTouched();
      return;
    }
    if (step === 3 && (this.visitorForm.invalid || this.visitForm.invalid)) {
      this.visitorForm.markAllAsTouched();
      this.visitForm.markAllAsTouched();
      return;
    }
    this.currentStep = step;
    this.submittedMessage = '';
  }

  nextFromStepOne(): void {
    if (this.visitorForm.invalid) {
      this.visitorForm.markAllAsTouched();
      return;
    }
    this.goToStep(2);
  }

  selectHost(host: Host): void {
    this.selectedHost = host;
    this.visitForm.patchValue({ hostEmployee: host.id });
    this.hostSearch = host.name;
    this.hostDropdownOpen = false;
  }

  onHostSearchChange(value: string): void {
    this.hostSearch = value;
    this.hostDropdownOpen = true;
    if (this.selectedHost && value !== this.selectedHost.name) {
      this.selectedHost = null;
      this.visitForm.patchValue({ hostEmployee: '' });
    }
  }

  submitVisit(): void {
    if (this.visitorForm.invalid || this.visitForm.invalid) {
      this.visitorForm.markAllAsTouched();
      this.visitForm.markAllAsTouched();
      return;
    }

    const visitor = this.visitorForm.getRawValue() as { name: string; contact: string };
    const details = this.visitForm.getRawValue() as { purpose: Purpose; hostEmployee: string };

    const newVisit: Visit = {
      id: `V-${this.nextVisitNumber++}`,
      visitor: { name: visitor.name.trim(), contact: visitor.contact.trim() },
      purpose: details.purpose,
      hostEmployee: details.hostEmployee,
      state: 'PENDING',
      createdAt: new Date()
    };

    this.visits = [newVisit, ...this.visits];
    this.resetWizard();
    this.activeFilter = 'ALL';
    this.submittedMessage = `${newVisit.visitor.name} has been registered successfully.`;
  }

  resetWizard(): void {
    this.visitorForm.reset();
    this.visitForm.reset();
    this.selectedHost = null;
    this.hostSearch = '';
    this.hostDropdownOpen = false;
    this.currentStep = 1;
  }

  transition(visit: Visit, action: 'APPROVE' | 'REJECT' | 'CHECK_IN' | 'CHECK_OUT'): void {
    const allowed: Record<VisitState, string[]> = {
      PENDING: ['APPROVE', 'REJECT'],
      APPROVED: ['CHECK_IN'],
      DENIED: [],
      CHECKED_IN: ['CHECK_OUT'],
      CHECKED_OUT: []
    };

    if (!allowed[visit.state].includes(action)) {
      return;
    }

    const nextState: Record<typeof action, VisitState> = {
      APPROVE: 'APPROVED',
      REJECT: 'DENIED',
      CHECK_IN: 'CHECKED_IN',
      CHECK_OUT: 'CHECKED_OUT'
    };

    visit.state = nextState[action];
    this.visits = [...this.visits];
  }

  hostName(employeeId: string): string {
    return this.hosts.find(host => host.id === employeeId)?.name ?? employeeId;
  }

  stateLabel(state: VisitState): string {
    return state.replace('_', ' ');
  }

  trackByVisitId(_index: number, visit: Visit): string {
    return visit.id;
  }
}