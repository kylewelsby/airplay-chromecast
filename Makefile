VERSION=0.33.9
build:
	  make build_mac
		make build_win

build_mac:
	  ./node_modules/.bin/electron-packager . 'AirPlay Chromecast' --platform=darwin --arch=all --version=${VERSION} --icon=AirPlay-ChromeCast.icns --overwrite
build_win:
		./node_modules/.bin/electron-packager . 'Airplay Chromecast' --platform=win32 --arch=all --version=${VERSION} --icon=AirPlay-ChromeCast.ico --overwrite
