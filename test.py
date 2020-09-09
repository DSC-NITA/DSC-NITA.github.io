import base64
# link = 'https://forms.gle/9S22816WiBEyAMzf7'
# link = b'http://dscnita.github.io/oldIndex.html'
# a = base64.b64encode(link)
# print(a)
# b'aHR0cDovL2RzY25pdGEuZ2l0aHViLmlvL29sZEluZGV4Lmh0bWw='

ans = base64.b64decode(b'aHR0cDovL2RzY25pdGEuZ2l0aHViLmlvL29sZEluZGV4Lmh0bWw=')
print(ans)