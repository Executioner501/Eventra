"""
URL configuration for eventra_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from events.views import event_bookings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# Import volunteer views from events app
from events.views import (
    list_volunteers, 
    create_volunteer, 
    delete_volunteer, 
    volunteer_login, 
    volunteer_verify_ticket,
    admin_profile,
    admin_verify_ticket,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('events.urls')),
    # JWT Authentication
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Volunteer Management
    path('api/volunteers/', list_volunteers, name='list_volunteers'),
    path('api/volunteers/create/', create_volunteer, name='create_volunteer'),
    path('api/volunteers/<int:volunteer_id>/delete/', delete_volunteer, name='delete_volunteer'),
    path('api/volunteer/login/', volunteer_login, name='volunteer_login'),
    path('api/volunteer/verify-ticket/', volunteer_verify_ticket, name='volunteer_verify_ticket'),
    path('api/events/<int:event_id>/bookings/', event_bookings, name='event-bookings'),
    path('api/admin/profile/', admin_profile, name='admin_profile'),
    path('api/admin/verify-ticket/', admin_verify_ticket, name='admin_verify_ticket'),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)