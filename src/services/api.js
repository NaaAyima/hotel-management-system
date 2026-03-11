// API Service for J.J.O.J Guest House
const API_BASE_URL = 'http://localhost:5000/api';

// Get JWT token from localStorage
const getToken = () => {
  const user = JSON.parse(localStorage.getItem('hotelUser') || '{}');
  return user.token || '';
};

// Common fetch wrapper with authentication
const fetchWithAuth = async (endpoint, options = {}) => {
  const token = getToken();

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle unauthorized
    if (response.status === 401) {
      localStorage.removeItem('hotelUser');
      window.location.href = '/';
      throw new Error('Unauthorized - Please login again');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ─── Normalizers ──────────────────────────────────────────────────────────────
// Backend uses different field names; these map them to what the UI expects.

const normalizeRoom = (room) => ({
  ...room,
  roomNumber: room.number,
  pricePerNight: parseFloat(room.price || 0),
});

const normalizeGuest = (guest) => ({
  ...guest,
  numberOfNights: guest.nights,
  roomPrice: parseFloat(guest.pricePerNight || 0),
  balance: parseFloat(guest.balance || 0),
  totalAmount: parseFloat(guest.totalAmount || 0),
  amountPaid: parseFloat(guest.amountPaid || 0),
  notes: guest.specialRequests || '',
});

const normalizePayment = (payment) => ({
  ...payment,
  paymentType: payment.type,
  roomNumber: payment.room,
  guestName: payment.guest,
  paymentMethod: payment.method,
  paymentDate: payment.date,
  amount: parseFloat(payment.amount || 0),
});

// ─── Authentication APIs ───────────────────────────────────────────────────────
export const authAPI = {
  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    return data.data;
  },
};

// ─── Rooms APIs ────────────────────────────────────────────────────────────────
export const roomsAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.type) params.append('type', filters.type);

    const query = params.toString() ? `?${params.toString()}` : '';
    const data = await fetchWithAuth(`/rooms${query}`);
    return { rooms: (data.data || []).map(normalizeRoom) };
  },

  getById: async (id) => {
    const data = await fetchWithAuth(`/rooms/${id}`);
    return normalizeRoom(data.data || data);
  },

  create: async (roomData) => {
    return fetchWithAuth('/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData),
    });
  },

  update: async (id, roomData) => {
    return fetchWithAuth(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roomData),
    });
  },

  delete: async (id) => {
    return fetchWithAuth(`/rooms/${id}`, {
      method: 'DELETE',
    });
  },

  getAvailableCount: async () => {
    return fetchWithAuth('/rooms/available/count');
  },
};

