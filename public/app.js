const state = {
  token: localStorage.getItem('vrentalToken'),
  user: JSON.parse(localStorage.getItem('vrentalUser') || 'null'),
  vehicles: [],
  bookings: [],
  users: []
};

const fallbackPhoto = 'https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=900&q=80';

const els = {
  accountLabel: document.querySelector('#accountLabel'),
  logoutBtn: document.querySelector('#logoutBtn'),
  authPanel: document.querySelector('#authPanel'),
  loginForm: document.querySelector('#loginForm'),
  registerForm: document.querySelector('#registerForm'),
  vehicleGrid: document.querySelector('#vehicleGrid'),
  ordersTable: document.querySelector('#ordersTable'),
  adminBookingsTable: document.querySelector('#adminBookingsTable'),
  adminVehicleList: document.querySelector('#adminVehicleList'),
  adminUserList: document.querySelector('#adminUserList'),
  vehicleForm: document.querySelector('#vehicleForm'),
  toast: document.querySelector('#toast')
};

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('show');
  setTimeout(() => els.toast.classList.remove('show'), 2600);
}

function saveSession(token, user) {
  state.token = token;
  state.user = user;
  localStorage.setItem('vrentalToken', token);
  localStorage.setItem('vrentalUser', JSON.stringify(user));
  updateAccount();
}

function clearSession() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('vrentalToken');
  localStorage.removeItem('vrentalUser');
  updateAccount();
}

function authHeaders() {
  return state.token ? { Authorization: `Bearer ${state.token}` } : {};
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function money(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0));
}

function statusClass(status) {
  return `status ${status}`;
}

function updateAccount() {
  els.authPanel.classList.toggle('hidden', Boolean(state.user));
  els.accountLabel.textContent = state.user ? `${state.user.name} ${state.user.isAdmin ? '(Admin)' : ''}` : 'Guest';
  document.querySelectorAll('.admin-only').forEach((el) => el.classList.toggle('hidden', !state.user?.isAdmin));
  els.logoutBtn.classList.toggle('hidden', !state.user);
}

function switchView(view) {
  document.querySelectorAll('.view').forEach((el) => el.classList.remove('active-view'));
  document.querySelector(`#${view}View`).classList.add('active-view');
  document.querySelectorAll('.nav-link').forEach((el) => el.classList.toggle('active', el.dataset.view === view));
  if (view === 'orders') loadBookings();
  if (view === 'admin') loadAdmin();
}

function switchAdminTab(tab) {
  document.querySelectorAll('.tab').forEach((el) => el.classList.toggle('active', el.dataset.adminTab === tab));
  document.querySelectorAll('.admin-tab').forEach((el) => el.classList.remove('active-admin-tab'));
  document.querySelector(`#admin${tab[0].toUpperCase()}${tab.slice(1)}`).classList.add('active-admin-tab');
}

async function loadVehicles() {
  els.vehicleGrid.innerHTML = '<p class="state">Loading vehicles...</p>';
  state.vehicles = await api('/api/vehicles');
  renderVehicles();
  if (state.user?.isAdmin) renderAdminVehicles();
}

function renderVehicles() {
  if (!state.vehicles.length) {
    els.vehicleGrid.innerHTML = '<p class="state">No vehicles yet. Admins can add cars in the dashboard.</p>';
    return;
  }

  els.vehicleGrid.innerHTML = state.vehicles.map((vehicle) => `
    <article class="vehicle-card">
      <img src="${vehicle.photoUrl || fallbackPhoto}" alt="${vehicle.make} ${vehicle.model}">
      <div class="vehicle-body">
        <span class="pill">${vehicle.status}</span>
        <h3>${vehicle.make} ${vehicle.model}</h3>
        <p>${vehicle.year || 'Year not set'} - ${money(vehicle.pricePerDay)} per day</p>
        <form class="booking-form" data-vehicle-id="${vehicle.id}">
          <input name="startDate" type="date" required>
          <input name="endDate" type="date" required>
          <button class="button primary" type="submit" ${vehicle.status !== 'available' ? 'disabled' : ''}>Book Vehicle</button>
        </form>
      </div>
    </article>
  `).join('');
}

