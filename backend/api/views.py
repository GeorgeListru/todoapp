from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer, MyTokenObtainPairSerializer,UserSerializerWithToken, ToDoItemSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import ToDoItem

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
        toModifyItem.save()
        serializedToDoItem = ToDoItemSerializer(toModifyItem, many=False)
        return Response(serializedToDoItem.data)
    message = {'message':'No Authorization provided'}
    return Response(message, status=status.HTTP_400_BAD_REQUEST)
