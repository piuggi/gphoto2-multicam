Gphoto2 Multi-Cam
===

Visit the front-end experience to view photos in your browser at http://localhost:8080.

###Installation

**Install Homebrew**

```
$ ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
$ brew doctor

```

**Install gphoto2, git, mongodb**

```
$ brew install gphoto2 git mongodb

```

**Setup MongoDB**

```
$ launchctl unload ~/Library/LaunchAgents/homebrew.mxcl.mongodb.plist
$ launchctl load ~/Library/LaunchAgents/homebrew.mxcl.mongodb.plist
$ mongo --version

```

**Install NVM and Node** -
*set them to auto start on login*

```
$ curl https://raw.githubusercontent.com/creationix/nvm/v0.23.3/install.sh | bash
$ nvm --version
$ nvm install 0.10
$ echo "#!/bin/sh" >> ~/.bash_profile
$ echo "[ -s $HOME/.nvm/nvm.sh ] && . $HOME/.nvm/nvm.sh" >> ~/.bash_profile
$ echo "nvm use 0.10" >> ~/.bash_profile
$ source ~/.bash_profile
```

** Setup gPhoto2 **

```
$ vim ~/.gphoto/settings

gphoto2=model=Canon EOS 1100D
gphoto2=port=usb:020,017
libgphoto=cached-images=2

```

Change `libgphoto=cached-images=2` to `libgphoto=cached-images=0` then save & quit `ESC :WQ`

---

###Start-up Instructions

```
$ cd /path/to/repo
$ npm install gulp -g   #if not already installed
$ npm install           #local dependencies
$ gulp                  #execute

```

###Notes:

Be sure to global.REMOTE_PATH variable app/index.js line 29. To a folder which contains approved,hearted and social folders.
