from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token


urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/auth/', include('accounts.urls')),

    # 🔐 Auth (login)
    path('api/auth/login/', obtain_auth_token, name='api-login'),

    # 📦 Equipment APIs
    path('api/', include('equipment.urls')),
]
