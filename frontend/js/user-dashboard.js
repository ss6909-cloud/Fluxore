// Check authentication on page load
if (!checkAuth()) {
    window.location.href = 'login.html';
}

const currentUser = getUser();
let selectedPortForBooking = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('welcomeUser').textContent = `Hello, ${currentUser.full_name}`;
    
    await loadDashboardData();
    await loadStations();
    await loadUserVehicles();
    await loadBookings();
    await loadVehicleMakes();
});

// Load Dashboard Overview Data
async function loadDashboardData() {
    try {
        const bookings = await apiRequest(`/bookings/user/${currentUser.user_id}`);
        const vehicles = await apiRequest(`/vehicles/user/${currentUser.user_id}`);

        // Update stats
        document.getElementById('totalBookings').textContent = bookings.length;
        document.getElementById('upcomingBookings').textContent = 
            bookings.filter(b => b.booking_status === 'CONFIRMED').length;
        document.getElementById('myVehicles').textContent = vehicles.length;

        // Show recent bookings
        const recentList = document.getElementById('recentBookingsList');
        const recent = bookings.slice(0, 5);

        if (recent.length === 0) {
            recentList.innerHTML = '<p>No bookings yet</p>';
        } else {
            recentList.innerHTML = recent.map(booking => `
                <div class="booking-card">
                    <div class="booking-header">
                        <h4>${booking.station_name}</h4>
                        <span class="booking-status status-${booking.booking_status.toLowerCase()}">
                            ${booking.booking_status}
                        </span>
                    </div>
                    <p>📅 ${formatDate(booking.booking_date)} at ${formatTime(booking.start_time)}</p>
                    <p>🚗 ${booking.make_name} ${booking.model_name}</p>
                    <p>🔌 Port ${booking.port_number}</p>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Load Stations
async function loadStations() {
    try {
        const stations = await apiRequest('/stations');
        const stationsList = document.getElementById('stationsList');
        const bookStationSelect = document.getElementById('bookStation');

        stationsList.innerHTML = stations.map(station => `
            <div class="station-card">
                <h3>${station.station_name}</h3>
                <p class="station-location">📍 ${station.city}</p>
                <p>${station.address}</p>
                <div class="station-info">
                    <span>🔌 ${station.total_ports} Ports</span>
                    <span>✅ ${station.available_ports || 0} Available</span>
                </div>
            </div>
        `).join('');

        // Populate booking station select
        bookStationSelect.innerHTML = '<option value="">Select a station</option>' +
            stations.map(s => `<option value="${s.station_id}">${s.station_name} - ${s.city}</option>`).join('');

    } catch (error) {
        console.error('Error loading stations:', error);
    }
}

// Load User Vehicles
async function loadUserVehicles() {
    try {
        const vehicles = await apiRequest(`/vehicles/user/${currentUser.user_id}`);
        const vehiclesList = document.getElementById('vehiclesList');
        const bookVehicleSelect = document.getElementById('bookVehicle');

        if (vehicles.length === 0) {
            vehiclesList.innerHTML = '<p>No vehicles added yet. Add your first vehicle!</p>';
            bookVehicleSelect.innerHTML = '<option value="">No vehicles available</option>';
        } else {
            vehiclesList.innerHTML = vehicles.map(v => `
                <div class="station-card">
                    <h3>${v.make_name} ${v.model_name}</h3>
                    <p>🔋 Battery: ${v.battery_capacity_kwh} kWh</p>
                    <p>⚡ Charging Rate: ${v.charging_rate_kw} kW</p>
                    <p>📊 Efficiency: ${v.charging_efficiency}%</p>
                    ${v.license_plate ? `<p>🚗 ${v.license_plate}</p>` : ''}
                    ${v.is_primary ? '<span class="booking-status status-confirmed">Primary</span>' : ''}
                </div>
            `).join('');

            bookVehicleSelect.innerHTML = '<option value="">Select your vehicle</option>' +
                vehicles.map(v => `
                    <option value="${v.user_vehicle_id}">
                        ${v.make_name} ${v.model_name} ${v.license_plate ? '(' + v.license_plate + ')' : ''}
                    </option>
                `).join('');
        }
    } catch (error) {
        console.error('Error loading vehicles:', error);
    }
}

// Check Availability
async function checkAvailability() {
    const stationId = document.getElementById('bookStation').value;
    const date = document.getElementById('bookDate').value;

    if (!stationId || !date) {
        alert('Please select station and date');
        return;
    }

    try {
        const data = await apiRequest(`/stations/${stationId}/availability?date=${date}`);
        const slotsDiv = document.getElementById('availableSlots');
        const slotsGrid = document.getElementById('slotsGrid');

        slotsGrid.innerHTML = data.ports.map(port => `
            <div class="station-card">
                <h4>Port ${port.port_number} (${port.port_type})</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 0.5rem; margin-top: 1rem;">
                    ${port.slots.map(slot => `
                        <button 
                            class="tab-btn ${slot.available ? '' : 'disabled'}" 
                            style="${!slot.available ? 'opacity: 0.3; cursor: not-allowed;' : ''}"
                            ${slot.available ? `onclick="selectSlot(${port.port_id}, '${slot.start_time}', '${slot.end_time}')"` : 'disabled'}
                        >
                            ${formatTime(slot.start_time)}
                        </button>
                    `).join('')}
                </div>
            </div>
        `).join('');

        slotsDiv.style.display = 'block';
    } catch (error) {
        alert('Error checking availability: ' + error.message);
    }
}

// Select Slot and Book
window.selectSlot = async function(portId, startTime, endTime) {
    const stationId = document.getElementById('bookStation').value;
    const vehicleId = document.getElementById('bookVehicle').value;
    const date = document.getElementById('bookDate').value;
    const currentCharge = document.getElementById('currentCharge').value;
    const targetCharge = document.getElementById('targetCharge').value;

    if (!vehicleId) {
        alert('Please select your vehicle');
        return;
    }

    if (!confirm(`Book slot from ${formatTime(startTime)} to ${formatTime(endTime)}?`)) {
        return;
    }

    try {
        const booking = await apiRequest('/bookings', {
            method: 'POST',
            body: JSON.stringify({
                user_id: currentUser.user_id,
                station_id: stationId,
                port_id: portId,
                user_vehicle_id: vehicleId,
                booking_date: date,
                start_time: startTime,
                end_time: endTime,
                current_charge_percentage: currentCharge,
                target_charge_percentage: targetCharge
            })
        });

        document.getElementById('bookingSuccess').textContent = 'Booking created successfully!';
        document.getElementById('bookingSuccess').style.display = 'block';
        document.getElementById('bookingError').style.display = 'none';

        // Redirect to payment
        setTimeout(() => {
            alert('Redirecting to payment...');
            window.location.href = `payment.html?booking_id=${booking.booking.booking_id}`;
        }, 1500);

    } catch (error) {
        document.getElementById('bookingError').textContent = error.message;
        document.getElementById('bookingError').style.display = 'block';
        document.getElementById('bookingSuccess').style.display = 'none';
    }
};

// Load Bookings
async function loadBookings(status = 'all') {
    try {
        let url = `/bookings/user/${currentUser.user_id}`;
        if (status !== 'all') {
            url += `?status=${status}`;
        }

        const bookings = await apiRequest(url);
        const bookingsList = document.getElementById('bookingsList');

        if (bookings.length === 0) {
            bookingsList.innerHTML = '<p>No bookings found</p>';
            return;
        }

        bookingsList.innerHTML = bookings.map(booking => `
            <div class="booking-card">
                <div class="booking-header">
                    <div>
                        <h3>${booking.station_name}</h3>
                        <p class="station-location">📍 ${booking.city}</p>
                    </div>
                    <span class="booking-status status-${booking.booking_status.toLowerCase()}">
                        ${booking.booking_status}
                    </span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
                    <div>
                        <p><strong>Date:</strong> ${formatDate(booking.booking_date)}</p>
                        <p><strong>Time:</strong> ${formatTime(booking.start_time)} - ${formatTime(booking.end_time)}</p>
                    </div>
                    <div>
                        <p><strong>Vehicle:</strong> ${booking.make_name} ${booking.model_name}</p>
                        <p><strong>Port:</strong> ${booking.port_number} (${booking.port_type})</p>
                    </div>
                    <div>
                        <p><strong>Charge:</strong> ${booking.current_charge_percentage}% → ${booking.target_charge_percentage}%</p>
                        <p><strong>Energy:</strong> ${booking.estimated_energy_kwh?.toFixed(2)} kWh</p>
                    </div>
                </div>
                ${booking.booking_status === 'CONFIRMED' ? `
                    <button class="btn-danger" style="margin-top: 1rem;" onclick="cancelBooking(${booking.booking_id})">
                        Cancel Booking
                    </button>
                ` : ''}
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

window.filterBookings = function(status) {
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    loadBookings(status);
};

// Cancel Booking
window.cancelBooking = async function(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }

    const reason = prompt('Reason for cancellation (optional):');

    try {
        await apiRequest(`/bookings/${bookingId}/cancel`, {
            method: 'PUT',
            body: JSON.stringify({
                user_id: currentUser.user_id,
                cancellation_reason: reason
            })
        });

        alert('Booking cancelled successfully');
        loadBookings();
        loadDashboardData();
    } catch (error) {
        alert('Error cancelling booking: ' + error.message);
    }
};

// Vehicle Management
async function loadVehicleMakes() {
    try {
        const makes = await apiRequest('/vehicles/makes');
        const select = document.getElementById('vehicleMake');
        select.innerHTML = '<option value="">Select make</option>' +
            makes.map(m => `<option value="${m.make_id}">${m.make_name}</option>`).join('');
    } catch (error) {
        console.error('Error loading makes:', error);
    }
}

window.loadModels = async function() {
    const makeId = document.getElementById('vehicleMake').value;
    if (!makeId) return;

    try {
        const models = await apiRequest(`/vehicles/makes/${makeId}/models`);
        const select = document.getElementById('vehicleModel');
        select.innerHTML = '<option value="">Select model</option>' +
            models.map(m => `<option value="${m.model_id}">${m.model_name} (${m.year})</option>`).join('');
    } catch (error) {
        console.error('Error loading models:', error);
    }
};

window.showAddVehicleForm = function() {
    document.getElementById('addVehicleForm').style.display = 'block';
};

window.closeAddVehicleForm = function() {
    document.getElementById('addVehicleForm').style.display = 'none';
};

document.getElementById('vehicleForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const modelId = document.getElementById('vehicleModel').value;
    const licensePlate = document.getElementById('licensePlate').value;

    try {
        await apiRequest(`/vehicles/user/${currentUser.user_id}`, {
            method: 'POST',
            body: JSON.stringify({
                model_id: modelId,
                license_plate: licensePlate,
                is_primary: false
            })
        });

        alert('Vehicle added successfully');
        closeAddVehicleForm();
        loadUserVehicles();
        document.getElementById('vehicleForm').reset();
    } catch (error) {
        alert('Error adding vehicle: ' + error.message);
    }
});

// Set minimum date for booking to today
document.getElementById('bookDate').min = new Date().toISOString().split('T')[0];
