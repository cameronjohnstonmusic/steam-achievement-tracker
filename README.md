If you like my work consider donating to support more projects!
https://ko-fi.com/cjxyz

Installing and Setting Up Steam Achievement Tracker Stream Overlay

See guide with images here: https://docs.google.com/document/d/1cOEb08vyI1qMYgD680Uwg1Z0VZ33Url84lMTWjTYfdE/edit?usp=sharing 

Getting Credentials 

There are a few pieces of information you need in order to connect the tracker to the proper game and account.

Steam API Key:
Get a steam api key by filling out this form
Save the API Key.

Getting Your Steam ID:
Every steam account has a numeric identifier that is different from your display name. You need to find that identifier in order to connect the app to your steam account
Go to your steam page url, copy the name after the “id” portion of the URL. In this example it is “itsjabo.”

Go to https://www.steamidfinder.com/ and enter your url name into the text field

Copy the steamID64(Dec) code

 Save this code for later.

Finding the Game ID:
Go to the steam page of the game you want to track
In the URL, copy the number following “app”

Save this code for later


Setting up the App
Installing:
Download from https://github.com/cameronjohnstonmusic/steam-achievement-tracker/releases
Install the relevant version from your platform. Both platform versions are in the zip file.
On MacOS open the .app file
On Windows open the downloaded folder and open the .exe
Note: keep the folder together. Do not pull the .exe out of that folder.
Connecting to Steam:
After opening, two windows will open: “tracker” and “_achievement tracker” 
The first is the display. This is what will be window captured and keyed out on your streaming software. The other window is the control window. Here you can edit the font of the text on the display window, and add parameters to connect to your steam account and game that will be tracked

Replace the information you found above in the three corresponding boxes.

Click the “reset script” button after.
The windows should update with the relevant information after a few seconds.

Saving and Loading:
Saving
The app does not automatically save your information.
You must click the “save” button. Save the file anywhere on your computer.
Once saved you can close the app.

Loading
Every time you open the app you can repopulate your information by loading the saved file. 
Click the “load” button. This will open a dialog box. Select your previously saved file.
After loading click the “reset script” button to start the script again.
The “Tracker” Window
Window Overflow
Depending on your display scaling and the length of the achievement name, the text may overflow off of the window.
You can change the size of the window to accommodate longer achievement names.

Font Style
Change the font of the text using the drop down menu under “font” on the “_achievement tracker window

Handling Windows
Using OBS window capture, the “tracker” window will only update on OBS when the window is not minimized. Do not minimize that window.
The “_achievement tracker” window can be minimized. Do not close the window as it will also close the “tracker” window.
