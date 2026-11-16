## Tools used in the makign of the prokect are :
- Java Jakarta REST API (Maven WAR) with Jakarta Security Basic Authentication
- Chrome Manifest V3 extension with side panel, right-click selected-text translation, copy, paste, and read-aloud
- React Native / Expo mobile client
- Postman collection
## Requirements:

- JDK 
- Maven 
- Payara Server 
- A Gemini API key 
- Node.js

.

## Starting th app 
 1. after extractign the file build the project then 
```powershell
$env:GEMINI_API_KEY="PASTE_YOUR_GEMINI_KEY_HERE"
$env:TRANSLATOR_USERNAME="translator"
$env:TRANSLATOR_PASSWORD="Oumnia123!" 
```
## username and password can be changed 
2. regarding paraya after installing it in powershell
```powershell
& "C:\payara6\bin\asadmin.bat" start-domain
```

```powershell
& "C:\payara6\bin\asadmin.bat" deploy "target\darija-translator.war"
```

`http://localhost:8080/darija-translator/api`

## The health function :

Health check (no login):

```powershell
curl.exe -i "http://localhost:8080/darija-translator/api/translator/health"
```

if returned result  is  `"status":"ok"`.
we can assume its working 
Translation test:
## at postman 
  1. finallize autentication
  2. post the URL : http://localhost:8080/darija-translator/api/translator/translate 
  3. add a body
  4. click send
  5. get results 

Expected success is HTTP 200 with JSON containing `translation`. 
## D. AT the level of Chrome extension

1. Make sure the REST API translation test above returns HTTP 200 first.
2. In Chrome, open `chrome://extensions`.
3. Turn on **Developer mode**.
4. Click **Load unpacked** and select the `chrome-extension` folder from the extracted project.
5. Select text on a webpage, right-click, and choose **Translate selection to Darija**.
6. The side panel should open and automatically translate the selected text.
7. Use the panel settings if the API URL or credentials differ. It also includes manual text entry, clipboard paste/copy, and browser text-to-speech.

The extension's default URL expects Payara on this same computer at port 8080. If the server runs on another computer, update the URL and add that host to `host_permissions` in `chrome-extension/manifest.json` before reloading the extension.

## Must note 

- The Gemini API key is required for real translations and must stay on the server; never put it in the Chrome extension or mobile app.
- The included credentials are for local coursework testing only.
- The extension's text-to-speech uses the browser's speech synthesis. It is not voice-to-voice translation.
- This is source code, not a deployed service: you still need to build the WAR, start Payara, configure your key, and deploy it.

## AI prompts used
- wouldn't it be smarter to use Postman instead of relyign on powershell and before intergrating the project with chrome?
- As gemini 3.8 shown to have a limit isnt it better to introduce a dictionary alongside the LLM, is addign it necessary or is using another version better as teh obkect of the project is to develop an LLM translaton service which ina way make dictionary though faster unnecessary in the devlopemnt and will make the system relay on them instead of the dual architecture i am aiming for.
- as i can see a lot of 503 errors can i say that these errors and failurs originate from service instability would testing then an alternative geminy help isolate the issue and open my eyes at a more reliable solution
- how should authentication be enforced so taht only authorized clients cn have access 
