from django.urls import path
from .views import RegisterUser, MyTokenObtainPairView, GetUserProfile, GetUserToDoList, AddInToDoList
urlpatterns = [
    path('users/register', RegisterUser, name = 'register-user'),
    path('users/login', MyTokenObtainPairView.as_view(), name = 'login-user'),
    path('users/profile', GetUserProfile, name='user-profile'),
    path('todolist/getlist', GetUserToDoList, name='get-todolist'),
    path('todolist/additem', AddInToDoList, name='add-item')
]