async function loadBookings() {
  if (!state.user) {
    els.ordersTable.innerHTML = '<tr><td colspan="5">Login to track your bookings.</td></tr>';
    return;
  }

  state.bookings = await api('/api/bookings');
  renderOrders();
  if (state.user.isAdmin) renderAdminBookings();
}

function vehicleName(booking) {
  return booking.Vehicle ? `${booking.Vehicle.make} ${booking.Vehicle.model}` : 'Vehicle removed';
}

function renderOrders() {
  const mine = state.user?.isAdmin ? state.bookings.filter((b) => b.customerId === state.user.id) : state.bookings;
  if (!mine.length) {
    els.ordersTable.innerHTML = '<tr><td colspan="5">No bookings yet.</td></tr>';
    return;
  }

  els.ordersTable.innerHTML = mine.map((booking) => `
    <tr>
      <td>${vehicleName(booking)}</td>
      <td>${booking.startDate} to ${booking.endDate}</td>
      <td><span class="${statusClass(booking.status)}">${booking.status}</span></td>
      <td><p class="status-note">${booking.statusNote || 'No message yet.'}</p></td>
      <td>${booking.status === 'pending' ? `<button class="small-button cancel-booking" data-id="${booking.id}" type="button">Cancel</button>` : '-'}</td>
    </tr>
  `).join('');
}

async function loadAdmin() {
  if (!state.user?.isAdmin) return;
  await Promise.all([loadVehicles(), loadBookings(), loadUsers()]);
}

function renderAdminVehicles() {
  if (!state.vehicles.length) {
    els.adminVehicleList.innerHTML = '<p class="state">No cars added yet.</p>';
    return;
  }

  els.adminVehicleList.innerHTML = state.vehicles.map((vehicle) => `
    <article class="admin-item">
      <img src="${vehicle.photoUrl || fallbackPhoto}" alt="${vehicle.make} ${vehicle.model}">
      <div>
        <h3>${vehicle.make} ${vehicle.model}</h3>
        <p>${vehicle.year || 'Year not set'} - ${money(vehicle.pricePerDay)} - ${vehicle.status}</p>
      </div>
      <div class="row-actions">
        <button class="small-button edit-vehicle" data-id="${vehicle.id}" type="button">Edit</button>
        <button class="small-button danger delete-vehicle" data-id="${vehicle.id}" type="button">Delete</button>
      </div>
    </article>
  `).join('');
}

function renderAdminBookings() {
  if (!state.bookings.length) {
    els.adminBookingsTable.innerHTML = '<tr><td colspan="6">No bookings yet.</td></tr>';
    return;
  }

  els.adminBookingsTable.innerHTML = state.bookings.map((booking) => `
    <tr>
      <td>${booking.Customer?.name || 'Customer removed'}</td>
      <td>${vehicleName(booking)}</td>
      <td>${booking.startDate} to ${booking.endDate}</td>
      <td><span class="${statusClass(booking.status)}">${booking.status}</span></td>
      <td>
        <textarea class="booking-note" data-id="${booking.id}" placeholder="Message for customer">${booking.statusNote || ''}</textarea>
      </td>
      <td>
        <select class="booking-status" data-id="${booking.id}">
          ${['pending', 'approved', 'rejected', 'cancelled', 'completed'].map((status) => `<option value="${status}" ${booking.status === status ? 'selected' : ''}>${status}</option>`).join('')}
        </select>
      </td>
    </tr>
  `).join('');
}

async function loadUsers() {
  state.users = await api('/api/users');
  renderUsers();
}

function renderUsers() {
  if (!state.users.length) {
    els.adminUserList.innerHTML = '<p class="state">No users found.</p>';
    return;
  }

  els.adminUserList.innerHTML = state.users.map((user) => `
    <article class="admin-item">
      <div>
        <h3>${user.name}</h3>
        <p>${user.email}</p>
      </div>
      <label class="check">
        <input class="toggle-admin" data-id="${user.id}" type="checkbox" ${user.isAdmin ? 'checked' : ''}>
        Admin
      </label>
      <button class="small-button danger delete-user" data-id="${user.id}" type="button">Delete</button>
    </article>
  `).join('');
}