// ─── Guests APIs ───────────────────────────────────────────────────────────────
export const guestsAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);

    const query = params.toString() ? `?${params.toString()}` : '';
    const data = await fetchWithAuth(`/guests${query}`);
    return { guests: (data.data || []).map(normalizeGuest) };
  },

  getById: async (id) => {
    const data = await fetchWithAuth(`/guests/${id}`);
    return normalizeGuest(data.data || data);
  },

  // Map UI field names → backend field names before POST
  checkIn: async (guestData) => {
    const payload = {
      name: guestData.guestName,
      phone: guestData.guestPhone,
      email: guestData.guestEmail || '',
      idType: guestData.guestIdType || 'National ID',
      idNumber: guestData.guestIdNumber || '',
      roomId: guestData.roomId,
      roomNumber: guestData.roomNumber,
      roomType: guestData.roomType || '',
      checkInDate: guestData.checkInDate,
      checkOutDate: guestData.checkOutDate,
      nights: guestData.numberOfNights,
      pricePerNight: guestData.pricePerNight || 0,
      totalAmount: guestData.totalAmount,
      amountPaid: guestData.amountPaid,
      balance: guestData.balance,
      paymentStatus: guestData.paymentStatus || 'Partial',
      paymentMethod: guestData.paymentMethod || '',
      specialRequests: guestData.notes || '',
      status: 'Checked In',
    };
    return fetchWithAuth('/guests', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  update: async (id, guestData) => {
    return fetchWithAuth(`/guests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(guestData),
    });
  },

  delete: async (id) => {
    return fetchWithAuth(`/guests/${id}`, {
      method: 'DELETE',
    });
  },
};

// ─── Bookings APIs ─────────────────────────────────────────────────────────────
export const bookingsAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.checkInDate) params.append('checkInDate', filters.checkInDate);
    if (filters.checkOutDate) params.append('checkOutDate', filters.checkOutDate);

    const query = params.toString() ? `?${params.toString()}` : '';
    const data = await fetchWithAuth(`/bookings${query}`);
    return { bookings: data.data || [] };
  },

  getById: async (id) => {
    const data = await fetchWithAuth(`/bookings/${id}`);
    return data.data || data;
  },

  create: async (bookingData) => {
    return fetchWithAuth('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  update: async (id, bookingData) => {
    return fetchWithAuth(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookingData),
    });
  },

  cancel: async (id) => {
    return fetchWithAuth(`/bookings/${id}`, {
      method: 'DELETE',
    });
  },
};

// ─── Payments APIs ─────────────────────────────────────────────────────────────
export const paymentsAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.method) params.append('method', filters.method);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const query = params.toString() ? `?${params.toString()}` : '';
    const data = await fetchWithAuth(`/payments${query}`);
    return { payments: (data.data || []).map(normalizePayment) };
  },

  getById: async (id) => {
    const data = await fetchWithAuth(`/payments/${id}`);
    return normalizePayment(data.data || data);
  },

  // Map UI field names → backend field names before POST
  create: async (paymentData) => {
    const payload = {
      type: paymentData.paymentType || paymentData.type,
      room: paymentData.roomNumber || paymentData.room,
      guest: paymentData.guestName || paymentData.guest,
      amount: paymentData.amount,
      method: paymentData.paymentMethod || paymentData.method,
      status: paymentData.status || 'Completed',
      reference: paymentData.reference || '',
      notes: paymentData.notes || '',
      guestId: paymentData.guestId,
      bookingId: paymentData.bookingId,
    };
    return fetchWithAuth('/payments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getStats: async () => {
    const data = await fetchWithAuth('/payments/summary/stats');
    return data.data || {};
  },
};

// ─── Dashboard Stats ───────────────────────────────────────────────────────────
export const dashboardAPI = {
  getStats: async () => {
    try {
      const [roomsData, guestsData, bookingsData] = await Promise.all([
        roomsAPI.getAll(),
        guestsAPI.getAll({ status: 'Checked In' }),
        bookingsAPI.getAll({ status: 'Reserved' }),
      ]);

      const totalRooms = roomsData.rooms?.length || 0;
      const availableRooms = roomsData.rooms?.filter(r => r.status === 'Available').length || 0;
      const occupiedRooms = roomsData.rooms?.filter(r => r.status === 'Occupied').length || 0;
      const reservedRooms = roomsData.rooms?.filter(r => r.status === 'Reserved').length || 0;
      const cleaningRooms = roomsData.rooms?.filter(r => r.status === 'Cleaning').length || 0;

      // Get guests with checkout today
      const today = new Date().toISOString().split('T')[0];
      const checkoutsToday = guestsData.guests?.filter(g => g.checkOutDate === today).length || 0;

      return {
        totalRooms,
        availableRooms,
        occupiedRooms,
        reservedRooms,
        cleaningRooms,
        checkoutsToday,
        recentGuests: guestsData.guests || [],
        upcomingBookings: bookingsData.bookings || [],
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },
};

export default {
  auth: authAPI,
  rooms: roomsAPI,
  guests: guestsAPI,
  bookings: bookingsAPI,
  payments: paymentsAPI,
  dashboard: dashboardAPI,
};
