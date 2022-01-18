from django.db import models
from django.contrib.auth.models import User

class ToDoItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=False)
    title = models.CharField(max_length=100, blank=False, null=False)
    isCompleted = models.BooleanField(default=False, null=False)
    createdAt = models.DateTimeField(auto_now_add=True)
    completedAt = models.DateTimeField(blank=True, null=True, auto_now_add=False)

    def __str__(self):
        if len(self.title)>25:
            return self.user.username +": " + self.title+"..."
        return self.user.username +": " + self.title

class ToDoItemFile(models.Model):
    toDoItem = models.ForeignKey(ToDoItem, on_delete=models.CASCADE, null=False)
    file = models.FileField(blank=True, null=True)