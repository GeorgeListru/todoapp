from rest_framework import serializers
from .models import ToDoItem, ToDoItemFile, Profile
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserSerializer(serializers.ModelSerializer):
    isAdmin = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model=User
        fields = ['id', 'username', 'email', 'isAdmin']
    
    def get_isAdmin(self,obj):
        return obj.is_staff

class UserSerializerWithToken(UserSerializer):
    token = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'isAdmin', 'token']

    def get_token(self,obj):
        token = RefreshToken.for_user(obj)
        return str(token.access_token)

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self,attrs):
        data = super().validate(attrs)

        serializer = UserSerializerWithToken(self.user).data

        for k, v in serializer.items():
            data[k] = v

        return data

class ToDoItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ToDoItem
        fields = '__all__'

class ToDoItemFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ToDoItemFile
        fields = '__all__'

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'