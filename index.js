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

/**
 * Generic event names
 * Configure according to the FMOD events you want to use
 * @type {object}
 */
const events = {
	BUTTON: '/model/b732/equipment/switches/switch_metal_3',
	ROTARY_SMALL: '/model/b732/equipment/switches/switch_rotary_1',
	ROTARY_MEDIUM: '/model/b732/equipment/switches/switch_rotary_1',
	ROTARY_LARGE: '/model/b732/equipment/switches/switch_rotary_1',
	SWITCH: '/model/b732/equipment/switches/switch_metal_1',
};

/**
 * Which cursor types should trigger which events
 * @type {object}
 */
const eventsByCursorType = {
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

function commandStrategy(params) {
	let event = eventsByCursorType[params[0]],
		dref = params[1];

	return '';
	console.log(params);
	// return 'SARASA';
}

/**
 * Which strategy function should be used with which manipulator type
 * @type {object}
 */
const strategiesByManipType = {
	'ATTR_manip_command': commandStrategy,
	// 'ATTR_manip_command_axis': commandStrategy,
	// 'ATTR_manip_push': commandStrategy,
	// 'ATTR_manip_toggle': commandStrategy,
	// 'ATTR_manip_delta': commandStrategy,
	// 'ATTR_manip_wrap': commandStrategy,
	// 'ATTR_manip_wheel': commandStrategy,
	// 'ATTR_manip_command_knob': commandStrategy,
	// 'ATTR_manip_switch_up_down': commandStrategy,
	// 'ATTR_manip_switch_left_right': commandStrategy,
	// 'ATTR_manip_axis_knob': commandStrategy,
	// 'ATTR_manip_axis_switch_up_down': commandStrategy,
	// 'ATTR_manip_axis_switch_left_right': commandStrategy,
};

/**
 * Read valid lines from .obj filename
 * @param filename
 * @returns Array {idx: number, text: string}
 */
function getManips(filename) {
	let ret = [];
	let lines = fs.readFileSync(filename).toString().replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
	for (let i = 0; i < lines.length; i++) {
		let l = lines[i];
		l = l.trim();
		if (l.includes('ATTR_manip')) {
			ret.push({
				idx: i,
				text: l
			});
		}
	}
	return ret;
}

/**
 * Build attachment for a single line
 * @param line
 * @returns {*}
 */
function buildAttachment(line) {
	let
		ret = null,
		parts = line.text.split(/\s+/g),
		manipType = parts[0],
		strategyFn = strategiesByManipType[manipType]
	;
	if (strategyFn) {
		ret = `# ${filename} line ${line.idx}
BEGIN_SOUND_ATTACHMENT
	VEH_PART cockpit 0
${strategyFn(parts.slice(1))}
END_SOUND_ATTACHMENT
`;
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
// manips = manips.slice(0,5); // fixme
let attachments = manips.map(line => buildAttachment(line)).filter(att => {
	return att !== null
});
console.log(`# Built ${attachments.length} attachments.`);
console.log();
console.log(attachments.forEach(att => console.log(att)));

process.exit(1);
