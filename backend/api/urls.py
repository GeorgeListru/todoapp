from django.urls import path
from .views import RegisterUser, MyTokenObtainPairView, GetUserProfile, GetUserToDoList, \
    AddInToDoList, RemoveItemFromToDoList, ChangeCompletedStatus, GetToDoListItem, DownloadTaskFile,\
    DeleteTaskFile, UploadTaskFile, ReplaceTask, GetProfileAvatar, SaveProfileAvatar, changeEmail,\
    changePassword, passwordForgot, resetPassword
urlpatterns = [
    path('users/register', RegisterUser, name = 'register-user'),
    path('users/login', MyTokenObtainPairView.as_view(), name = 'login-user'),
    path('users/profile', GetUserProfile, name='user-profile'),
    path('todolist/getlist', GetUserToDoList, name='get-todolist'),
    path('todolist/getitem', GetToDoListItem, name='get-todolist-item'),
    path('todolist/additem', AddInToDoList, name='add-item'),
    path('todolist/delete', RemoveItemFromToDoList, name='delete-item'),
    path('todolist/changecompleted', ChangeCompletedStatus, name='change-completed-status'),
    path('todolist/downloadfile', DownloadTaskFile, name='download-task-file'),
    path('todolist/deletefile', DeleteTaskFile, name='delete-task-file'),
    path('todolist/uploadfile', UploadTaskFile, name='upload-task-file'),
    path('todolist/replaceitem', ReplaceTask, name="replace-task"),
    path('users/avatar', GetProfileAvatar, name='user-avatar'),
    path('users/saveavatar', SaveProfileAvatar, name="save-avatar"),
    path('users/changeemail', changeEmail, name="change-email"),
    path('users/changepassword', changePassword, name="change-password"),
    path('users/passwordforgot', passwordForgot, name="password-forgot"),
    path('users/passwordreset', resetPassword, name="reset-password"),
]