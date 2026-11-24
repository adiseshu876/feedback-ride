# MoveInSync — Visitor Registration Wizard

Angular 15 implementation of the Visitor Registration Wizard with Status Board assignment.

## Run locally

1. Install Node.js (Node 16.13+ recommended for this Angular 15 project).
2. Extract this folder and open it in VS Code.
3. Open the integrated terminal in the project directory.
4. Run:

```bash
npm install
npm start
```

5. Open `http://localhost:4200` if it does not open automatically.

## Features

- Three-step visitor registration wizard.
- Reactive Forms validation: required name, minimum 3 characters, and Indian mobile number pattern.
- Searchable host picker with no-results state.
- Back/Edit navigation preserves entered values.
- Review screen and submit creates a `PENDING` visit.
- Status board with guarded transitions:
  - `PENDING` → `APPROVED` or `DENIED`
  - `APPROVED` → `CHECKED_IN`
  - `CHECKED_IN` → `CHECKED_OUT`
- State chips and action buttons are rendered according to current state.
- All / Pending / On premises filter tabs with live counts.
- Responsive layout. Data is in memory and resets on page refresh.

## Walkthrough talking points

- Reactive Forms own validation and form values; wizard navigation changes the visible step without recreating the forms.
- Step 1 and Step 2 are separate FormGroups, so Back and Edit preserve data.
- Host search filters the supplied in-memory host list; a host is only valid after selecting an actual option.
- The `transition()` method is the single state-transition gate. It checks an allow-list before mutating the state, and the template uses `ngSwitch` to show only legal actions.
- The status board and filter counts are derived from the same `visits` array; no duplicate state is maintained.
- Persistence and API integration are intentionally omitted because the assignment explicitly requests in-memory mock data only.

## Suggested manual test

1. Type `Pr` in the visitor name. The minimum-length message appears after blur/touch and Continue remains disabled.
2. Enter `Priya Sharma` and `+919812341234`; Continue becomes enabled.
3. Select Meeting and search/select Manish R (`EMP-77`).
4. Go Back and verify Step 1 values remain. Continue, then use Edit links on Review.
5. Submit. A new `PENDING` row appears.
6. Approve → only Check in appears. Check in → only Check out appears. Check out → no actions.
7. Register another visitor and Reject → no actions remain.
8. Search `zzzz` in the host picker → no hosts found.
9. Try `98123-41234` or a 9-digit phone number → validation rejects it.
