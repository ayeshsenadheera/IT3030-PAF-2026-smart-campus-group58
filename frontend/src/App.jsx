import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import ProtectedRoute        from '@/routes/ProtectedRoute'
import AdminRoute            from '@/routes/AdminRoute'
import TechnicianBlockRoute  from '@/routes/TechnicianBlockRoute'
import AppLayout             from '@/components/layout/AppLayout'

import LandingPage                 from '@/pages/LandingPage'
import LoginPage                   from '@/pages/LoginPage'
import OAuth2Redirect              from '@/pages/OAuth2Redirect'
import ResetPasswordPage           from '@/pages/ResetPasswordPage'
import HomePage                    from '@/pages/HomePage'
import DashboardPage               from '@/pages/dashboard/DashboardPage'
import ResourcesPage               from '@/pages/resources/ResourcesPage'
import ResourceDetailPage          from '@/pages/resources/ResourceDetailPage'
import BookingsPage                from '@/pages/bookings/BookingsPage'
import BookingDetailPage           from '@/pages/bookings/BookingDetailPage'
import CreateBookingPage           from '@/pages/bookings/CreateBookingPage'
import QRCheckInPage               from '@/pages/bookings/QRCheckInPage'
import TicketsPage                 from '@/pages/tickets/TicketsPage'
import TicketDetailPage            from '@/pages/tickets/TicketDetailPage'
import CreateTicketPage            from '@/pages/tickets/CreateTicketPage'
import AdminUsersPage              from '@/pages/admin/AdminUsersPage'
import AdminBookingsPage           from '@/pages/admin/AdminBookingsPage'
import AdminResourcesPage          from '@/pages/admin/AdminResourcesPage'
import AdminTicketsPage            from '@/pages/admin/AdminTicketsPage'
import AdminAnalyticsPage          from '@/pages/admin/AdminAnalyticsPage'
import NotificationPreferencesPage from '@/pages/NotificationPreferencesPage'
import NotFoundPage                from '@/pages/NotFoundPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/"                  element={<LandingPage />} />
        <Route path="/login"             element={<LoginPage />} />
        <Route path="/oauth2/redirect"   element={<OAuth2Redirect />} />
        <Route path="/reset-password"    element={<ResetPasswordPage />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/home"      element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/notification-preferences" element={<NotificationPreferencesPage />} />

            <Route path="/resources"     element={<ResourcesPage />} />
            <Route path="/resources/:id" element={<ResourceDetailPage />} />

            <Route element={<TechnicianBlockRoute />}>
              <Route path="/bookings"        element={<BookingsPage />} />
              <Route path="/bookings/new"    element={<CreateBookingPage />} />
              <Route path="/bookings/:id"    element={<BookingDetailPage />} />
              <Route path="/bookings/:id/qr" element={<QRCheckInPage />} />
            </Route>

            <Route path="/tickets"     element={<TicketsPage />} />
            <Route path="/tickets/new" element={<CreateTicketPage />} />
            <Route path="/tickets/:id" element={<TicketDetailPage />} />

            <Route element={<AdminRoute />}>
              <Route path="/admin/users"     element={<AdminUsersPage />} />
              <Route path="/admin/bookings"  element={<AdminBookingsPage />} />
              <Route path="/admin/resources" element={<AdminResourcesPage />} />
              <Route path="/admin/tickets"   element={<AdminTicketsPage />} />
              <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  )
}
