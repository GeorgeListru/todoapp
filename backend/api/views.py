from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer, MyTokenObtainPairSerializer,UserSerializerWithToken, ToDoItemSerializer, ToDoItemFileSerializer, ProfileSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import ToDoItem, ToDoItemFile, Profile
from django.utils import timezone
from django.http import HttpResponse
from django.conf import settings
from PIL import Image
import base64
@api_view(['POST'])
def RegisterUser(request):
    try:
        data = request.data
        
        if User.objects.filter(username=data['username']).exists():
            message = {"message","Username is already used"}
            return Response(message, status=status.HTTP_409_CONFLICT)
        if User.objects.filter(email=data['email']).exists():
            message = {"message","Email is already used"}
            return Response(message, status=status.HTTP_409_CONFLICT)
    
        user = User.objects.create(
            username = data['username'],
            email = data['email'],
            password = make_password(data['password'])
        )
        Profile.objects.create(user = user)
        serializer = UserSerializerWithToken(user, many=False)
        return Response(serializer.data)
    except:
        message = {'message':'We can\'t process your request'}
        return Response(message, status = status.HTTP_400_BAD_REQUEST)


#For Login
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def GetUserProfile(request):
    user = request.user
    serializer = UserSerializer(user, many = False)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def GetUserToDoList(request):
    user = request.user
    todoList=ToDoItem.objects.filter(user= user).order_by('-createdAt')
    listSerializer = ToDoItemSerializer(todoList, many=True)
    return Response(listSerializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def AddInToDoList(request):
    user = request.user
    data = request.data
    todoItem = ToDoItem.objects.create(
        user=user,
        title = data['title'],
    )
    serializedToDoItem = ToDoItemSerializer(todoItem, many=False)
    return Response(serializedToDoItem.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def RemoveItemFromToDoList(request):
    user = request.user
    item_id = request.data['id']
    todoList=ToDoItem.objects.filter(user=user)
    toDeleteItem = ToDoItem.objects.get(pk=item_id)
    if toDeleteItem in todoList:
        toDeleteItem.delete()
        message = {'message': 'Item no. '+str(item_id)+ " was deleted successfully!"}
        return Response(message, status=status.HTTP_200_OK)
    message = {'message': "No Authorization provided"}
    return Response(message, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ChangeCompletedStatus(request):
    user = request.user
    item_id = request.data['id']
    todoList=ToDoItem.objects.filter(user=user)
    toModifyItem = ToDoItem.objects.get(pk=item_id)
    if toModifyItem in todoList:
        toModifyItem.isCompleted = not(toModifyItem.isCompleted)
        if toModifyItem.isCompleted == True:
            toModifyItem.completedAt = timezone.now()
        else:
            toModifyItem.completedAt = None
        toModifyItem.save()
        serializedToDoItem = ToDoItemSerializer(toModifyItem, many=False)
        return Response(serializedToDoItem.data)
    message = {'message':'No Authorization provided'}
    return Response(message, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def GetToDoListItem(request):
    user = request.user
    item_id = request.data['id']
    todoList=ToDoItem.objects.filter(user=user)
    task = ToDoItem.objects.get(pk=item_id)
    if task in todoList:
        fileList = ToDoItemFile.objects.filter(toDoItem=task)
        taskSerializer = ToDoItemSerializer(task, many=False)
        fileListSerializer = ToDoItemFileSerializer(fileList, many=True)
        responseData = taskSerializer.data
        responseData['files'] = fileListSerializer.data
        return Response(responseData)
    message = {'message':'No Authorization provided'}
    return Response(message, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def DownloadTaskFile(request):
    user = request.user
    file_id = request.data['file_id']
    task_id = request.data['task_id']
    todoList=ToDoItem.objects.filter(user=user)
    task = ToDoItem.objects.get(pk=task_id)
    if task in todoList:
        taskFiles = ToDoItemFile.objects.filter(toDoItem = task)
        file = ToDoItemFile.objects.get(pk = file_id)
        if file in taskFiles:
            serializedFile = ToDoItemFileSerializer(file)
            localFile = open(settings.MEDIA_ROOT+serializedFile.data['file'],"rb")
            response = HttpResponse(localFile, content_type='')
            response['Content-Type'] = "application/octet-stream"
            response["Content-Disposition"] = f"attachment; filename={str(file.file).split('/')[-1]}"
            # response["Content-Type"] = "application/octet-stream"
            return response
    message = {'message':'No Authorization provided'}
    return Response(message, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def DeleteaTaskFile(request):
    user = request.user
    file_id = request.data['file_id']
    task_id = request.data['task_id']
    todoList=ToDoItem.objects.filter(user=user)
    task = ToDoItem.objects.get(pk=task_id)
    if task in todoList:
        taskFiles = ToDoItemFile.objects.filter(toDoItem = task)
        file = ToDoItemFile.objects.get(pk = file_id)
        if file in taskFiles:
            file.delete()
            message = {'message': 'Item no. '+str(task_id)+ " was deleted successfully!"}
            return Response(message, status=status.HTTP_200_OK)
    message = {'message': "No Authorization provided"}
    return Response(message, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def UploadTaskFile(request):
    user = request.user
    task_id = request.data['task_id']
    task = ToDoItem.objects.get(pk=task_id)
    file_to_upload = request.data['file']
    file = ToDoItemFile.objects.create(
        file=file_to_upload,
        toDoItem = task
    )
    serializedFile = ToDoItemFileSerializer(file, many=False)
    return Response(serializedFile.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ReplaceTask(request):
    user = request.user
    task = request.data
    todoList=ToDoItem.objects.filter(user=user)
    getDatabaseTask = ToDoItem.objects.get(pk=task["id"])
    if getDatabaseTask in todoList:
        getDatabaseTask.title=task["title"]
        getDatabaseTask.notes=task['notes']
        getDatabaseTask.isCompleted=task['isCompleted']
        if(task['isCompleted']):
            getDatabaseTask.completedAt=timezone.now()
        else:
            getDatabaseTask.completedAt=None
        getDatabaseTask.save()
        message = {"message":"Data has been updates successfully"}
        return Response(message, status=status.HTTP_200_OK)
    message = {'message': "No Authorization provided"}
    return Response(message, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def GetProfileAvatar(request):
    user = request.user
    profile = Profile.objects.filter(user=user)[0]
    serializedProfile = ProfileSerializer(profile, many=False)
    avatar = serializedProfile.data['avatar']
    localImage = open(settings.MEDIA_ROOT+avatar, "rb")
    localImageBase64 = base64.b64encode(localImage.read())
    response = HttpResponse(localImageBase64)
    response['Content-Type'] = "image/png"
    response['Cache-Control'] = "max-age=0"
    return response