from validate_email import validate_email
import re

def CheckEmail(email):
    return validate_email(email)

def CheckPassword(password):
    return re.search('[0-9]',password) and len(password) > 7 and re.search('[a-zA-Z]',password)

def CheckUsername(username):
    special_characters = "!@#$%^&*()-+?_=,<>/"
    return not " " in username and not any(c in special_characters for c in username) and len(username)>=4