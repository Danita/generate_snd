#!/usr/bin/env node

/*
 * Build sound attachments according to ATTR_manip_* commands
 * Author: Daniela Rodriguez Careri <dcareri@gmail.com>
 */

const
	fs = require('fs'),
	path = require('path'),
	util = require('util'),
	Commander = require('commander')
;

function commandStrategy(params) {
	return 'SARASA';
}

/**
 * Configure according to the FMOD events you want to use
 */
const events = {
	BUTTON: '/model/b732/equipment/switches/switch_metal_3',
	ROTARY_SMALL: '/model/b732/equipment/switches/switch_rotary_1',
	ROTARY_MEDIUM: '/model/b732/equipment/switches/switch_rotary_1',
	ROTARY_LARGE: '/model/b732/equipment/switches/switch_rotary_1',
	SWITCH: '/model/b732/equipment/switches/switch_metal_1',
};

const strategiesByManipType = {
	'ATTR_manip_command': commandStrategy,
	'ATTR_manip_command_axis': commandStrategy,
	'ATTR_manip_push': commandStrategy,
	'ATTR_manip_toggle': commandStrategy,
	'ATTR_manip_delta': commandStrategy,
	'ATTR_manip_wrap': commandStrategy,
	'ATTR_manip_wheel': commandStrategy,
	'ATTR_manip_command_knob': commandStrategy,
	'ATTR_manip_switch_up_down': commandStrategy,
	'ATTR_manip_switch_left_right': commandStrategy,
	'ATTR_manip_axis_knob': commandStrategy,
	'ATTR_manip_axis_switch_up_down': commandStrategy,
	'ATTR_manip_axis_switch_left_right': commandStrategy,
};

const cursors = {
	'four_arrows': events.BUTTON,
	'hand': events.BUTTON,
	'button': events.BUTTON,
	'rotate_small': events.ROTARY_SMALL,
	'rotate_small_left': events.ROTARY_SMALL,
	'rotate_small_right': events.ROTARY_SMALL,
	'rotate_medium': events.ROTARY_MEDIUM,
	'rotate_medium_left': events.ROTARY_MEDIUM,
	'rotate_medium_right': events.ROTARY_MEDIUM,
	'rotate_large': events.ROTARY_LARGE,
	'rotate_large_left': events.ROTARY_LARGE,
	'rotate_large_right': events.ROTARY_LARGE,
	'up_down': events.SWITCH,
	'down': events.SWITCH,
	'up': events.SWITCH,
	'left_right': events.SWITCH,
	'right': events.SWITCH,
	'left': events.SWITCH,
	'arrow': events.SWITCH
};

function getManips(filename) {
	let ret = [];
	let lines = fs.readFileSync(filename).toString().replace(/\r\n/g,'\n').replace(/\r/g,'\n').split('\n');
	lines.forEach(function(l) {
		l = l.trim();
		if (l.includes('ATTR_manip')) {
			ret.push(l);
		}
	});
	return ret;
}

function buildAttachment(line) {
	let
		ret = null,
		parts = line.split(/\s+/g),
		manipType = parts[0],
		strategyFn = strategiesByManipType[manipType]
	;
	if (strategyFn) {
		ret = strategyFn(parts.slice(1));
	}
	return ret;
}

let filename;

Commander
	.version('1.0.0')
	.arguments('<ObjFilename>')
	.action(function (ObjFilename) {
		filename = ObjFilename;
	})
	.parse(process.argv);

let manips = getManips(filename);
console.log(`# Read ${manips.length} manipulators from file ${filename}.`);
let attachments = manips.map(line => buildAttachment(line)).filter(att => { return att !== null});
console.log(`# Built ${attachments.length} attachments.`);

console.log(attachments.forEach(att => console.log(att)));

// console.log(exports);
// console.log(entities);
// process.exit(1);
