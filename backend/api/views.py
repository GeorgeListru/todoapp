from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer, MyTokenObtainPairSerializer,UserSerializerWithToken,\
 ToDoItemSerializer, ToDoItemFileSerializer, ProfileSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import ToDoItem, ToDoItemFile, Profile
from django.contrib.auth.tokens import default_token_generator
from django.utils import timezone
from django.http import HttpResponse
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.core.mail import send_mail
from django.core import files
from PIL import Image
import base64
import os
import cv2
from .validators import CheckEmail, CheckUsername, CheckPassword

@api_view(['POST'])
def RegisterUser(request):
    try:
        data = request.data
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        if not CheckEmail(email):
            message = {"detail": "The email is invalid"}
            return Response(message, status=status.HTTP_409_CONFLICT)
        if not CheckPassword(password):
            message = {"detail": "The password is invalid"}
            return Response(message, status=status.HTTP_409_CONFLICT)
        if not CheckUsername(username):
            message = {"detail": "The username is invalid"}
            return Response(message, status=status.HTTP_409_CONFLICT)
        if User.objects.filter(username=username).exists():
            message = {"detail": "The username is already used"}
            return Response(message, status=status.HTTP_409_CONFLICT)
        if User.objects.filter(email=email).exists():
            message = {"detail": "The email is already used"}
            return Response(message, status=status.HTTP_409_CONFLICT)

        user = User.objects.create(
            username = username,
            email = email,
            password = make_password(password)
        )
        Profile.objects.create(user = user)
        serializer = UserSerializerWithToken(user, many=False)
        return Response(serializer.data)
    except:
        message = {'detail':'We can\'t process your request'}
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
    try:
        user = request.user
        if User.objects.filter(pk=user.id).exists():
            todoList=ToDoItem.objects.filter(user= user).order_by('-createdAt')
            listSerializer = ToDoItemSerializer(todoList, many=True)
            return Response(listSerializer.data)
        message={'detail':'The user does not exist'}
        return Response(message, status=status.HTTP_400_BAD_REQUEST)
    except:
        message={'detail':'We can\'t process your request'}
        return Response(message, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def AddInToDoList(request):
    try:
        user = request.user
        data = request.data
        todoItem = ToDoItem.objects.create(
            user=user,
            title = data['title'],
        )
        serializedToDoItem = ToDoItemSerializer(todoItem, many=False)
        return Response(serializedToDoItem.data)
    except:
        message={'detail':'We can\'t process your request'}
        return Response(message, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def RemoveItemFromToDoList(request):
    try:
        user = request.user
        item_id = request.data['id']
        todoList=ToDoItem.objects.filter(user=user)
        toDeleteItem = ToDoItem.objects.get(pk=item_id)
        if toDeleteItem in todoList:
            toDeleteItem.delete()
            message = {'detail': 'Item no. '+str(item_id)+ " was deleted successfully"}
            return Response(message, status=status.HTTP_200_OK)
        message = {'detail': 'Item no. '+str(item_id)+ " does not exist"}
        return Response(message, status=status.HTTP_409_CONFLICT)
    except:
        message={'detail':'We can\'t process your request'}
        return Response(message, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ChangeCompletedStatus(request):
    try:
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
        message = {'detail': 'Item no. '+str(item_id)+ " does not exist"}
        return Response(message, status=status.HTTP_400_BAD_REQUEST)
    except:
        message = {'detail':'We can\'t process your request'}
        return Response(message, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def GetToDoListItem(request):
    try:
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
        message = {'detail': 'Item no. '+str(item_id)+ " does not exist"}
        return Response(message, status=status.HTTP_400_BAD_REQUEST)
    except:
        message = {'detail':'We can\'t process your request'}
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
            response["Content-Disposition"] = f"attachment; filename={file.get_file()}"
            return response
    message = {'detail':'We can\'t process your request'}
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
            message = {'detail': 'Item no. '+str(task_id)+ " was deleted successfully!"}
            return Response(message, status=status.HTTP_200_OK)
    message = {'detail': "We can\'t process your request"}
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
    message = {'detail': "We can\'t process your request"}
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

def save_temp_image_from_base64(imageString, user):
    if not os.path.exists(settings.TEMP):
        os.mkdir(settings.TEMP)
    if not os.path.exists(settings.TEMP+'/user'+str(user.pk)):
        os.mkdir(settings.TEMP+'/user'+str(user.pk))
    url = os.path.join(settings.TEMP+'/user'+str(user.pk), 'TEMP_PROFILE_IMG.png')
    storage = FileSystemStorage(location=url)
    image = base64.b64decode(imageString)
    file_to_save = open(url , 'wb+')
    file_to_save.write(image)
    file_to_save.close()
    return url

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def SaveProfileAvatar(request):
    user = request.user
    data = request.data
    profile = Profile.objects.filter(user=user)[0]
    
    base64Image = data['image'].replace('data:image/png;base64,', '')
    saved_image_url = save_temp_image_from_base64(base64Image, user)
    image = cv2.imread(saved_image_url)

    cropX = int(float(str(data['cropX'])))
    cropY = int(float(str(data['cropY'])))
    cropWidth = int(float(str(data['cropWidth'])))
    cropHeight = int(float(str(data['cropHeight'])))
    print(cropX, cropY, cropWidth, cropHeight)
    if cropX < 0: cropX = 0
    if cropY < 0: cropY = 0

    croppedImage = image[cropY: cropY + cropHeight, cropX: cropX + cropWidth]
    cv2.imwrite(saved_image_url, croppedImage)
    profile.avatar.delete()
    profile.avatar = files.File(open(saved_image_url, 'rb'))
    profile.save()
    os.remove(saved_image_url)

    serializedProfile = ProfileSerializer(profile, many=False)
    avatar_location = serializedProfile.data['avatar']
    
    localImage = open(settings.MEDIA_ROOT+avatar_location, "rb")
    localImageBase64 = base64.b64encode(localImage.read())
    response = HttpResponse(localImageBase64)
    response['Content-Type'] = "image/png"
    response['Cache-Control'] = "max-age=0"
    return response

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def changeEmail(request):
    user = request.user
    if user.check_password(request.data.get('password')):
        user.email = request.data.get('newEmail')
        user.save()
        serializedUser = UserSerializer(user, many = False)
        return Response(serializedUser.data)
    message = {'detail': "We can\'t process your request"}
    return Response(message, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def changePassword(request):
    user = request.user
    if user.check_password(request.data.get('oldPassword')):
        user.password = make_password(request.data.get('newPassword'))
        user.save()
        message = {"message": "Password changes successfully!"}
        return Response(message, status=status.HTTP_200_OK)
    message = {'detail': "We can\'t process your request"}
    return Response(message, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def passwordForgot(request):
    data=request.data
    email = data.get('email')
    if User.objects.filter(email=email).exists():
        user = User.objects.filter(email=email)[0]
        if user.email == email:
            token = default_token_generator.make_token(user)
            website=data.get('frontend_website')
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            url = website + "/resetpassword/" +uid+'/'+token
            mail_sent = send_mail("Password Reset", url, settings.EMAIL_HOST_USER, [
                                    user.email], fail_silently=False)
            message = {"message": "Email has been sent successfully!"}
            return Response(message, status=status.HTTP_200_OK)
    message = {'detail': "We can\'t process your request"}
    return Response(message, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def resetPassword(request):
    data=request.data
    password = data.get('password')
    uid = force_str(urlsafe_base64_decode(data.get('uid')))
    token = data.get('token')
    user = User.objects.get(pk=uid)
    if default_token_generator.check_token(user, token):
        user.password = make_password(password)
        user.save()
        message = {"message": "Password changed successfully!"}
        return Response(message, status=status.HTTP_200_OK)
    message = {'detail': "We can\'t process your request"}
    return Response(message, status=status.HTTP_400_BAD_REQUEST)