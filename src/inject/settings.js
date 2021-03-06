/*
 * SPDX-License-Identifier: GPL-3.0-or-later

 * Copyright (C) 2019 Roman Erdyakov

 * This file is part of Exiletrade.
 * Exiletrade is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */



const electron = require("electron").remote;

const hotkey = require("./hotkey.js");
const resource = require("./resource.js").resource;

const path = require("path");
const url = require("url");

let settings;
const WIDTH = 250;
const HEIGHT = 100;

// function return x and y coordinates of mainwindow
// with considering WIDTH and HEIGHT  coordinates of settings window

function get_position(mainwindow)
{
	let main_position = mainwindow.getPosition();
	let main_size = mainwindow.getSize();

	let position = {
		x: main_position[0] + (main_size[0] / 2) - (WIDTH / 2),
		y: main_position[1] + (main_size[1] / 2) - (HEIGHT / 2)
	};

	return position;
}


function show(mainwindow)
{
	if (!mainwindow.isVisible()) {
		return;
	}
		
	if (settings != null) {
		settings.close();
		return;
	}
	
	let position = get_position(mainwindow);
	
	settings = new electron.BrowserWindow({ width: WIDTH, height: HEIGHT, alwaysOnTop: true,
	                                        backgroundColor: resource.title_color,
	                                        parent: mainwindow,
	                                        x: position.x,
	                                        y: position.y,
	                                        autoHideMenuBar: true,
	                                        frame: false,
	                                        webPreferences: {
		                                        nodeIntegration: true
	                                        }});

	settings.loadURL(url.format({ pathname: path.join(__dirname, "settings.html"),
	                              protocol: "file:",
	                              slashes:true
	                            }));
	
	settings.on("closed", () => { settings = null; });

	settings.webContents.on("dom-ready", () => {

		settings.send(hotkey.registered_msg(resource.settings.name),
		              hotkey.get_sequence(resource.settings.name));
		
		settings.send(hotkey.registered_msg(resource.toggle.name),
		              hotkey.get_sequence(resource.toggle.name));
	});
}

electron.ipcMain.on(hotkey.add_msg(),
                    function(event, name, sequence)
                    {
	                    if (hotkey.change_sequence(name, sequence)) {

		                    event.sender.send(hotkey.registered_msg(name), sequence);
	                    }
                    });

function close()
{
	if (settings != null) {
		settings.close();
	}
}

module.exports.show = show;
module.exports.close = close;
