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
from django.template.loader import render_to_string
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
    try:
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
                localFile = open(file.get_file_path(),"rb")
                response = HttpResponse(localFile, content_type='')
                response['Content-Type'] = "application/octet-stream"
                response["Content-Disposition"] = f"attachment; filename={file.get_file_name()}"
                return response
            message = {'detail': 'File no. '+str(file_id)+ " does not exist"}
            return Response(message, status=status.HTTP_400_BAD_REQUEST)
        message = {'detail': 'File no. '+str(file_id)+ " does not exist"}
        return Response(message, status=status.HTTP_400_BAD_REQUEST)
    except:
        message = {'detail':'We can\'t process your request'}
        return Response(message, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def DeleteTaskFile(request):
    try:
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
            message = {'detail': 'File no. '+str(file_id)+ " does not exist"}
            return Response(message, status=status.HTTP_400_BAD_REQUEST)
        message = {'detail': 'Item no. '+str(file_id)+ " does not exist"}
        return Response(message, status=status.HTTP_400_BAD_REQUEST)
    except:
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
    try:
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
            message = {"detail":"Data has been updates successfully"}
            return Response(message, status=status.HTTP_200_OK)
        message = {'detail': 'Item no. '+str(file_id)+ " does not exist"}
        return Response(message, status=status.HTTP_200_OK)
    except:
        message = {'detail': "We can\'t process your request"}
        return Response(message, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def GetProfileAvatar(request):
    try:
        user = request.user
        profile = Profile.objects.filter(user=user)[0]
        serializedProfile = ProfileSerializer(profile, many=False)
        avatar = serializedProfile.data['avatar']
        localImage = open(settings.MEDIA_ROOT+avatar, "rb")
        localImageBase64 = base64.b64encode(localImage.read())
        response = HttpResponse(localImageBase64)
        response['Content-Type'] = "image/"+profile.get_avatar_type()
        response['Cache-Control'] = "max-age=0"
        return response
    except:
        message = {'detail': "We can\'t process your request"}
        return Response(message, status=status.HTTP_400_BAD_REQUEST)

def save_temp_image_from_base64(imageString, user, filetype):
    if not os.path.exists(settings.TEMP):
        os.mkdir(settings.TEMP)
    if not os.path.exists(settings.TEMP+'/user'+str(user.pk)):
        os.mkdir(settings.TEMP+'/user'+str(user.pk))
    url = os.path.join(settings.TEMP+'/user'+str(user.pk), 'TEMP_PROFILE_IMG.'+filetype.replace('image/',''))
    storage = FileSystemStorage(location=url)
    image = base64.b64decode(imageString)
    file_to_save = open(url , 'wb+')
    file_to_save.write(image)
    file_to_save.close()
    return url

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def SaveProfileAvatar(request):
    try:
        user = request.user
        data = request.data
        filetype = data.get('filetype')
        filename = data.get('filename')
        file = data.get('file')

        profile = Profile.objects.filter(user=user)[0]

        base64Image = data['image'].replace(f'data:{filetype};base64,', '')
        saved_image_url = save_temp_image_from_base64(base64Image, user, filetype)
        image = cv2.imread(saved_image_url)

        cropX = int(data['cropX'])
        cropY = int(data['cropY'])
        cropWidth = int(data['cropWidth'])
        cropHeight = int(data['cropHeight'])
        if cropX < 0: cropX = 0
        if cropY < 0: cropY = 0

        croppedImage = image[cropY: cropY + cropWidth, cropX: cropX + cropWidth]
        cv2.imwrite(saved_image_url, croppedImage)
        profile.avatar.delete()
        profile.avatar = files.File(open(saved_image_url, 'rb'))
        profile.save()
        os.remove(saved_image_url)

        serializedProfile = ProfileSerializer(profile, many=False)
        avatar_location = profile.get_avatar_path()

        localImage = open(avatar_location, "rb")
        localImageBase64 = base64.b64encode(localImage.read())
        response = HttpResponse(localImageBase64)
        response['Content-Type'] = "image/"+profile.get_avatar_type()
        response['Cache-Control'] = "max-age=0"
        return response
    except:
        message = {'detail': "We can\'t process your request"}
        return Response(message, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def changeEmail(request):
    try:
        user = request.user
        if user.check_password(request.data.get('password')):
            user.email = request.data.get('newEmail')
            user.save()
            serializedUser = UserSerializer(user, many = False)
            return Response(serializedUser.data)
        message = {'detail': "The entered password is incorrect"}
        return Response(message, status=status.HTTP_400_BAD_REQUEST)
    except:
        message = {'detail': "We can\'t process your request"}
        return Response(message, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def changePassword(request):
    try:
        user = request.user
        old_password = user.get('oldPassword')
        new_password = user.get('newPassword')
        if user.check_password(old_password):
            if CheckPassword(old_password):
                user.password = make_password(new_password)
                user.save()
                message = {"detail": "Password changed successfully!"}
                return Response(message, status=status.HTTP_200_OK)
            message = {'detail': "8 characters (including 1 digit) required"}
            return Response(message, status=status.HTTP_400_BAD_REQUEST)
        message = {'detail': "The old password is incorrect"}
        return Response(message, status=status.HTTP_400_BAD_REQUEST)
    except:
        message = {'detail': "We can\'t process your request"}
        return Response(message, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def passwordForgot(request):
    try:
        data=request.data
        email = data.get('email')
        if User.objects.filter(email=email).exists():
            user = User.objects.filter(email=email)[0]
            token = default_token_generator.make_token(user)
            website=data.get('frontend_website')
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            url = website + "/resetpassword/" +uid+'/'+token

            template = render_to_string('PasswordResetTemplate.html', {'name':user.username, 'reset_link':url})
            mail_sent = send_mail(subject="todoapp | Reset your password", message=None, from_email=settings.EMAIL_HOST_USER,
            recipient_list=[user.email,], fail_silently=False, html_message=template)
            message = {"detail": "Email has been sent successfully!"}
            return Response(message, status=status.HTTP_200_OK)
        message = {'detail': "The entered email does not exist"}
        return Response(message, status=status.HTTP_400_BAD_REQUEST)
    except:
        message = {'detail': "We can\'t process your request"}
        return Response(message, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def resetPassword(request):
    try:
        data=request.data
        password = data.get('password')
        uid = force_str(urlsafe_base64_decode(data.get('uid')))
        token = data.get('token')
        user = User.objects.get(pk=uid)
        if default_token_generator.check_token(user, token):
            if CheckPassword(password):
                user.password = make_password(password)
                user.save()
                message = {"detail": "Password changed successfully!"}
                return Response(message, status=status.HTTP_200_OK)
            message = {"detail": "8 characters (including 1 digit) required"}
            return Response(message, status=status.HTTP_200_OK)
        message = {"detail": "The provided authorization is not valid"}
        return Response(message, status=status.HTTP_200_OK)
    except:
        message = {'detail': "We can\'t process your request"}
        return Response(message, status=status.HTTP_400_BAD_REQUEST)