from django.urls import path
from .views import RegisterUser, MyTokenObtainPairView, GetUserProfile, GetUserToDoList, \
    AddInToDoList, RemoveItemFromToDoList, ChangeCompletedStatus, GetToDoListItem, DownloadTaskFile,\
    DeleteaTaskFile, UploadTaskFile, ReplaceTask, GetProfileAvatar, SaveProfileAvatar
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
    path('todolist/deletefile', DeleteaTaskFile, name='delete-task-file'),
    path('todolist/uploadfile', UploadTaskFile, name='upload-task-file'),
    path('todolist/replaceitem', ReplaceTask, name="replace-task"),
    path('users/avatar', GetProfileAvatar, name='user-avatar'),
    path('users/saveavatar', SaveProfileAvatar, name="save-avatar")
]