import { getIcon } from '../svgIcons.js';
import { state, openModal } from '../storeState.js';

export function renderStaffView() {
  const rosterRowsHtml = state.staffRoster.map(s => `
    <tr class="hover:bg-surface-low/50">
      <td class="py-3 px-4">
        <div class="font-bold text-xs text-on-surface">${s.name}</div>
        <div class="font-mono text-[10px] text-on-surface-variant">${s.phone}</div>
      </td>
      <td class="py-3 px-4 font-semibold text-xs text-primary">${s.role}</td>
      <td class="py-3 px-4 font-mono text-xs">
        <span class="badge badge-primary text-[11px]">${s.shift}</span>
      </td>
      <td class="py-3 px-4 font-mono text-xs text-center">${s.hours} hrs/wk</td>
      <td class="py-3 px-4">
        <span class="badge ${s.status === 'On Duty' ? 'badge-success' : 'badge-warning'}">
          ${s.status}
        </span>
      </td>
      <td class="py-3 px-4 text-right">
        <button data-edit-staff-id="${s.id}" class="btn btn-sm btn-outline text-xs text-primary border-primary hover:bg-primary-container">
          ${getIcon('edit', 'svg-icon-sm')} Edit Shift
        </button>
      </td>
    </tr>
  `).join('');

  return `
    <div class="flex-1 overflow-y-auto bg-background p-4 md:p-6 lg:p-8 flex flex-col gap-6">
      <!-- Title & Manager Actions -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span class="badge badge-success text-[10px] mb-1">Director & Manager Control Mode</span>
          <h1 class="font-heading font-extrabold text-2xl text-on-surface tracking-tight">Staff Shift Roster</h1>
          <p class="text-xs text-on-surface-variant mt-0.5">Manage employee shifts, working hours, and operational roles at Sakhile, Ext7.</p>
        </div>

        <div class="flex items-center gap-2">
          <button id="add-staff-btn" class="btn btn-primary text-xs py-2">
            ${getIcon('plus', 'svg-icon-sm')} Add Staff Member
          </button>
        </div>
      </div>

      <!-- Staff Roster Table Container -->
      <div class="bento-card p-0 overflow-hidden">
        <div class="p-4 border-b border-outline-variant bg-surface-container flex justify-between items-center">
          <h3 class="font-heading font-bold text-sm text-on-surface">Weekly Employee Roster — Sakhile Ext7 Branch</h3>
          <span class="font-mono text-xs text-on-surface-variant">Active Shift Week 36</span>
        </div>
        <div class="table-container border-none">
          <table class="data-table">
            <thead>
              <tr>
                <th>Employee Name & Contact</th>
                <th>Designated Role</th>
                <th>Assigned Work Shift</th>
                <th class="text-center">Hours</th>
                <th>Status</th>
                <th class="text-right">Manager Action</th>
              </tr>
            </thead>
            <tbody>
              ${rosterRowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

export function bindStaffEvents() {
  document.querySelectorAll('[data-edit-staff-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-edit-staff-id');
      const staff = state.staffRoster.find(s => s.id === id);
      if (staff) {
        openModal('editShift', staff);
      }
    });
  });

  const addStaffBtn = document.getElementById('add-staff-btn');
  if (addStaffBtn) {
    addStaffBtn.addEventListener('click', () => {
      openModal('addStaff');
    });
  }
}
