#!/bin/bash

sudo npm install
bower install
rm -rf dist
gulp
sudo chown -R $USER: dist
sudo chmod -R 777 dist
sudo service nginx restart
