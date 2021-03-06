from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
import os

def profile_directory_path(instance, filename):
    print(filename.split('/')[-1])
    return 'user_{0}/profile/{1}'.format(instance.user.id, "Avatar."+instance.get_avatar_type())
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=False)
    avatar = models.ImageField(default="default_avatar.png", upload_to=profile_directory_path)

    def __str__(self):
        return "Profile: " + self.user.username
    def get_avatar_name(self):
        return os.path.basename(self.avatar.path)
    def get_avatar_path(self):
        return self.avatar.path
    def get_avatar_type(self):
        return str(os.path.basename(self.avatar.path)).split('.')[-1]

class ToDoItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=False)
    title = models.CharField(max_length=100, blank=False, null=False)
    notes = models.TextField(max_length=999, blank=True, null=True)
    isCompleted = models.BooleanField(default=False, null=False)
    createdAt = models.DateTimeField(auto_now_add=True)
    completedAt = models.DateTimeField(blank=True, null=True, auto_now_add=False)

    def __str__(self):
        return self.user.username + ": Task_" + str(self.pk)

def task_directory_path(instance, filename):
    return 'user_{0}/tasks/task_{1}/{2}'.format(instance.toDoItem.user.id, instance.toDoItem.id, filename)
class ToDoItemFile(models.Model):
    toDoItem = models.ForeignKey(ToDoItem, on_delete=models.CASCADE, null=False)
    file = models.FileField(blank=True, null=True, upload_to=task_directory_path)

    def __str__(self):
        return self.toDoItem.user.username + ": "+self.toDoItem.title+": File_"+str(self.id)

    def get_file_name(self):
        return os.path.basename(self.file.path)
    def get_file_path(self):
        return self.file.path