from django.contrib import admin
from .models import ToDoItem, ToDoItemFile, Profile
# Register your models here.
admin.site.register(ToDoItem)
admin.site.register(ToDoItemFile)
admin.site.register(Profile)