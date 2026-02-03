from django.contrib.auth.models import User
from rest_framework import serializers


# 🔐 Registration serializer (unchanged)
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
        )
        return user


# 👤 User profile serializer (Phase 4)
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',   # read-only
            'email',
            'first_name',
            'last_name',
        ]
        read_only_fields = ['id', 'username']