els.loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  try {
    const data = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(form))
    });
    saveSession(data.token, data.user);
    showToast('Logged in');
    await Promise.all([loadVehicles(), loadBookings()]);
  } catch (error) { showToast(error.message); }
});

els.registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  try {
    const data = await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(form))
    });
    if (data.token && data.user) {
      saveSession(data.token, data.user);
      await Promise.all([loadVehicles(), loadBookings()]);
      if (data.user.isAdmin) switchView('admin');
    }
    showToast(data.message || 'Account created and logged in');
    event.currentTarget.reset();
  } catch (error) { showToast(error.message); }
});

els.logoutBtn.addEventListener('click', () => {
  clearSession();
  switchView('browse');
  showToast('Logged out');
});

document.querySelectorAll('.nav-link').forEach((button) => {
  button.addEventListener('click', () => switchView(button.dataset.view));
});

document.querySelectorAll('.tab').forEach((button) => {
  button.addEventListener('click', () => switchAdminTab(button.dataset.adminTab));
});

document.querySelector('#refreshVehicles').addEventListener('click', loadVehicles);
document.querySelector('#refreshOrders').addEventListener('click', loadBookings);

document.addEventListener('submit', async (event) => {
  if (!event.target.matches('.booking-form')) return;
  event.preventDefault();
  if (!state.user) return showToast('Login before booking a vehicle');

  const form = new FormData(event.target);
  try {
    await api('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({
        vehicleId: event.target.dataset.vehicleId,
        startDate: form.get('startDate'),
        endDate: form.get('endDate')
      })
    });
    showToast('Booking sent for approval');
    event.target.reset();
    await loadBookings();
  } catch (error) { showToast(error.message); }
});

els.vehicleForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(event.target));
  const id = values.id;
  delete values.id;

  try {
    await api(id ? `/api/vehicles/${id}` : '/api/vehicles', {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(values)
    });
    showToast(id ? 'Car updated' : 'Car added');
    event.target.reset();
    await loadVehicles();
  } catch (error) { showToast(error.message); }
});

document.querySelector('#clearVehicleForm').addEventListener('click', () => els.vehicleForm.reset());

document.addEventListener('click', async (event) => {
  const editVehicle = event.target.closest('.edit-vehicle');
  const deleteVehicle = event.target.closest('.delete-vehicle');
  const deleteUser = event.target.closest('.delete-user');
  const cancelBooking = event.target.closest('.cancel-booking');

  try {
    if (editVehicle) {
      const vehicle = state.vehicles.find((item) => item.id === Number(editVehicle.dataset.id));
      Object.entries(vehicle).forEach(([key, value]) => {
        if (els.vehicleForm.elements[key]) els.vehicleForm.elements[key].value = value || '';
      });
      switchAdminTab('vehicles');
    }

    if (deleteVehicle && confirm('Delete this car?')) {
      await api(`/api/vehicles/${deleteVehicle.dataset.id}`, { method: 'DELETE' });
      showToast('Car deleted');
      await loadVehicles();
    }

    if (deleteUser && confirm('Delete this user?')) {
      await api(`/api/users/${deleteUser.dataset.id}`, { method: 'DELETE' });
      showToast('User deleted');
      await loadUsers();
    }

    if (cancelBooking) {
      await api(`/api/bookings/${cancelBooking.dataset.id}/cancel`, { method: 'POST' });
      showToast('Booking cancelled');
      await loadBookings();
    }
  } catch (error) { showToast(error.message); }
});

document.addEventListener('change', async (event) => {
  try {
    if (event.target.matches('.booking-status')) {
      const note = document.querySelector(`.booking-note[data-id="${event.target.dataset.id}"]`);
      await api(`/api/bookings/${event.target.dataset.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: event.target.value, statusNote: note?.value || '' })
      });
      showToast('Booking status updated');
      await loadBookings();
    }

    if (event.target.matches('.toggle-admin')) {
      await api(`/api/users/${event.target.dataset.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isAdmin: event.target.checked })
      });
      showToast('User updated');
      await loadUsers();
    }
  } catch (error) { showToast(error.message); }
});

updateAccount();
loadVehicles().catch((error) => showToast(error.message));
if (state.user) loadBookings().catch((error) => showToast(error.message));
